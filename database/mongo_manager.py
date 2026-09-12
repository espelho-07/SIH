"""
MongoDB Atlas Manager for Healthcare Assistant.
Manages connections, schema indexes, seeding of disease knowledge,
geospatial queries, inventory lookups, service matching, and secure EHR access.
"""

import os
import re
import json
import logging
from typing import List, Dict, Any, Optional
from pymongo import MongoClient, ASCENDING, TEXT, GEOSPHERE
from pymongo.errors import PyMongoError, OperationFailure
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_FILE = os.path.join(BASE_DIR, "data_pipeline", "disease_knowledge_base.json")

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://24010101189_db_user:10u8BUP8J8sWoQgu@cluster0.lfpnctl.mongodb.net/?appName=Cluster0"
)
PRIMARY_DB_NAME = os.getenv("PRIMARY_DB", "healthcare_db")
DEMO_DB_NAME = os.getenv("DEMO_DB", "healthcare_demo")

class MongoManager:
    """Central interface for querying and indexing MongoDB Atlas."""

    def __init__(self, uri: str = MONGODB_URI):
        self.uri = uri
        self.client = None
        self.primary_db = None
        self.demo_db = None
        self._connect()

    def _connect(self):
        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=5000)
            self.client.admin.command("ping")
            self.primary_db = self.client[PRIMARY_DB_NAME]
            self.demo_db = self.client[DEMO_DB_NAME]
            logger.info("Successfully connected to MongoDB Atlas.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            self.client = None

    def is_connected(self) -> bool:
        if not self.client:
            return False
        try:
            self.client.admin.command("ping")
            return True
        except Exception:
            return False

    def initialize_indexes(self):
        """Create necessary performance and search indexes safely."""
        if not self.is_connected():
            logger.warning("MongoDB not connected; skipping index initialization.")
            return

        def safe_create_index(collection, keys, **kwargs):
            try:
                collection.create_index(keys, **kwargs)
            except OperationFailure as err:
                logger.debug(f"Index notice for {collection.name}: {err.details.get('errmsg', err)}")
            except Exception as e:
                logger.debug(f"Index notice: {e}")

        try:
            # 1. Hospitals: 2dsphere on location, text on name, district, type
            hospitals_col = self.primary_db["hospitals"]
            safe_create_index(hospitals_col, [("location", GEOSPHERE)])
            safe_create_index(hospitals_col, [("name", TEXT), ("district", TEXT), ("type", TEXT)])

            # 2. Medicines: text index on name, genericName, category
            med_col = self.primary_db["medicines"]
            safe_create_index(med_col, [("name", TEXT), ("genericName", TEXT), ("category", TEXT)])

            # 3. Hospital Services
            for col_name in ["hospitalservices", "hospital_services"]:
                col = self.primary_db[col_name]
                safe_create_index(col, [("serviceName", ASCENDING)])
                safe_create_index(col, [("hospitalId", ASCENDING)])

            # 4. Hospital Medicines inventory
            for col_name in ["hospitalmedicines", "hospital_medicines"]:
                col = self.primary_db[col_name]
                safe_create_index(col, [("hospitalId", ASCENDING), ("medicineId", ASCENDING)])

            # 5. Diseases collection in primary_db
            diseases_col = self.primary_db["diseases"]
            safe_create_index(diseases_col, [("name", TEXT), ("signature_symptoms", TEXT)])
            safe_create_index(diseases_col, [("urgency_level", ASCENDING)])

            # 6. Patients & PatientHistories in demo_db
            patients_col = self.demo_db["patients"]
            safe_create_index(patients_col, [("patientId", ASCENDING)])
            safe_create_index(patients_col, [("healthCardNumber", ASCENDING)])

            history_col = self.demo_db["patienthistories"]
            safe_create_index(history_col, [("patientId", ASCENDING)])

            logger.info("Verified all MongoDB Atlas indexes.")
        except Exception as e:
            logger.error(f"Error checking indexes: {e}")

    def seed_disease_knowledge_base(self):
        """Seed or refresh the diseases collection with the cleaned dataset profiles."""
        if not self.is_connected():
            return

        if not os.path.exists(KB_FILE):
            return

        try:
            with open(KB_FILE, "r", encoding="utf-8") as f:
                kb_data = json.load(f)

            diseases_col = self.primary_db["diseases"]
            existing_count = diseases_col.count_documents({})
            if existing_count >= len(kb_data):
                logger.info(f"Diseases collection verified with {existing_count} records.")
                return

            docs_to_insert = []
            for d_name, d_data in kb_data.items():
                docs_to_insert.append({
                    "name": d_name,
                    "sample_count": d_data.get("sample_count", 0),
                    "signature_symptoms": d_data.get("signature_symptoms", []),
                    "all_associated_symptoms": d_data.get("all_associated_symptoms", []),
                    "urgency_level": d_data.get("urgency_level", "ROUTINE_CONSULTATION"),
                    "precautions": d_data.get("precautions", []),
                    "description": d_data.get("description", "")
                })

            if docs_to_insert:
                diseases_col.delete_many({})
                diseases_col.insert_many(docs_to_insert)
                logger.info(f"Seeded {len(docs_to_insert)} diseases into healthcare_db.diseases.")
        except Exception as e:
            logger.error(f"Error seeding disease knowledge base: {e}")

    # ================= QUERY METHODS =================

    def find_nearby_hospitals(
        self,
        lat: float,
        lng: float,
        max_distance_km: float = 50.0,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find hospitals near geographic coordinates using GeoJSON 2dsphere index."""
        if not self.is_connected():
            return []

        try:
            max_meters = max_distance_km * 1000.0
            query = {
                "location": {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [float(lng), float(lat)]
                        },
                        "$maxDistance": max_meters
                    }
                },
                "isActive": True
            }
            results = list(self.primary_db["hospitals"].find(query).limit(limit))
            for r in results:
                r["_id"] = str(r["_id"])
            return results
        except Exception as e:
            logger.debug(f"Geo query fallback: {e}")
            return self.search_hospitals(limit=limit)

    def search_hospitals(
        self,
        query: Optional[str] = None,
        district: Optional[str] = None,
        emergency_only: bool = False,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search hospitals by name, district, or emergency availability."""
        if not self.is_connected():
            return []

        try:
            filter_doc = {"isActive": True}
            if emergency_only:
                filter_doc["emergencyAvailable"] = True
            if district:
                filter_doc["district"] = {"$regex": re.escape(district), "$options": "i"}

            if query and query.strip():
                # Extract search tokens excluding common stopwords
                stop_words = {"which", "what", "where", "is", "are", "the", "in", "and", "or", "of", "for", "its", "located", "hospital", "hospitals", "operating", "hours", "contact", "number", "address", "phone"}
                words = [w.strip() for w in re.split(r"\W+", query.lower()) if len(w.strip()) > 2 and w.strip() not in stop_words]
                
                or_clauses = []
                # First try full phrase if short
                if len(query.strip()) <= 30:
                    or_clauses.extend([
                        {"name": {"$regex": re.escape(query.strip()), "$options": "i"}},
                        {"address": {"$regex": re.escape(query.strip()), "$options": "i"}},
                        {"district": {"$regex": re.escape(query.strip()), "$options": "i"}}
                    ])

                for word in words:
                    or_clauses.extend([
                        {"name": {"$regex": re.escape(word), "$options": "i"}},
                        {"address": {"$regex": re.escape(word), "$options": "i"}},
                        {"district": {"$regex": re.escape(word), "$options": "i"}},
                        {"type": {"$regex": re.escape(word), "$options": "i"}}
                    ])

                if or_clauses:
                    filter_doc["$or"] = or_clauses

            results = list(self.primary_db["hospitals"].find(filter_doc).limit(limit))
            for r in results:
                r["_id"] = str(r["_id"])
            return results
        except Exception as e:
            logger.error(f"Error searching hospitals: {e}")
            return []

    def search_medicines(self, query: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Search catalog medicines by brand or generic name."""
        if not self.is_connected():
            return []

        try:
            filter_doc = {"isActive": True}
            if query and query.strip():
                q = query.strip()
                filter_doc["$or"] = [
                    {"name": {"$regex": re.escape(q), "$options": "i"}},
                    {"genericName": {"$regex": re.escape(q), "$options": "i"}},
                    {"category": {"$regex": re.escape(q), "$options": "i"}},
                    {"description": {"$regex": re.escape(q), "$options": "i"}}
                ]
            results = list(self.primary_db["medicines"].find(filter_doc).limit(limit))
            for r in results:
                r["_id"] = str(r["_id"])
            return results
        except Exception as e:
            logger.error(f"Error searching medicines: {e}")
            return []

    def check_medicine_stock(
        self,
        medicine_query: str,
        hospital_name: Optional[str] = None,
        district: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Join medicines with hospital inventory and hospitals to report real-time stock."""
        if not self.is_connected():
            return []

        try:
            meds = self.search_medicines(medicine_query)
            if not meds:
                return []

            med_map = {str(m["_id"]): m for m in meds}
            hospitals = {str(h["_id"]): h for h in self.primary_db["hospitals"].find()}

            # Gather inventory from both hospitalmedicines and hospital_medicines
            inv_records = list(self.primary_db["hospitalmedicines"].find())
            inv_records.extend(list(self.primary_db["hospital_medicines"].find()))

            stock_results = []
            seen_pairs = set()

            for inv in inv_records:
                inv_med_id = str(inv.get("medicineId", ""))
                inv_hosp_id = str(inv.get("hospitalId", ""))
                pair_key = (inv_hosp_id, inv_med_id)

                if pair_key in seen_pairs:
                    continue

                if inv_med_id in med_map and inv_hosp_id in hospitals:
                    seen_pairs.add(pair_key)
                    hosp = hospitals[inv_hosp_id]
                    med = med_map[inv_med_id]

                    if hospital_name and hospital_name.lower() not in hosp["name"].lower():
                        continue
                    if district and district.lower() not in hosp.get("district", "").lower():
                        continue

                    stock_results.append({
                        "medicine_name": med["name"],
                        "generic_name": med["genericName"],
                        "category": med["category"],
                        "hospital_name": hosp["name"],
                        "hospital_type": hosp["type"],
                        "district": hosp.get("district", ""),
                        "phone": hosp.get("phone", ""),
                        "quantity": inv.get("quantity", 0),
                        "availability_status": inv.get("availabilityStatus", "Unknown"),
                        "last_updated": str(inv.get("lastUpdated", ""))
                    })

            return stock_results
        except Exception as e:
            logger.error(f"Error checking medicine stock: {e}")
            return []

    def search_hospital_services(
        self,
        service_query: Optional[str] = None,
        hospital_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Join hospital services with hospitals to show available medical services."""
        if not self.is_connected():
            return []

        try:
            # Combine both collection variants
            services = list(self.primary_db["hospitalservices"].find())
            services.extend(list(self.primary_db["hospital_services"].find()))
            hospitals = {str(h["_id"]): h for h in self.primary_db["hospitals"].find()}

            results = []
            seen_entries = set()

            for s in services:
                s_name = s.get("serviceName", "")
                desc = s.get("description", "")
                if service_query and (service_query.lower() not in s_name.lower() and service_query.lower() not in desc.lower()):
                    continue

                hosp_id = str(s.get("hospitalId", ""))
                hosp = hospitals.get(hosp_id)

                if hosp:
                    if hospital_name and hospital_name.lower() not in hosp["name"].lower():
                        continue

                    entry_key = (hosp["name"], s_name)
                    if entry_key in seen_entries:
                        continue
                    seen_entries.add(entry_key)

                    results.append({
                        "service_name": s_name,
                        "description": desc or f"{s_name} department services",
                        "is_available": s.get("isAvailable", True),
                        "estimated_cost_inr": s.get("estimatedCost", None),
                        "hospital_name": hosp["name"],
                        "hospital_type": hosp["type"],
                        "district": hosp.get("district", ""),
                        "phone": hosp.get("phone", ""),
                        "opening_time": hosp.get("openingTime", ""),
                        "closing_time": hosp.get("closingTime", "")
                    })

            return results
        except Exception as e:
            logger.error(f"Error searching hospital services: {e}")
            return []

    def get_disease_knowledge(self, disease_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve verified disease profile from healthcare_db.diseases."""
        if not self.is_connected():
            return None

        try:
            query = {"name": {"$regex": f"^{re.escape(disease_name.strip())}$", "$options": "i"}}
            doc = self.primary_db["diseases"].find_one(query)
            if not doc:
                doc = self.primary_db["diseases"].find_one(
                    {"name": {"$regex": re.escape(disease_name.strip()), "$options": "i"}}
                )
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except Exception as e:
            logger.error(f"Error retrieving disease knowledge: {e}")
            return None

    def get_patient_records(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """
        Securely retrieve a patient's EHR records, demographics, chronic conditions,
        allergies, and past visits from healthcare_demo.
        """
        if not self.is_connected() or not patient_id:
            return None

        try:
            pid = patient_id.strip()
            patient = self.demo_db["patients"].find_one(
                {"$or": [{"patientId": pid}, {"healthCardNumber": pid}]}
            )
            if not patient:
                return None

            patient["_id"] = str(patient["_id"])

            history = self.demo_db["patienthistories"].find_one({"patientId": patient["patientId"]})
            if history:
                history["_id"] = str(history["_id"])
                if "pastVisits" in history:
                    for v in history["pastVisits"]:
                        if "_id" in v:
                            v["_id"] = str(v["_id"])
                        if "visitDate" in v:
                            v["visitDate"] = str(v["visitDate"])

            diagnostics = list(self.demo_db["diagnostics"].find({"patientId": patient["patientId"]}))
            for d in diagnostics:
                d["_id"] = str(d["_id"])

            return {
                "demographics": patient,
                "history": history,
                "diagnostics": diagnostics
            }
        except Exception as e:
            logger.error(f"Error retrieving patient record: {e}")
            return None

    def get_status_summary(self) -> Dict[str, Any]:
        """Return connectivity health and collection counts across databases."""
        if not self.is_connected():
            return {"status": "DISCONNECTED", "error": "Unable to ping MongoDB Atlas"}

        summary = {"status": "CONNECTED", "databases": {}}
        for db_name in [PRIMARY_DB_NAME, DEMO_DB_NAME]:
            db = self.client[db_name]
            summary["databases"][db_name] = {}
            for col in db.list_collection_names():
                summary["databases"][db_name][col] = db[col].count_documents({})

        return summary

mongo_manager = MongoManager()

if __name__ == "__main__":
    print("Testing MongoDB Manager...")
    if mongo_manager.is_connected():
        mongo_manager.initialize_indexes()
        mongo_manager.seed_disease_knowledge_base()

        print("\nTest 1: Search Hospitals (Rajkot):")
        hosp = mongo_manager.search_hospitals(district="Rajkot", limit=2)
        print([h["name"] for h in hosp])

        print("\nTest 2: Check Medicine Stock (Paracetamol):")
        stock = mongo_manager.check_medicine_stock("Paracetamol")
        for s in stock:
            print(f"  {s['hospital_name']}: {s['medicine_name']} -> {s['quantity']} units ({s['availability_status']})")

        print("\nTest 3: Search Services (Maternal Care / OPD):")
        serv = mongo_manager.search_hospital_services("Maternal Care")
        for sv in serv:
            print(f"  {sv['hospital_name']}: {sv['service_name']} (Cost: {sv.get('estimated_cost_inr', 'N/A')} INR)")

        print("\nTest 4: Patient History for PAT-1001:")
        pat = mongo_manager.get_patient_records("PAT-1001")
        if pat:
            print(f"  Patient: {pat['demographics']['fullName']}")
            print(f"  Chronic Conditions: {pat['history']['chronicConditions']}")
            print(f"  Allergies: {pat['history']['allergies']}")
    else:
        print("Could not connect to MongoDB Atlas.")
