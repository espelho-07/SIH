import os
import sys
import time
import json
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from typing import Dict, List, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

from database.mongo_manager import mongo_manager
from ml_models.disease_classifier import DiseasePredictor, MODEL_PATH, KB_FILE
from nlp.intent_extractor import intent_extractor

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash"]

SYSTEM_INSTRUCTION = """You are the AI Healthcare Assistant for a Smart India Hackathon (SIH) healthcare platform.
Your primary role is to assist citizens, healthcare workers, and patients by providing helpful, grounded, and hyper-relevant healthcare information.

You will be provided with:
1. User Query
2. Extracted Clinical Intent & Entities
3. Retrieved Database Context from our MongoDB Atlas database (hospitals, medicine stocks, hospital services, verified disease profiles, patient EHR)
4. ML Differential Classifier Predictions (ONLY provided when user reports symptoms or an emergency)
5. Emergency Triage Status

### STRICT OPERATIONAL RULES:
1. RELEVANCE & ACCURACY:
   - Stay LASER-FOCUSED on what the user actually asked.
   - If the user asks about MEDICINE availability or stock, talk ONLY about the medicine, its stock in our hospitals, and safe medicine use. DO NOT start diagnosing diseases or bringing up unrelated illnesses like diverticulitis or pneumonia!
   - If the user asks about HOSPITALS or SERVICES, talk ONLY about facility location, operating hours, phone numbers, and available services.
   - If the user describes SYMPTOMS (e.g. "I have fever and headache"), THEN discuss differential possibilities from the ML predictions.
   - If the user asks about PATIENT EHR (e.g. PAT-1001), discuss only that patient's actual conditions and allergies from the database.

2. GROUNDING & FACTUALITY:
   - Only state hospital names, medicine availability, stock counts, service offerings, and patient history that explicitly exist in the provided DATABASE CONTEXT.
   - If an item (e.g. a specific medicine or hospital) is NOT in the database, explicitly state: "This item is not present in our project database records."
   - NEVER invent hospital phone numbers, addresses, bed counts, or medicine stock.
   - NEVER invent or assume patient history.

3. CLINICAL SAFETY & ETHICS:
   - You are an informational assistant, NOT a doctor. Never state an absolute medical diagnosis.
   - NEVER provide unprescribed dosage instructions for prescription pharmaceuticals (Schedule H / antibiotics). Recommend consulting a physician.
   - If emergency symptoms are present (crushing chest pain, severe dyspnea, stroke signs, coughing/vomiting blood), prioritize the EMERGENCY WARNING section above all else.

4. RESPONSE FORMAT:
   You MUST organize your response clearly using these markdown headers:

   ### Understanding
   (1 concise sentence stating what the user is asking)

   ### Relevant Information
   (Exact information retrieved from the project database: facility details, verified medicine stocks with exact unit numbers, operating hours, service fees in INR, or patient EHR facts. If not found in DB, state so clearly.)

   ### Possible Considerations
   (Context-specific medical insights:
    - For SYMPTOM queries:
      * Clearly list the Top differential disease candidates and their exact probability match percentage from our ML model (e.g. "Flu / Influenza: ~58.8% match", "Strep Throat: ~28.4% match").
      * Explain the common causes and key lifestyle care (hydration, rest, steam inhalation, monitoring temperature).
      * Explicitly emphasize that these are probabilistic considerations from our machine learning model and not a definitive diagnosis.
    - For MEDICINE queries: Discuss the medicine's therapeutic category, mild side effects, standard precautions, and not self-prescribing.
    - For HOSPITAL/SERVICE queries: Practical advice on visiting the facility (OPD timings, documents/ABHA card to carry).
    - For PATIENT queries: Clinical implications of their chronic conditions or allergies.)

   ### Recommended Next Step
   (Safe, practical, actionable next step: e.g., visiting the specific facility during operating hours, consulting a medical officer, or speaking with a pharmacist.)

   ### Emergency Warning
   (ONLY include this section if red-flag symptoms or critical emergency conditions are present. Detail urgent actions like calling 108 or visiting the nearest trauma center.)

5. LANGUAGE MATCHING:
   - If the user writes or queries in Gujarati (or Gujlish), respond in polite, clear Gujarati so the user understands naturally.
   - If the user writes in English, respond in clear English.

6. NON-HEALTHCARE / IRRELEVANT QUERIES:
   - If the user asks about sports, entertainment, coding, politics, or non-health topics, politely state that you are specialized exclusively as a healthcare assistant.
"""

class HealthcareRAGEngine:
    """End-to-end RAG orchestrator integrating MongoDB, ML classifier, and Gemini models."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = PRIMARY_MODEL):
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name
        self.genai_client = None
        self.ml_predictor = None
        self._init_services()

    def _init_services(self):
        # Initialize Gemini client
        if self.api_key:
            try:
                self.genai_client = genai.Client(api_key=self.api_key)
                logger.info(f"Gemini client initialized with model {self.model_name}.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self.genai_client = None

        # Initialize ML model
        try:
            if os.path.exists(MODEL_PATH):
                self.ml_predictor = DiseasePredictor(MODEL_PATH, KB_FILE)
                logger.info("ML Disease Predictor initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize ML Predictor: {e}")
            self.ml_predictor = None

    def retrieve_context(self, analysis: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Gathers grounded context from MongoDB Atlas and ML model based on detected intent.
        """
        intent = analysis["intent"]
        entities = analysis["entities"]
        is_emergency = analysis["is_emergency"]

        context_bundle = {
            "hospitals": [],
            "medicines": [],
            "medicine_stock": [],
            "services": [],
            "diseases": [],
            "patient_record": None,
            "ml_predictions": None,
            "sources": []
        }

        # 1. ML Differential Diagnosis ONLY if user is asking for symptom diagnosis or emergency
        symptoms = entities.get("symptoms", [])
        if (intent in ["SYMPTOM_DIAGNOSIS", "EMERGENCY"] or is_emergency) and self.ml_predictor and symptoms:
            ml_res = self.ml_predictor.predict(symptoms, top_k=4)
            context_bundle["ml_predictions"] = ml_res
            context_bundle["sources"].append("ML: DifferentialClassifier (Trained on 163k instances)")

            # Retrieve disease profiles for top predictions
            for pred in ml_res.get("top_predictions", []):
                d_doc = mongo_manager.get_disease_knowledge(pred["disease"])
                if d_doc:
                    context_bundle["diseases"].append(d_doc)
            if context_bundle["diseases"]:
                context_bundle["sources"].append("MongoDB: healthcare_db.diseases")

        # 2. Disease info / precaution intent
        for d in entities.get("diseases", []):
            d_doc = mongo_manager.get_disease_knowledge(d)
            if d_doc and d_doc not in context_bundle["diseases"]:
                context_bundle["diseases"].append(d_doc)
                if "MongoDB: healthcare_db.diseases" not in context_bundle["sources"]:
                    context_bundle["sources"].append("MongoDB: healthcare_db.diseases")

        # 3. Medicine & Stock lookup
        query_text = analysis["query"]
        district = None
        for d_candidate in ["rajkot", "gondal", "jetpur", "morbi"]:
            if d_candidate in query_text.lower():
                district = d_candidate
                break

        if intent in ["MEDICINE_QUERY", "SYMPTOM_DIAGNOSIS"] or entities.get("medicines") or "medicine" in query_text.lower():
            med_terms = list(entities.get("medicines", []))
            
            # Map symptom terms directly to supportive catalog medicines
            SYMPTOM_MED_MAP = {
                "fever": "paracetamol",
                "high fever": "paracetamol",
                "headache": "paracetamol",
                "body ache": "paracetamol",
                "cough": "cetirizine",
                "sore throat": "paracetamol",
                "diarrhea": "ors",
                "vomiting": "ors",
                "dehydration": "ors",
                "watery diarrhea": "ors",
                "stomach pain": "ors",
                "runny nose": "cetirizine",
                "sneezing": "cetirizine",
                "allergy": "cetirizine"
            }
            for sym in symptoms:
                mapped = SYMPTOM_MED_MAP.get(sym.lower())
                if mapped and mapped not in [m.lower() for m in med_terms]:
                    med_terms.append(mapped)

            # Check for medical indications in query (e.g. dehydration, fever, pain, diarrhea)
            for indication in ["dehydration", "fever", "pain", "diarrhea", "infection", "cough", "allergy"]:
                if indication in query_text.lower():
                    for m in mongo_manager.search_medicines(indication):
                        if m["name"] not in med_terms:
                            med_terms.append(m["name"])

            # Check known candidate names in query text
            for candidate in ["paracetamol", "amoxicillin", "ors", "metformin", "cetirizine", "ciprofloxacin"]:
                if candidate in query_text.lower() and candidate not in [m.lower() for m in med_terms]:
                    med_terms.append(candidate)

            if med_terms:
                for m in med_terms:
                    stock = mongo_manager.check_medicine_stock(m, district=district)
                    if stock:
                        context_bundle["medicine_stock"].extend(stock)
                        if "MongoDB: healthcare_db.hospitalmedicines" not in context_bundle["sources"]:
                            context_bundle["sources"].append("MongoDB: healthcare_db.hospitalmedicines")
            elif intent == "MEDICINE_QUERY":
                med_list = mongo_manager.search_medicines(limit=5)
                context_bundle["medicines"].extend(med_list)
                if med_list and "MongoDB: healthcare_db.medicines" not in context_bundle["sources"]:
                    context_bundle["sources"].append("MongoDB: healthcare_db.medicines")

        # 4. Hospital Services lookup
        if intent == "HOSPITAL_SERVICE" or entities.get("services") or any(w in query_text.lower() for w in ["service", "maternal", "gynecology", "opd", "child care", "x-ray", "icu"]):
            service_terms = list(entities.get("services", []))
            for cand in ["maternal care", "maternal", "gynecology", "general opd", "opd", "child care", "x-ray", "icu", "immunization", "orthopedic"]:
                if cand in query_text.lower() and cand not in service_terms:
                    service_terms.append(cand)

            for sq in (service_terms or [query_text]):
                services = mongo_manager.search_hospital_services(service_query=sq)
                if services:
                    context_bundle["services"].extend(services)
                    if "MongoDB: healthcare_db.hospitalservices" not in context_bundle["sources"]:
                        context_bundle["sources"].append("MongoDB: healthcare_db.hospitalservices")

        # 5. Hospital Facility lookup (for hospital queries, emergencies, or symptom diagnosis so user knows where to go)
        if intent in ["HOSPITAL_QUERY", "EMERGENCY", "SYMPTOM_DIAGNOSIS"] or is_emergency or "hospital" in query_text.lower() or "phc" in query_text.lower():
            emergency_only = is_emergency or intent == "EMERGENCY"
            search_q = query_text if intent not in ["SYMPTOM_DIAGNOSIS", "EMERGENCY"] else None
            hospitals = mongo_manager.search_hospitals(query=search_q, district=district, emergency_only=emergency_only, limit=3)
            if not hospitals:
                hospitals = mongo_manager.search_hospitals(district=district, limit=3)
            context_bundle["hospitals"].extend(hospitals)
            if hospitals and "MongoDB: healthcare_db.hospitals" not in context_bundle["sources"]:
                context_bundle["sources"].append("MongoDB: healthcare_db.hospitals")

        # 6. Patient EHR lookup
        pid = entities.get("patient_id") or user_id
        if pid and (intent == "PATIENT_HISTORY" or "history" in query_text.lower() or "allergy" in query_text.lower()):
            record = mongo_manager.get_patient_records(pid)
            if record:
                context_bundle["patient_record"] = record
                context_bundle["sources"].append("MongoDB: healthcare_demo.patienthistories")

        # Deduplicate sources
        context_bundle["sources"] = list(dict.fromkeys(context_bundle["sources"]))
        return context_bundle

    def generate_response(
        self,
        user_query: str,
        user_id: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete pipeline execution: query understanding -> retrieval -> Gemini reasoning -> structured response.
        Incorporates recent conversation history for multi-turn conversational memory and context resolution.
        """
        t0 = time.perf_counter()

        # Step 1: Query analysis with multi-turn context
        analysis = intent_extractor.analyze(user_query, user_id=user_id, history=history)
        intent = analysis["intent"]
        is_emergency = analysis["is_emergency"]

        # Step 2: Handle non-healthcare queries immediately
        if intent == "IRRELEVANT":
            return {
                "answer": (
                    "### Understanding\n"
                    "Your query does not appear to be related to healthcare or medical assistance.\n\n"
                    "### Relevant Information\n"
                    "No healthcare records matched in our project database.\n\n"
                    "### Possible Considerations\n"
                    "I am specialized exclusively as an AI Healthcare Assistant to support citizens with hospital services, "
                    "medicine stock availability, symptom differential analysis, and patient history information.\n\n"
                    "### Recommended Next Step\n"
                    "Please ask a health-related question, such as inquiring about symptoms, nearby hospitals, or medicine stocks in our network."
                ),
                "intent": "IRRELEVANT",
                "sources": [],
                "confidence": None,
                "retrievedContext": [],
                "is_emergency": False,
                "latency_ms": round((time.perf_counter() - t0) * 1000, 2)
            }

        # Step 3: Retrieval
        context = self.retrieve_context(analysis, user_id=user_id)

        # Step 4: Construct prompt for Gemini (with conversation history)
        prompt_content = self._build_gemini_prompt(user_query, analysis, context, history=history)

        # Step 5: Generate response via Gemini (with multi-model fallback)
        answer = None
        if self.genai_client:
            models_to_try = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
            for candidate_model in models_to_try:
                try:
                    response = self.genai_client.models.generate_content(
                        model=candidate_model,
                        contents=prompt_content,
                        config=types.GenerateContentConfig(
                            temperature=0.2,
                            top_p=0.8,
                            max_output_tokens=1000
                        )
                    )
                    answer = response.text.strip()
                    if answer:
                        break
                except Exception as e:
                    logger.warning(f"Model {candidate_model} failed ({e}); attempting next fallback if available...")

        # Fallback if Gemini fails or is unreachable
        if not answer:
            answer = self._generate_grounded_fallback(user_query, analysis, context)

        # Compute highest confidence from ML if applicable
        confidence = None
        if context.get("ml_predictions") and context["ml_predictions"].get("top_predictions"):
            confidence = context["ml_predictions"]["top_predictions"][0]["confidence"]

        latency_ms = round((time.perf_counter() - t0) * 1000, 2)

        # Sanitize retrieved context for JSON serialization
        serialized_context = self._serialize_context(context)

        return {
            "answer": answer,
            "intent": intent,
            "sources": context["sources"],
            "confidence": confidence,
            "retrievedContext": serialized_context,
            "is_emergency": is_emergency,
            "latency_ms": latency_ms
        }

    def _build_gemini_prompt(
        self,
        user_query: str,
        analysis: Dict[str, Any],
        context: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """Construct a structured prompt with system instructions, conversation history, context, and query."""
        context_json = json.dumps(self._serialize_context(context), indent=2)

        history_section = ""
        if history and isinstance(history, list) and len(history) > 0:
            formatted_turns = []
            for h in history[-6:]:
                role = "User" if h.get("role") in ["user", "human"] else "Assistant"
                content = h.get("content", "").strip()
                if content:
                    # Truncate very long past turns to 400 chars each for token economy
                    if len(content) > 400:
                        content = content[:400] + "..."
                    formatted_turns.append(f"{role}: {content}")
            if formatted_turns:
                history_section = (
                    "==================================================\n"
                    "CONVERSATION HISTORY (RECENT TURNS - USE FOR CONTEXT & PRONOUN RESOLUTION):\n"
                    + "\n".join(formatted_turns) + "\n"
                )

        return f"""{SYSTEM_INSTRUCTION}

{history_section}==================================================
USER CURRENT QUERY:
"{user_query}"

ANALYSIS METADATA:
- Detected Intent: {analysis['intent']}
- Extracted Entities: {json.dumps(analysis['entities'])}
- Emergency Red Flag Detected: {analysis['is_emergency']}
- Red Flag Reasons: {analysis['emergency_reasons']}

GROUNDED DATABASE CONTEXT FROM MONGODB & ML:
<database_context>
{context_json}
</database_context>
==================================================

Generate your structured response following all 5 required sections (Understanding, Relevant Information, Possible Considerations, Recommended Next Step, and Emergency Warning if applicable).
Maintain natural conversational continuity with the previous turns, directly resolving any references ('this medicine', 'there', etc.) without repeating full paragraphs verbatim.
"""

    def _generate_grounded_fallback(self, query: str, analysis: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Deterministic, grounded template fallback in case of Gemini unavailability."""
        intent = analysis["intent"]
        is_emergency = analysis["is_emergency"]

        # Understanding
        understanding = f"You are inquiring about {intent.lower().replace('_', ' ')} based on your query: '{query}'."

        # Relevant Info
        db_lines = []
        if context.get("medicine_stock"):
            db_lines.append("**Medicine Inventory in Project Database:**")
            for s in context["medicine_stock"][:3]:
                db_lines.append(f"- **{s['hospital_name']}**: {s['medicine_name']} ({s['quantity']} units, status: {s['availability_status']})")
        elif context.get("services"):
            db_lines.append("**Hospital Services in Project Database:**")
            for sv in context["services"][:3]:
                cost = f"₹{sv['estimated_cost_inr']}" if sv.get('estimated_cost_inr') is not None else "Free / Standard"
                db_lines.append(f"- **{sv['hospital_name']}**: {sv['service_name']} (Cost: {cost}, Hours: {sv.get('opening_time','')} - {sv.get('closing_time','')})")
        elif context.get("hospitals"):
            db_lines.append("**Hospitals in Project Database:**")
            for h in context["hospitals"][:3]:
                em = "Yes" if h.get("emergencyAvailable") else "No"
                db_lines.append(f"- **{h['name']}** ({h['type']}), {h.get('district', '')} - Emergency Available: {em}, Phone: {h.get('phone', 'N/A')}")
        elif context.get("patient_record"):
            p = context["patient_record"]["demographics"]
            h = context["patient_record"].get("history", {})
            db_lines.append(f"**Patient Record for {p.get('fullName', '')} ({p.get('patientId', '')}):**")
            db_lines.append(f"- Chronic Conditions: {', '.join(h.get('chronicConditions', ['None recorded']))}")
            db_lines.append(f"- Known Allergies: {', '.join(h.get('allergies', ['None recorded']))}")
        else:
            db_lines.append("No specific records found in the project database matching this query.")

        rel_info = "\n".join(db_lines)

        # Possible Considerations
        cons_lines = []
        if context.get("ml_predictions"):
            preds = context["ml_predictions"].get("top_predictions", [])
            cons_lines.append("**ML Differential Considerations:**")
            for p in preds[:3]:
                cons_lines.append(f"- **{p['disease'].title()}** (Confidence: {p['confidence_percent']}, Urgency: {p['urgency_level']})")
        else:
            cons_lines.append("Please evaluate these symptoms in consultation with a licensed medical healthcare provider.")

        considerations = "\n".join(cons_lines)

        # Next step
        next_step = "Please consult with a medical professional at your local Primary Health Center (PHC) or Community Health Center (CHC) for formal clinical evaluation."

        # Emergency
        emergency_sec = ""
        if is_emergency:
            emergency_sec = (
                "\n\n### Emergency Warning\n"
                "**URGENT**: Your reported symptoms indicate potential emergency conditions. "
                "Immediately call emergency services (108 in India) or visit the nearest hospital emergency room."
            )

        return (
            f"### Understanding\n{understanding}\n\n"
            f"### Relevant Information\n{rel_info}\n\n"
            f"### Possible Considerations\n{considerations}\n\n"
            f"### Recommended Next Step\n{next_step}"
            f"{emergency_sec}"
        )

    def _serialize_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Convert MongoDB ObjectIds and complex structures into JSON-serializable primitives."""
        def sanitize(obj):
            if isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items() if k != "_id"}
            elif isinstance(obj, list):
                return [sanitize(elem) for elem in obj]
            elif hasattr(obj, "isoformat"):
                return obj.isoformat()
            return obj
        return sanitize(context)

rag_engine = HealthcareRAGEngine()

if __name__ == "__main__":
    print("Testing Healthcare RAG Engine with Gemini 3.6 Flash...")
    test_q = "Which medicine is available for fever in Rajkot hospitals?"
    resp = rag_engine.generate_response(test_q)
    print("\n--- Response ---")
    print(resp["answer"])
    print("\nSources:", resp["sources"])
    print("Latency:", resp["latency_ms"], "ms")
