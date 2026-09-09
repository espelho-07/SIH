# DOMAIN PRD 05: AI / ML PRODUCT & TECHNICAL SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-AIML-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Architecture:** Standalone Python FastAPI Microservice (`SYS-AI`) with ONNX / PyTorch Runtimes  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for AI/ML Team Implementation  

---

## 1. Absolute Clinical Safety Directives

$$\mathbf{FINAL\ CLINICAL\ DECISIONS\ \longrightarrow\ DOCTOR\ /\ AUTHORIZED\ HEALTHCARE\ PROFESSIONAL}$$

The AI microservice operates strictly as an **Assistive Information & Triage Processing Engine**. The following system constraints are enforced at the API gateway and application runtime layers:
1. **Zero Autonomous Clinical Prescriptions:** The model will never generate or output drug names, dosages, durations, or pharmaceutical regimens directly to citizens.
2. **Zero Autonomous Final Diagnoses:** The model will never output definitive diagnoses to patients. All prospective conditions are labeled: `"Draft Triage Intake — Requires Clinician Verification"`.
3. **Deterministic Emergency Red-Flag Bypass:** When speech or text matches the hardcoded Emergency Red-Flag Catalog, the AI immediately halts general intake and signals the backend to initiate trauma escalation.

---

## 2. Machine Learning Capability Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    AI / ML SERVICE PIPELINES                                       |
|                                                                                                    |
|  [ Inbound REST Request ] ---> /api/v1/ai/triage-intake (Audio Base64 / Text)                      |
|                                        |                                                           |
|         +------------------------------+------------------------------+                            |
|         |                                                             |                            |
|         v                                                             v                            |
|  +------------------------------+                             +----------------------------------+ |
|  | Pipeline 1: Multilingual ASR |                             | Pipeline 4: Seasonal Forecaster  | |
|  | * Bhashini IndicASR /        |                             | * Prophet / LightGBM Regressor   | |
|  |   Fine-Tuned Whisper-Medium  |                             | * 36-Month Historical OPD & Rain | |
|  | * 10 Regional Languages      |                             | * 30-Day Forward Medicine Demand | |
|  +------------------------------+                             +----------------------------------+ |
|                 |                                                             |                    |
|                 v                                                             v                    |
|  +------------------------------+                             +----------------------------------+ |
|  | Pipeline 2: Clinical NER     |                             | Batch Forecast Predictions (JSON)| |
|  | * Indic-BERT + Med-Spacy     |                             +----------------------------------+ |
|  | * Extracts: Symptoms,        |                                                                  |
|  |   Duration, Severity         |                                                                  |
|  +------------------------------+                                                                  |
|                 |                                                                                  |
|                 v                                                                                  |
|  +------------------------------+                                                                  |
|  | Pipeline 3: Red-Flag Checker |                                                                  |
|  | * Deterministic Regex + Rule |                                                                  |
|  |   Checks for Trauma/Shock    |                                                                  |
|  +------------------------------+                                                                  |
|                 |                                                                                  |
|                 v                                                                                  |
|  [ Structured Triage JSON + Confidence Score + Model Version ] ---> (Return to Core Backend)       |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Model Pipeline Specifications

### 3.1 Pipeline 1: Multilingual Automatic Speech Recognition (ASR)
* **Target Dialects:** Hindi, Marathi, Bengali, Telugu, Tamil, Kannada, Gujarati, Odia, Punjabi, English.
* **Model Foundation:** Bhashini IndicASR API with local fallback to fine-tuned `openai/whisper-medium` quantized to INT8 via ONNX Runtime for low-latency CPU/GPU execution.
* **Input Specifications:** 16kHz sample rate, single channel (mono), 16-bit PCM WAV / WebM audio streams ($\le 30\text{ seconds}$).
* **Noise Handling:** Pre-processing via DeepFilterNet to suppress rural ambient noise (wind, agricultural machinery, cattle, vehicle horns).
* **Performance SLA:** Turnaround time $\le 1200\text{ ms}$ for 10 seconds of audio; Word Error Rate (WER) $\le 12\%$ on benchmark medical conversational speech.

### 3.2 Pipeline 2: Clinical Entity Extraction (NER & Triage)
* **Model Foundation:** Fine-tuned `ai4bharat/indic-bert` paired with a medical regex parser.
* **Entity Classes:**
  * `SYMPTOM`: Clinical manifestation (e.g., fever, cough, chest pain, dizziness).
  * `DURATION`: Temporal length (e.g., 3 days, 2 weeks).
  * `SEVERITY`: Subjective intensity (`MILD`, `MODERATE`, `SEVERE`).
  * `SNOMED_CODE`: Standardized SNOMED-CT clinical concept identifier.
* **Input:** Clean multilingual transcript + Patient context (Age, Gender, Pregnancy status).
* **Output:** Normalized JSON array of extracted clinical entities.

### 3.3 Pipeline 3: Clinical Encounter Summarization
* **Model Foundation:** Quantized `google/flan-t5-base` or `mistralai/Mistral-7B-Instruct-v0.2` (INT4 via vLLM).
* **Input:** Full teleconsultation dialogue transcript + Vitals stream.
* **Output:** 3-line structured SOAP draft summary:
  * *Subjective:* Chief complaints and patient narrative.
  * *Objective:* Recorded vitals and screening values.
  * *Assessment Draft:* Clinical entity overview for physician confirmation.

### 3.4 Pipeline 4: Seasonal Epidemic Resource Forecaster
* **Model Foundation:** Facebook Prophet paired with a LightGBM multi-output regressor.
* **Features:** 36 months of weekly facility OPD disease counts (Dengue, Malaria, Diarrhea), precipitation data, mean temperature, and historical medicine consumption.
* **Forecast Horizon:** 30 days forward with 95% Bayesian credible intervals.
* **Target Outputs:** Predicted stock depletion dates for IV Saline, Artesunate, ORS, and Paracetamol.

---

## 4. Universal AI Output Contract

Every inference response returned to the core backend must strictly conform to this schema:

```json
{
  "transcript": "तीन दिन से बहुत तेज बुखार है और सीने में भारीपन लग रहा है",
  "languageDetected": "hi",
  "entities": [
    {
      "name": "High Fever",
      "severity": "SEVERE",
      "durationDays": 3,
      "snomedCode": "386661006"
    },
    {
      "name": "Chest Heaviness",
      "severity": "MODERATE",
      "durationDays": 1,
      "snomedCode": "271813007"
    }
  ],
  "redFlagDetected": true,
  "redFlagRationale": "Retrosternal chest heaviness requires immediate ECG evaluation for acute coronary syndrome.",
  "suggestedSpecialty": "CARDIOLOGY",
  "confidenceScore": 0.89,
  "modelVersion": "sanjeevani-ai-indic-v2.1",
  "requiresHumanReview": true,
  "inferredAt": "2026-09-09T17:12:44.120Z"
}
```

---

## 5. Low-Confidence & Fallback Protocol

```
+----------------------------------------------------------------------------------------------------+
|                                  LOW-CONFIDENCE RECOVERY MATRIX                                    |
+---------------------+-------------------+---------------------+------------------------------------+
| Condition           | Trigger Threshold | User-Facing Action  | System Fallback Pathway            |
+---------------------+-------------------+---------------------+------------------------------------+
| Unclear Audio / ASR | Confidence < 0.60 | "आवाज साफ़ नहीं है" | Playback raw audio; present manual |
| Failure             |                   | (Voice not clear)   | vernacular category buttons.       |
| Ambiguous Symptoms  | Confidence < 0.75 | Asks 1 focused      | Presents simple clarification      |
|                     |                   | clarifying question | modal (e.g., "बुखार कितने दिन से है")|
| AI Microservice Down| HTTP 504 / 500    | Seamless fallback   | Client bypasses AI; opens standard |
| or Timeout (>3.0s)  |                   | to manual intake    | checkbox symptom selection UI.     |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 6. Model Evaluation & Quality Metrics

1. **ASR Word Error Rate (WER):** Target $\le 12.0\%$ across all 10 supported regional languages on rural noisy field recordings.
2. **Clinical Entity Extraction F1-Score:** Target $\ge 0.88$ on macro-averaged symptom entity identification.
3. **Emergency Red-Flag Sensitivity (Recall):** Mandatory **100.0%** target recall on the emergency catalog. Zero false negatives permitted in automated test suites.
4. **Latency SLA:** Total end-to-end inference turnaround $\le 1800\text{ ms}$ on GPU instances and $\le 2800\text{ ms}$ on multi-core CPU nodes.

---

## 7. AI Security, PII & Privacy Safeguards

* **Data Minimization:** Raw audio streams are processed in-memory and discarded after transcription unless explicitly consented by the citizen for clinical record attachment.
* **De-Identification:** Before feeding clinical transcripts into summarization models, regex sanitizers strip names, mobile numbers, and Aadhaar numbers.
* **Audit Logging:** Every AI inference request logs model version, execution latency, input token count, and confidence scores in the immutable audit store.

---

## 8. AI/ML Acceptance Criteria

### AC-AI-001: Red-Flag Emergency Detection Precision
* **Given** a spoken audio recording in Hindi: *"मेरे सीने में बहुत तेज दर्द हो रहा है और सांस फूल रही है"* (Severe chest pain and breathlessness),
* **When** submitted to `POST /api/v1/ai/triage-intake`,
* **Then** the service must return `redFlagDetected: true`, identify SNOMED code `29857009` (Chest Pain), suggest specialty `CARDIOLOGY`, and complete execution in $\le 1500\text{ ms}$.

### AC-AI-002: Graceful Circuit-Breaker Degradation
* **Given** the Python AI microservice container is temporarily halted,
* **When** a triage request is routed through the core backend,
* **Then** the backend circuit breaker must trip in $\le 3000\text{ ms}$, return HTTP 200 with `fallbackMode: true`, and provide the manual category intake payload without crashing.
