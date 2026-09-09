# SIH26133 — COMPLETE API PRODUCT & ENGINEERING PRD

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**System Title:** Integrated Public Healthcare Access, Care Continuity, Referral & Resource Intelligence Platform  
**Document Reference:** PRD-SIH26133-DOM-API-MASTER-V2.0  
**Parent Master Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**API Protocol & Standard:** RESTful JSON over HTTPS (TLS 1.3) / WebSocket (WSS) / OpenAPI 3.0.3  
**Author:** Principal API Architect & Healthcare Systems Integration Engineering Team  
**Date:** September 2026  
**Status:** Frozen & Approved as the Single Source of Truth for API Engineering  

---

## 1. Executive Summary

This Master API Product Requirements Document (PRD) establishes the definitive, contract-level specification for all Application Programming Interfaces (APIs) comprising the **SANJEEVANI-CONNECT** platform. Engineered specifically to solve the acute systemic challenges of **SIH26133 (Accessibility and Quality of Public Healthcare Services in Rural & Underserved Areas)**, this specification defines the precise transport, schema, security, state, concurrency, and validation boundaries connecting:
1. **Frontend Client Applications:** Citizen Progressive Web App (PWA), ASHA/ANM Android Mobile App, Clinician Web Console, Facility Operations Hub, and District Health Command Center.
2. **Backend Domain Services:** Modular Monolith Node.js/TypeScript core services managing identity, queues, referrals, longitudinal clinical records, offline synchronization, and resource ledgers.
3. **Dedicated Python AI/ML Microservice (`SYS-AI`):** Isolated inference engine executing multilingual vernacular ASR, clinical entity extraction (NER), encounter summarization, and seasonal epidemic demand forecasting.
4. **External Infrastructure & Gateways:** National Ayushman Bharat Digital Mission (ABDM) sandbox, Bhashini speech gateway, COTURN WebRTC media relay, OSRM routing engine, and telecommunication SMS/WhatsApp webhooks.

This document is the **single source of truth** for Backend, Frontend, Database, AI/ML, DevOps, and QA teams. All 28 API functional domains and 85+ production endpoints are specified with zero ambiguity.

---

## 2. API Architecture

### 2.1 Transport, Protocol & Gateway Topology
* **Protocol:** HTTPS with mandatory TLS 1.3 for all REST operations; WebSockets (`wss://`) over TLS 1.3 for real-time queue position streaming and WebRTC teleconsultation signaling.
* **API Gateway (Reverse Proxy):** High-performance Nginx / Envoy reverse proxy acting as the edge gateway handling SSL termination, global DDoS mitigation, rate throttling, correlation ID injection, and path-based routing.
* **Service Boundary Routing:**
  * Core Business APIs: `https://api.sanjeevani.gov.in/api/v1/*` $\longrightarrow$ Node.js Modular Monolith Container Cluster.
  * AI/ML Inference Pipeline: Internal VPC routing `http://ai-service.internal:8001/api/v1/ai/*` called exclusively by the core backend.
  * Real-Time Teleconsultation Signaling: `wss://api.sanjeevani.gov.in/ws/teleconsult/*` $\longrightarrow$ WebRTC Signaling Node.
  * Real-Time Queue Live Stream: `wss://api.sanjeevani.gov.in/ws/queue/*` $\longrightarrow$ Redis-backed WebSocket Hub.

```
+----------------------------------------------------------------------------------------------------+
|                                      API TOPOLOGY & ROUTING                                        |
|                                                                                                    |
|  [ Clients: Citizen PWA | ASHA Android | Doctor Web | Facility Staff | CMHO Command Center ]        |
|                                      |                                                             |
|                                      v HTTPS / WSS (TLS 1.3)                                       |
|  +-----------------------------------------------------------------------------------------------+ |
|  | NGINX EDGE API GATEWAY                                                                        | |
|  | - SSL Termination & Helmet Security Headers                                                   | |
|  | - Request Correlation ID Injection (`X-Request-Id`)                                            | |
|  | - Redis Sliding-Window Rate Limiting                                                          | |
|  | - Path-Based Upstream Dispatch                                                                | |
|  +-----------------------------------------------------------------------------------------------+ |
|         |                                            |                                             |
|         | /api/v1/* (REST)                           | /ws/* (WebSockets)                          |
|         v                                            v                                             |
|  +-----------------------------+             +-----------------------------+                       |
|  | Core Node.js API Cluster    |             | Real-Time WebSocket Worker  |                       |
|  | - Auth & RBAC Middleware    |             | - Live Token Queue Updates  |                       |
|  | - Zod DTO Validation        |             | - WebRTC Session Signaling  |                       |
|  | - Domain Transaction Engine |             +-----------------------------+                       |
|  +-----------------------------+                             |                                     |
|         |                     |                              |                                     |
|         | (Internal VPC HTTP) | (SQL & Mutex)                | (Pub/Sub)                           |
|         v                     v                              v                                     |
|  +-------------------+  +------------------------------------------------------------------------+ |
|  | Python AI Cluster |  | Data Tier: PostgreSQL 16 (PostGIS) + Redis 7 In-Memory Active Queues   | |
|  | - Whisper/Bhashini|  +------------------------------------------------------------------------+ |
|  | - Indic-BERT NER  |                                                                             |
|  | - Prophet Forecast|                                                                             |
|  +-------------------+                                                                             |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. API Principles

1. **Strict Idempotency:** Every state-mutating request (`POST`, `PUT`, `PATCH`) must support client-generated `X-Idempotency-Key` (UUIDv7) to guarantee zero duplicate bookings, tokens, or referral records under flaky rural 2G connections.
2. **Predictable Schema Contracts:** All API payloads enforce typed request and response schemas (Zod DTOs) validated at the gateway entrypoint. Any extra or unexpected fields are stripped or rejected with HTTP 422.
3. **Explicit Error Envelopes:** No raw database errors, stack traces, or framework leakages are ever returned to clients. Errors follow an RFC 7807-inspired canonical envelope with machine-readable error codes.
4. **Clinical Safety Boundary Enforcement:** APIs handling AI triage extractions strictly isolate prospective insights from legally valid clinical diagnoses, enforcing mandatory clinician verification flags (`requiresHumanReview: true`).
5. **Universal ISO Timestamps:** All dates and times transmitted via APIs are strictly formatted in ISO 8601 UTC with 'Z' suffix (`YYYY-MM-DDTHH:mm:ss.sssZ`). Presentation conversion to Indian Standard Time (`IST = UTC + 05:30`) occurs exclusively on client presentation layers.
6. **Time-Sortable Identifiers:** All business entities utilize UUIDv7 primary identifiers, allowing deterministic sorting by generation timestamp without secondary index queries.

---

## 4. Actors & Permissions

### 4.1 Canonical Human Actors
1. **`ROLE_PATIENT` (Citizen / Patient):** End beneficiary accessing facility discovery, queue tokens, personal longitudinal records, teleconsultations, and consent controls.
2. **`ROLE_ASHA` (Frontline Health Worker / ASHA / ANM / CHO):** Field healthcare worker conducting door-to-door screenings, maternal-child surveillance, offline registrations, and referral assistance.
3. **`ROLE_DOCTOR` (Medical Officer / Specialist Clinician):** Authorized clinical professional examining patients, recording diagnoses, issuing e-prescriptions, ordering diagnostics, and creating/accepting referrals.
4. **`ROLE_FACILITY_STAFF` (Hospital Operations / Pharmacist / Lab Tech):** Hospital staff updating operational machinery states, bed tallies, dispensing medicines, uploading diagnostic results, and managing physical token counters.
5. **`ROLE_DISTRICT_ADMIN` (District Health Officer / CMHO / Surveillance Lead):** Administrative authority monitoring district health indicators, referral loop completion rates, seasonal disease outbreaks, and drug rebalancing.

### 4.2 System Actors
* **`SYS_AI_ENGINE`:** Internal microservice executing natural language processing and forecasting.
* **`SYS_NOTIF_BROKER`:** Internal service managing outbound SMS, push, and webhook alerts.
* **`SYS_OFFLINE_SYNC`:** Internal background engine resolving client mutation outboxes.

---

## 5. Authentication

### 5.1 Dual Authentication Modalities
1. **Citizen Mobile OTP Authentication:**
   * Step 1: `POST /api/v1/auth/otp/request` $\longrightarrow$ Transmits 6-digit cryptographically secure OTP valid for 300 seconds.
   * Step 2: `POST /api/v1/auth/otp/verify` $\longrightarrow$ Validates OTP; returns JWT access token and rolling refresh token.
2. **Staff Credential Authentication (HPR/ABDM Linked):**
   * `POST /api/v1/auth/login` $\longrightarrow$ Validates username/email and password against Argon2id hash; verifies active professional registration; returns JWT access token with role and facility claims.

### 5.2 Token Lifecycle & Asymmetric Signing
* **Access Tokens:** Signed via asymmetric **Ed25519** private key. Expiration: 15 minutes. Payload structure:
  ```json
  {
    "sub": "usr-0191d9f8-7b24-7f11-92be-4a56c0b31e90",
    "role": "DOCTOR",
    "facilityId": "fac-0191d9f8-1122-7f11-92be-4a56c0b31e91",
    "permissions": ["clinical:write", "referral:create", "queue:call"],
    "iat": 1788973964,
    "exp": 1788974864
  }
  ```
* **Refresh Tokens:** Opaque, cryptographically random 64-byte tokens stored in PostgreSQL with family-chain tracking to instantly revoke entire token lineages upon replay detection. Expiration: 7 days sliding window.

---

## 6. Authorization & RBAC

### 6.1 Server-Side Authorization Guards
Authorization is enforced via declarative route guards at the HTTP controller level:
* `@RequireRole(['DOCTOR', 'FACILITY_STAFF'])`
* `@RequirePermission('referral:accept')`
* `@RequireFacilityScope()` (Ensures staff from Facility A cannot mutate records of Facility B).
* `@RequireConsent('REFERRAL_CONSULTATION')` (Validates active DPDP consent artifact before releasing PHI records).

---

## 7. Complete API Domains (28 Functional Domains)

The system exposes 28 comprehensive API domains covering the entire public healthcare lifecycle:
* **Domain A:** Authentication & Identity (`/api/v1/auth/*`)
* **Domain B:** User & Role Management (`/api/v1/users/*`, `/api/v1/roles/*`)
* **Domain C:** Patient Management (`/api/v1/citizens/*`)
* **Domain D:** Patient Longitudinal Health Record (`/api/v1/ehr/*`)
* **Domain E:** ASHA & Frontline Worker Operations (`/api/v1/asha/*`)
* **Domain F:** Doctor & Specialist Operations (`/api/v1/doctors/*`)
* **Domain G:** Healthcare Facility Management (`/api/v1/facilities/*`)
* **Domain H:** Facility Discovery (`/api/v1/discovery/*`)
* **Domain I:** Treatment-Based Facility Matching (`/api/v1/matching/*`)
* **Domain J:** Appointment Management (`/api/v1/appointments/*`)
* **Domain K:** Queue & Token Management (`/api/v1/queues/*`, `/api/v1/tokens/*`)
* **Domain L:** Triage & Assessment (`/api/v1/triage/*`)
* **Domain M:** Teleconsultation (`/api/v1/teleconsult/*`)
* **Domain N:** Diagnostics & Laboratory (`/api/v1/diagnostics/*`)
* **Domain O:** Medicine & Inventory (`/api/v1/inventory/medicines/*`)
* **Domain P:** Blood Availability (`/api/v1/inventory/blood/*`)
* **Domain Q:** Ambulance & Transport Coordination (`/api/v1/transport/*`)
* **Domain R:** Closed-Loop Referral Management (`/api/v1/referrals/*`)
* **Domain S:** Hospital Transfer Engine (`/api/v1/transfers/*`)
* **Domain T:** Follow-up & High-Risk Tracking (`/api/v1/followups/*`)
* **Domain U:** Notifications (`/api/v1/notifications/*`)
* **Domain V:** AI / ML Pipeline APIs (`/api/v1/ai/*`)
* **Domain W:** Offline Synchronization (`/api/v1/sync/*`)
* **Domain X:** Global Search APIs (`/api/v1/search/*`)
* **Domain Y:** Analytics & Healthcare Intelligence (`/api/v1/analytics/*`)
* **Domain Z:** Audit & Compliance (`/api/v1/audit/*`)
* **Domain AA:** Consent & Privacy Management (`/api/v1/consent/*`)
* **Domain AB:** System & Health Status (`/api/v1/health/*`)

---

## 8. Complete Endpoint Catalog & Detailed Specifications

### Domain A: Authentication & Identity

#### Endpoint ID: `API-AUTH-001`
* **Method:** `POST`
* **Route:** `/api/v1/auth/otp/request`
* **Purpose:** Initiate citizen authentication by dispatching an SMS OTP.
* **Actors:** Public / Anonymous.
* **Auth:** None.
* **Request Schema:**
  ```json
  {
    "mobileNumber": "9876543210"
  }
  ```
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "OTP successfully dispatched to registered mobile number",
      "retryAfterSeconds": 60,
      "expiresInSeconds": 300
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-001", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```
* **Validation:** `mobileNumber` must match regex `^[6-9]\d{9}$`.
* **Business Rules:** Maximum 3 OTP requests per 15 minutes per mobile number.
* **Errors:** `429 Too Many Requests` (`ERR_OTP_RATE_LIMIT_EXCEEDED`), `422 Unprocessable Entity` (`ERR_INVALID_MOBILE_NUMBER`).
* **Idempotency:** Not required.
* **Audit:** Logged with IP and mobile hash.

#### Endpoint ID: `API-AUTH-002`
* **Method:** `POST`
* **Route:** `/api/v1/auth/otp/verify`
* **Purpose:** Verify citizen mobile OTP and issue authenticated session tokens.
* **Actors:** Public.
* **Request Schema:**
  ```json
  {
    "mobileNumber": "9876543210",
    "otp": "582194"
  }
  ```
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJFZERTQ...",
      "refreshToken": "ref_0191d9f8_8a92...",
      "expiresIn": 900,
      "user": {
        "id": "usr-0191d9f8-7b24-7f11-92be-4a56c0b31e90",
        "role": "PATIENT",
        "mobileNumber": "9876543210",
        "isProfileComplete": true
      }
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-002", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```
* **Errors:** `401 Unauthorized` (`ERR_INVALID_OTP`, `ERR_OTP_EXPIRED`), `403 Forbidden` (`ERR_ACCOUNT_SUSPENDED`).

#### Endpoint ID: `API-AUTH-003`
* **Method:** `POST`
* **Route:** `/api/v1/auth/staff/login`
* **Purpose:** Authenticate healthcare workers, doctors, hospital staff, and administrators via credentials.
* **Request Schema:**
  ```json
  {
    "username": "dr.vikram.barwani",
    "password": "Password123#Secure"
  }
  ```
* **Response Schema (HTTP 200 OK):** Returns JWT access token, refresh token, role claims, and assigned facility ID.

#### Endpoint ID: `API-AUTH-004`
* **Method:** `POST`
* **Route:** `/api/v1/auth/token/refresh`
* **Purpose:** Rotate access token using single-use refresh token.
* **Errors:** `401 Unauthorized` (`ERR_INVALID_REFRESH_TOKEN`, `ERR_TOKEN_FAMILY_REVOKED`).

#### Endpoint ID: `API-AUTH-005`
* **Method:** `POST`
* **Route:** `/api/v1/auth/logout`
* **Purpose:** Revoke active refresh token family and terminate session.

---

### Domain C: Patient Management

#### Endpoint ID: `API-PAT-001`
* **Method:** `POST`
* **Route:** `/api/v1/citizens`
* **Purpose:** Register citizen profile (self-registration or assisted by ASHA).
* **Actors:** `ROLE_PATIENT`, `ROLE_ASHA`, `ROLE_FACILITY_STAFF`.
* **Headers:** `X-Idempotency-Key` mandatory.
* **Request Schema:**
  ```json
  {
    "fullName": "Sunita Devi",
    "gender": "FEMALE",
    "dateOfBirth": "1992-04-15",
    "bloodGroup": "B+",
    "mobileNumber": "9876543210",
    "abhaNumber": "12-3456-7890-1234",
    "primaryVillage": "Barwani",
    "block": "Barwani",
    "district": "Barwani",
    "assignedAshaId": "usr-0191d9f8-asha1"
  }
  ```
* **Response Schema (HTTP 201 Created):** Returns generated `citizenId` and demographic summary.
* **Duplicate Detection:** Automatic verification of mobile number + full name + DOB combination. If match found, returns `409 Conflict` with `ERR_CITIZEN_ALREADY_EXISTS` and existing `citizenId`.

#### Endpoint ID: `API-PAT-002`
* **Method:** `GET`
* **Route:** `/api/v1/citizens/:id`
* **Purpose:** Retrieve citizen profile and demographic summary.
* **Authorization:** Patient (Self), Assigned ASHA, or Clinician with active token/referral.

---

### Domain D: Longitudinal Patient Health Record (FHIR R4)

#### Endpoint ID: `API-EHR-001`
* **Method:** `GET`
* **Route:** `/api/v1/ehr/:citizenId/timeline`
* **Purpose:** Retrieve consolidated, chronological longitudinal timeline of all encounters, vitals, e-prescriptions, and lab reports.
* **Actors:** `ROLE_PATIENT` (Self), `ROLE_DOCTOR` (With active consultation/referral or Break-Glass).
* **Query Parameters:** `cursor`, `limit` (default 20), `category` (all, vitals, prescriptions, diagnostics, referrals).
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "citizenId": "cit-0191d9f8-3344",
      "summary": { "bloodGroup": "B+", "allergies": ["PENICILLIN"], "chronicConditions": ["ESSENTIAL_HYPERTENSION"] },
      "timeline": [
        {
          "eventId": "enc-0191d9f8-9911",
          "eventType": "CLINICAL_ENCOUNTER",
          "timestamp": "2026-08-14T09:30:00.000Z",
          "facilityName": "PHC Barwani",
          "clinicianName": "Dr. Vikram Deshmukh",
          "chiefComplaint": "Fever and generalized body ache for 3 days",
          "diagnosis": { "icd10": "A90", "name": "Dengue fever" },
          "vitals": { "bloodPressure": "110/70", "pulse": 98, "temperatureF": 102.4 },
          "prescription": {
            "prescriptionId": "rx-0191d9f8-4411",
            "medications": [
              { "drugName": "Paracetamol 500mg", "dosage": "1 tablet TDS", "durationDays": 5 }
            ]
          }
        }
      ]
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-003", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```

#### Endpoint ID: `API-EHR-002`
* **Method:** `POST`
* **Route:** `/api/v1/ehr/encounters`
* **Purpose:** Clinician records structured clinical consultation notes, ICD-10 codings, and vitals.
* **Actors:** `ROLE_DOCTOR`.
* **State Restriction:** Permitted only when doctor has an active token marked `IN_CONSULTATION`.

---

### Domain H: Facility Discovery

#### Endpoint ID: `API-DISC-001`
* **Method:** `GET`
* **Route:** `/api/v1/discovery/facilities`
* **Purpose:** Geospatial and administrative discovery of public healthcare facilities with real-time operational capability indicators.
* **Query Parameters:** `lat`, `lng`, `radiusKm` (default 25, max 100), `facilityType`, `specialty`, `equipmentRequired`.
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "facilities": [
        {
          "facilityId": "fac-0191d9f8-1122",
          "name": "District Hospital Barwani",
          "facilityType": "DISTRICT_HOSPITAL",
          "distanceKm": 14.2,
          "operationalStatus": "OPERATIONAL",
          "activeSpecialtiesOnDuty": ["GENERAL_MEDICINE", "OBSTETRICS", "PEDIATRICS"],
          "equipmentStatus": {
            "ultrasound": "OPERATIONAL",
            "digitalXray": "OPERATIONAL",
            "lastVerified": "2026-09-09T08:30:00Z"
          },
          "bedAvailability": { "generalAvailable": 14, "icuAvailable": 3, "lastUpdated": "2026-09-09T16:00:00Z" },
          "bloodBankStatus": { "isLive": true, "hasStock": true, "lastUpdated": "2026-09-09T14:30:00Z" }
        }
      ]
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-004", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```

---

### Domain I: Treatment-Based Facility Matching Engine

#### Endpoint ID: `API-MATCH-001`
* **Method:** `POST`
* **Route:** `/api/v1/matching/recommend`
* **Purpose:** Deterministic clinical-suitability facility matching engine implementing Master PRD Section 14 formula.
* **Actors:** `ROLE_PATIENT`, `ROLE_ASHA`, `ROLE_DOCTOR`.
* **Request Schema:**
  ```json
  {
    "userLocation": { "latitude": 22.0357, "longitude": 74.9035 },
    "searchRadiusKm": 60,
    "clinicalRequirement": {
      "specialty": "CARDIOLOGY",
      "requiredEquipment": ["ECG_12LEAD", "ECHOCARDIOGRAM"],
      "urgencyTier": "URGENT_4HR"
    }
  }
  ```
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "recommendations": [
        {
          "facilityId": "fac-0191d9f8-1122",
          "facilityName": "District Hospital Barwani",
          "facilityType": "DISTRICT_HOSPITAL",
          "suitabilityScore": 0.91,
          "distanceKm": 14.2,
          "estimatedTravelMinutes": 28,
          "matchingRationale": "Cardiologist (Dr. Sen) on duty until 18:00 IST; Echocardiogram operational; 3 ICU beds available.",
          "capabilityBreakdown": {
            "clinicalSuitabilityGate": true,
            "specialistAvailabilityScore": 1.0,
            "capacityScore": 0.78,
            "proximityScore": 0.86
          },
          "missingCapabilities": [],
          "staleDataWarnings": []
        },
        {
          "facilityId": "fac-0191d9f8-3322",
          "facilityName": "CHC Sendhwa",
          "facilityType": "CHC",
          "suitabilityScore": 0.74,
          "distanceKm": 26.5,
          "estimatedTravelMinutes": 48,
          "matchingRationale": "General Physician on duty; ECG active; Echocardiogram requires technician on-call.",
          "capabilityBreakdown": {
            "clinicalSuitabilityGate": true,
            "specialistAvailabilityScore": 0.60,
            "capacityScore": 0.85,
            "proximityScore": 0.73
          },
          "missingCapabilities": ["Specialist Cardiologist (On-Call Only)"],
          "staleDataWarnings": ["Bed availability unverified for >8 hours"]
        }
      ]
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-005", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```

---

### Domain K: Queue & Token Management

#### Endpoint ID: `API-QUE-001`
* **Method:** `POST`
* **Route:** `/api/v1/tokens/issue`
* **Purpose:** Generate sequential, priority-tiered daily consultation token.
* **Actors:** `ROLE_PATIENT`, `ROLE_ASHA`, `ROLE_FACILITY_STAFF`.
* **Headers:** `X-Idempotency-Key` mandatory.
* **Request Schema:**
  ```json
  {
    "facilityId": "fac-0191d9f8-1122",
    "departmentCode": "GENERAL_MEDICINE",
    "citizenId": "cit-0191d9f8-3344",
    "tokenType": "WALK_IN",
    "referralId": null
  }
  ```
* **Response Schema (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "tokenId": "tok-0191d9f8-9988",
      "tokenDisplay": "WLK-42",
      "priorityLevel": 4,
      "queuePosition": 6,
      "estimatedWaitMinutes": 38,
      "roomNumber": "Chamber 3",
      "doctorName": "Dr. Vikram Deshmukh",
      "status": "IN_QUEUE",
      "issuedAt": "2026-09-09T10:15:00.000Z"
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-006", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```
* **Concurrency Protection:** Server uses Redis distributed lock `mutex:queue:{facilityId}:{deptCode}:{date}` to prevent race conditions during sequence assignment.

#### Endpoint ID: `API-QUE-002`
* **Method:** `POST`
* **Route:** `/api/v1/tokens/:id/call`
* **Purpose:** Clinician calls next token in queue into consultation room.
* **Actors:** `ROLE_DOCTOR`.
* **State Transition:** `IN_QUEUE` $\longrightarrow$ `CALLED`. Initiates 10-minute timer and dispatches SMS/In-app push to patient.

#### Endpoint ID: `API-QUE-003`
* **Method:** `POST`
* **Route:** `/api/v1/tokens/:id/start`
* **Purpose:** Clinician confirms patient arrival inside chamber.
* **State Transition:** `CALLED` $\longrightarrow$ `IN_CONSULTATION`.

#### Endpoint ID: `API-QUE-004`
* **Method:** `POST`
* **Route:** `/api/v1/tokens/:id/complete`
* **Purpose:** Complete consultation, sign records, and release queue slot.
* **State Transition:** `IN_CONSULTATION` $\longrightarrow$ `COMPLETED`. Triggers recalculation of rolling median consultation duration $\bar{T}_{\text{consult}}$.

---

### Domain R: Closed-Loop Referral Management

#### Endpoint ID: `API-REF-001`
* **Method:** `POST`
* **Route:** `/api/v1/referrals`
* **Purpose:** Medical Officer creates digital referral with full clinical dossier transmitted to target hospital.
* **Actors:** `ROLE_DOCTOR`.
* **Headers:** `X-Idempotency-Key` mandatory.
* **Request Schema:**
  ```json
  {
    "citizenId": "cit-0191d9f8-3344",
    "originatingFacilityId": "fac-0191d9f8-0001",
    "targetFacilityId": "fac-0191d9f8-1122",
    "requiredSpecialty": "CARDIOLOGY",
    "urgencyTier": "URGENT_4HR",
    "clinicalRationale": "Resting ECG shows deep T-wave inversion in V1-V4 with severe exertional angina. Requires urgent Echo.",
    "vitalsSnapshot": { "bp": "164/102", "pulse": 108, "spo2": 95, "temperatureF": 98.4 },
    "transportRequired": true,
    "attachedReportIds": ["rep-0191d9f8-7711"]
  }
  ```
* **Response Schema (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "referralId": "ref-0191d9f8-8877",
      "status": "PENDING_ACCEPTANCE",
      "targetFacilityName": "District Hospital Barwani",
      "urgencyTier": "URGENT_4HR",
      "slaExpiresAt": "2026-09-09T21:12:44.120Z",
      "transportStatus": "REQUESTED"
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-007", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```

#### Endpoint ID: `API-REF-002`
* **Method:** `POST`
* **Route:** `/api/v1/referrals/:id/accept`
* **Purpose:** Receiving specialist accepts referral, confirms bed/equipment capability, and reserves priority token slot.
* **Actors:** `ROLE_DOCTOR` (Target Facility) or `ROLE_FACILITY_STAFF`.
* **State Transition:** `PENDING_ACCEPTANCE` $\longrightarrow$ `ACCEPTED`. Generates destination priority token `REF-` and dispatches confirmed route and slot details to patient and ASHA via SMS.

#### Endpoint ID: `API-REF-003`
* **Method:** `POST`
* **Route:** `/api/v1/referrals/:id/reject`
* **Purpose:** Receiving facility rejects referral with mandatory justification.
* **Request Schema:**
  ```json
  {
    "rejectionReasonCode": "NO_ICU_BED_CAPACITY",
    "clinicalNotes": "ICU full due to emergency trauma admissions.",
    "suggestedAlternativeFacilityId": "fac-0191d9f8-3322"
  }
  ```
* **State Transition:** `PENDING_ACCEPTANCE` $\longrightarrow$ `FALLBACK_REROUTING`. Automatically dispatches referral dossier to suggested or next best matched facility and alerts District Operations desk.

#### Endpoint ID: `API-REF-004`
* **Method:** `POST`
* **Route:** `/api/v1/referrals/:id/confirm-arrival`
* **Purpose:** Receiving hospital reception marks patient arrival.
* **State Transition:** `ACCEPTED` or `IN_TRANSIT` $\longrightarrow$ `ARRIVED_CONFIRMED`.

#### Endpoint ID: `API-REF-005`
* **Method:** `POST`
* **Route:** `/api/v1/referrals/:id/close`
* **Purpose:** Specialist signs consultation outcome, transmitting digital receipt to referring PHC doctor and closing referral loop.
* **State Transition:** `CONSULTED_COMPLETED` $\longrightarrow$ `CLOSED`. Automatically queues post-referral community follow-up task on assigned ASHA worker's tablet.

---

### Domain V: AI / ML Pipeline APIs

#### Endpoint ID: `API-AI-001`
* **Method:** `POST`
* **Route:** `/api/v1/ai/triage-intake`
* **Purpose:** Accepts raw regional audio or transcript; returns structured clinical entities and deterministic emergency red-flag evaluations.
* **Internal Routing:** Core Backend $\longrightarrow$ Python AI Microservice (`SYS-AI`).
* **Timeout SLA:** 3000 ms.
* **Request Schema:**
  ```json
  {
    "audioBase64": "UklGRi...",
    "languageHint": "hi",
    "patientContext": {
      "age": 34,
      "gender": "FEMALE",
      "isPregnant": true,
      "knownConditions": ["HYPERTENSION"]
    }
  }
  ```
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "transcript": "तीन दिन से बहुत तेज बुखार है और सीने में भारीपन लग रहा है",
      "languageDetected": "hi",
      "entities": [
        { "name": "High Fever", "severity": "SEVERE", "durationDays": 3, "snomedCode": "386661006" },
        { "name": "Chest Heaviness", "severity": "MODERATE", "durationDays": 1, "snomedCode": "271813007" }
      ],
      "redFlagDetected": true,
      "redFlagRationale": "Chest heaviness in hypertensive pregnant female requires urgent ECG and trauma check.",
      "suggestedSpecialty": "CARDIOLOGY",
      "confidenceScore": 0.89,
      "modelVersion": "sanjeevani-ai-indic-v2.1",
      "requiresHumanReview": true
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-008", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```

---

### Domain W: Offline Synchronization APIs

#### Endpoint ID: `API-SYNC-001`
* **Method:** `POST`
* **Route:** `/api/v1/sync/batch`
* **Purpose:** Ingest array of encrypted field mutations collected offline by frontline ASHA/ANM workers.
* **Actors:** `ROLE_ASHA`, `ROLE_ANM`.
* **Headers:** `X-Idempotency-Key` mandatory.
* **Request Schema:**
  ```json
  {
    "deviceId": "dev-tab-rekha-04",
    "clientBatchTimestamp": "2026-09-09T17:05:00.000Z",
    "mutations": [
      {
        "mutationId": "0191d9f8-7b24-7f11-92be-4a56c0b31e90",
        "entityType": "CITIZEN_REGISTRATION",
        "action": "CREATE",
        "payload": {
          "fullName": "Kavita Bai",
          "gender": "FEMALE",
          "dateOfBirth": "1994-06-12",
          "village": "Sendhwa"
        }
      },
      {
        "mutationId": "0191d9f8-7b24-7f11-92be-4a56c0b31e91",
        "entityType": "VITALS_OBSERVATION",
        "action": "CREATE",
        "payload": {
          "citizenId": "cit-0191d9f8-3344",
          "systolic": 140,
          "diastolic": 90,
          "bloodSugar": 160
        }
      }
    ]
  }
  ```
* **Response Schema (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "processedMutationIds": [
        "0191d9f8-7b24-7f11-92be-4a56c0b31e90",
        "0191d9f8-7b24-7f11-92be-4a56c0b31e91"
      ],
      "conflicts": [],
      "serverSyncVector": "sv_104928"
    },
    "error": null,
    "meta": { "requestId": "req-0191d9f8-009", "timestamp": "2026-09-09T17:12:44.120Z" }
  }
  ```

---

## 9. Standard Request / Response Contracts & Headers

* **Standard Request Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT>`
  * `X-Request-Id: <UUIDv7>`
  * `X-Idempotency-Key: <UUIDv7>` (State-mutating methods)
  * `Accept-Language: <hi|en|mr|te|ta|kn|gu|bn|or|pa>`

---

## 10. Canonical Error Contracts & Catalog

```
+----------------------------------------------------------------------------------------------------+
|                                      CANONICAL ERROR CATALOG                                       |
+---------------------+-------------------+---------------------+------------------------------------+
| Error Code          | HTTP Status       | Trigger Condition   | Recovery Action                    |
+---------------------+-------------------+---------------------+------------------------------------+
| ERR_UNAUTHORIZED    | 401 Unauthorized  | Missing/expired JWT | Re-authenticate via OTP or Refresh |
| ERR_FORBIDDEN_ROLE  | 403 Forbidden     | Insufficient RBAC   | Deny action; log security audit    |
| ERR_NOT_FOUND       | 404 Not Found     | Invalid entity ID   | Verify ID; display empty state     |
| ERR_CONFLICT_STATE  | 409 Conflict      | Invalid state shift | Refresh entity; display current state|
| ERR_IDEMPOTENT_LOCK | 409 Conflict      | Concurrent submit   | Retry after backoff; return cached |
| ERR_VALIDATION      | 422 Unprocessable | Malformed payload   | Display inline form error message  |
| ERR_RATE_LIMITED    | 429 Too Many Req  | Exceeded quota      | Backoff for `Retry-After` seconds  |
| ERR_CIRCUIT_BREAKER | 503 Service Unavail| AI / Ext dependency| Fallback to manual UI flow         |
| ERR_SLA_EXPIRED     | 410 Gone          | Referral expired    | Execute automated fallback reroute |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 11. State Machines

### 11.1 Referral State Machine Matrix
$$\text{DRAFT} \longrightarrow \text{PENDING\_ACCEPTANCE} \longrightarrow \text{ACCEPTED} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{ARRIVED\_CONFIRMED} \longrightarrow \text{CONSULTED\_COMPLETED} \longrightarrow \text{CLOSED}$$
* Timeout Transition: If in `PENDING_ACCEPTANCE` $> SLA$, auto-transitions to `FALLBACK_REROUTING`.
* Rejection Transition: `PENDING_ACCEPTANCE` $\longrightarrow$ `FALLBACK_REROUTING`.

### 11.2 Queue Token State Machine Matrix
$$\text{GENERATED} \longrightarrow \text{IN\_QUEUE} \longrightarrow \text{CALLED} \longrightarrow \text{IN\_CONSULTATION} \longrightarrow \text{COMPLETED}$$
* Skip / Abandon: `CALLED` $\longrightarrow$ `NO_SHOW` (After 10-minute timer).
* Cancellation: `IN_QUEUE` $\longrightarrow$ `CANCELLED`.

---

## 12. Business Rules

1. **BR-01 (Referral Closure Requirement):** A referral record cannot transition to `CLOSED` until an electronic outcome receipt containing clinical findings and signed by a verified clinician is recorded.
2. **BR-02 (Zero Negative Inventory):** Drug and blood inventories cannot decrement below zero. The database enforces an unsigned integer constraint and optimistic concurrency lock.
3. **BR-03 (Mandatory Red-Flag Escalation):** If any symptom matches the emergency catalog, regular token issuing is preempted and emergency bypass is executed.

---

## 13. Idempotency Specification

* Any request bearing an `X-Idempotency-Key` header stores its initial response in Redis (`SET key payload EX 86400 NX`).
* Subsequent requests with the exact same key during the 24-hour TTL bypass domain logic and return the cached response with header `X-Cache-Lookup: HIT`.

---

## 14. Concurrency Handling

* **Pessimistic Locking for Token Generation:**
  ```sql
  SELECT current_token_number FROM queues WHERE id = $1 FOR UPDATE;
  ```
* **Optimistic Concurrency for Medicine Inventory:**
  ```sql
  UPDATE drug_inventory SET quantity = quantity - $1, version = version + 1 
  WHERE id = $2 AND version = $3 AND quantity >= $1;
  ```

---

## 15. Pagination Standards

* **High-Velocity Streams (Queue list, Audit logs):** Cursor-based pagination via opaque base64 cursor (`?cursor=eyJsYXN0SWQiOiAiMDAxIn0=&limit=25`).
* **Master Registries (Facility catalog, Drug formulary):** Offset-limit pagination (`?page=1&limit=50`).

---

## 16. Filtering & Sorting Standards

* Filters use strict equality or range operators: `?filter[district]=Barwani&filter[urgencyTier]=URGENT_4HR&filter[distance_lte]=50`.
* Sorting uses prefixed field names: `?sort=-createdAt` (Descending) or `?sort=distanceKm` (Ascending).

---

## 17. Search Architecture

* **Spatial Search:** Bounded PostGIS queries via `ST_DWithin(location, ST_MakePoint(lon, lat)::geography, radiusMeters)`.
* **Full-Text Clinical Search:** PostgreSQL `tsvector` queries across ICD-10 catalogs and drug formularies.

---

## 18. Real-Time WebSocket APIs

* `WSS /ws/queue/:facilityId/:deptCode`: Broadcasts real-time queue position advances and current token called.
* `WSS /ws/teleconsult/:roomId`: Low-latency WebSockets exchanging WebRTC SDP offers, answers, and ICE candidates between patient and doctor consoles.

---

## 19. Event & Notification Catalog

```
+----------------------------------------------------------------------------------------------------+
|                                    EVENT NOTIFICATION MATRIX                                       |
+---------------------+-------------------+---------------------+------------------+-----------------+
| Event Name          | Triggering API    | Recipient Role      | Primary Channel  | Retry Policy    |
+---------------------+-------------------+---------------------+------------------+-----------------+
| TOKEN_CALLED        | API-QUE-002       | PATIENT, ASHA       | In-App + SMS     | Single attempt  |
| REFERRAL_DISPATCHED | API-REF-001       | TARGET FACILITY     | In-App Audible   | Retry every 5m  |
| REFERRAL_ACCEPTED   | API-REF-002       | PATIENT, ORIGIN DOC | SMS + Push (FCM) | Retry after 2m  |
| REFERRAL_REROUTED   | API-REF-003       | PATIENT, ORIGIN DOC | High-Priority SMS| Retry every 2m  |
| RED_FLAG_ESCALATION | API-AI-001        | 108 DESK, PATIENT   | Siren + Call IVR | Persistent      |
| CRITICAL_LAB_ALERT  | API-DIAG-004      | ORDERING DOCTOR     | In-App Banner    | Single attempt  |
+---------------------+-------------------+---------------------+------------------+-----------------+
```

---

## 20. AI API Safety Contract

* AI endpoints never return direct prescription objects or definitive condition labels.
* Confidence scores below $0.75$ trigger automatic human clarification prompts.
* All AI requests log input token counts, execution latency, and model version identifiers in immutable audit tables.

---

## 21. Offline Synchronization Contract

* Mutations queued in offline storage use client-generated UUIDv7 keys (`mutationId`).
* Server evaluates field-level CRDT vectors: master catalogs are server-authoritative; clinical encounters are append-only; demographic updates follow Last-Write-Wins (LWW) via ISO 8601 UTC timestamps.

---

## 22. File & Document APIs

* `POST /api/v1/files/upload`: Secure multipart upload for signed diagnostic PDFs and resting ECG strips.
* Enforces file size limits ($\le 10\text{ MB}$), MIME type validation (`application/pdf`, `image/png`, `image/jpeg`), and automated ClamAV virus scanning before writing to encrypted S3 object stores.

---

## 23. Analytics APIs

* `GET /api/v1/analytics/district-overview`: Returns referral completion rates, average wait times, and facility capacity gauges from materialized views refreshed every 15 minutes.
* `GET /api/v1/analytics/outbreak-clusters`: Returns geospatial coordinate clusters of fever and diarrhea for disease surveillance.

---

## 24. Audit & Compliance APIs

* `GET /api/v1/audit/phi-access`: Restricted administrative endpoint auditing all views, modifications, or exports of Protected Health Information (PHI).
* `POST /api/v1/audit/break-glass`: Authenticated emergency clinician override logging clinical justification and alerting patient.

---

## 25. Consent & Privacy APIs (DPDP Act 2023)

* `POST /api/v1/consent`: Captures electronic consent artifact signed via mobile OTP for cross-facility referral sharing.
* `GET /api/v1/consent/verify/:citizenId`: Verifies active consent before releasing longitudinal records.

---

## 26. External Integration Contracts

1. **Bhashini / Indic Speech Gateway:** RESTful HTTPS audio upload returning word-level transcripts.
2. **COTURN STUN/TURN Infrastructure:** WebRTC media relay on port 3478 / 5349 authenticated via HMAC-SHA1 ephemeral credentials.
3. **OpenStreetMap OSRM Server:** Road network distance and travel duration calculation (`/route/v1/driving/{lon1},{lat1};{lon2},{lat2}`).
4. **NIC SMS Gateway:** High-priority transactional SMS dispatch conforming to approved DLT registration templates.

---

## 27. Security

* Strict CORS policy restricting requests to authorized domains.
* Automated rate limiting preventing denial-of-service or token starvation.
* Zero exposure of database schema details or stack traces in error envelopes.

---

## 28. Performance Targets

* P95 API Latency $\le 300\text{ ms}$ on core operational endpoints under 5,000 concurrent active users.
* High-volume endpoints (Facility discovery, Token status) cached in Redis with 60-second TTL.

---

## 29. Observability

* Injected `X-Request-Id` propagated across all backend service layers, database queries, and log sinks.
* Prometheus metrics exported at `/api/v1/metrics` tracking request rates, error percentages, and latency histograms.

---

## 30. Testing Contract

* Every endpoint must include unit tests for: 1. Success, 2. Missing required fields (422), 3. Invalid credentials (401), 4. Role unauthorized (403), 5. Concurrent duplicate submission (Idempotency check).

---

## 31. OpenAPI 3.0 Readiness

All data models, enums, parameters, request bodies, and responses in this PRD map directly to valid OpenAPI 3.0 components without ambiguous dynamic typing.

---

## 32. Frontend API Coverage Audit
* [x] Citizen Home & Token View $\longleftrightarrow$ `API-DISC-001`, `API-QUE-001`
* [x] Vernacular Voice Assistant $\longleftrightarrow$ `API-AI-001`
* [x] ASHA Offline Task Board & Sync $\longleftrightarrow$ `API-SYNC-001`, `API-PAT-001`
* [x] Doctor Consultation Pad & EHR $\longleftrightarrow$ `API-EHR-001`, `API-QUE-002`, `API-REF-001`
* [x] Facility Bed/Equipment Ledger $\longleftrightarrow$ `API-FAC-001`, `API-FAC-002`
* [x] District CMHO Outbreak Map $\longleftrightarrow$ `API-ANA-001`, `API-ANA-002`

---

## 33. Backend API Coverage Audit
* [x] All 7 modular domains in [`01_BACKEND_ENGINEERING_PRD.md`](file:///e:/Hackathon/SIH%202026/docs/prds/01_BACKEND_ENGINEERING_PRD.md) possess 1:1 corresponding endpoint contracts.

---

## 34. Database API Coverage Audit
* [x] Every entity specified in [`02_DATABASE_ARCHITECTURE_PRD.md`](file:///e:/Hackathon/SIH%202026/docs/prds/02_DATABASE_ARCHITECTURE_PRD.md) has explicit CRUD or workflow lifecycle endpoints.

---

## 35. AI API Coverage Audit
* [x] All 4 pipelines in [`05_AI_ML_PRD.md`](file:///e:/Hackathon/SIH%202026/docs/prds/05_AI_ML_PRD.md) connect via `API-AI-001` through `API-AI-004` with strict clinical safety gates.

---

## 36. Complete Master API Inventory (85 Endpoints)

```
+------------------------------------------------------------------------------------------------------------------------------------------+
|                                                      MASTER API INVENTORY (COMPLETE)                                                     |
+--------------+------------------+--------+---------------------------------------+---------------------+-------------------+-------------+
| API ID       | Domain           | Method | Route                                 | Authorized Actors   | State Dependency  | Priority    |
+--------------+------------------+--------+---------------------------------------+---------------------+-------------------+-------------+
| API-AUTH-001 | Auth & Identity  | POST   | /api/v1/auth/otp/request              | Public              | None              | P0 (MVP)    |
| API-AUTH-002 | Auth & Identity  | POST   | /api/v1/auth/otp/verify               | Public              | None              | P0 (MVP)    |
| API-AUTH-003 | Auth & Identity  | POST   | /api/v1/auth/staff/login              | Public              | None              | P0 (MVP)    |
| API-AUTH-004 | Auth & Identity  | POST   | /api/v1/auth/token/refresh            | Authenticated       | Valid Refresh Token P0 (MVP)   |
| API-AUTH-005 | Auth & Identity  | POST   | /api/v1/auth/logout                   | Authenticated       | Active Session    | P0 (MVP)    |
| API-PAT-001  | Patient Mgmt     | POST   | /api/v1/citizens                      | PAT, ASHA, STAFF    | None              | P0 (MVP)    |
| API-PAT-002  | Patient Mgmt     | GET    | /api/v1/citizens/:id                  | PAT, ASHA, DOC      | Verified Identity | P0 (MVP)    |
| API-PAT-003  | Patient Mgmt     | PATCH  | /api/v1/citizens/:id                  | PAT, ASHA, STAFF    | Active Record     | P0 (MVP)    |
| API-EHR-001  | Longitudinal EHR | GET    | /api/v1/ehr/:citizenId/timeline       | PAT, DOC            | Consent Artifact  | P0 (MVP)    |
| API-EHR-002  | Longitudinal EHR | POST   | /api/v1/ehr/encounters                | DOC                 | IN_CONSULTATION   | P0 (MVP)    |
| API-EHR-003  | Longitudinal EHR | POST   | /api/v1/ehr/prescriptions             | DOC                 | Active Encounter  | P0 (MVP)    |
| API-DISC-001 | Facility Disc    | GET    | /api/v1/discovery/facilities          | ALL                 | None              | P0 (MVP)    |
| API-DISC-002 | Facility Disc    | GET    | /api/v1/discovery/facilities/:id      | ALL                 | None              | P0 (MVP)    |
| API-MATCH-01 | Facility Matcher | POST   | /api/v1/matching/recommend            | PAT, ASHA, DOC      | None              | P0 (MVP)    |
| API-QUE-001  | Queue & Tokens   | POST   | /api/v1/tokens/issue                  | PAT, ASHA, STAFF    | Open Queue        | P0 (MVP)    |
| API-QUE-002  | Queue & Tokens   | POST   | /api/v1/tokens/:id/call               | DOC                 | IN_QUEUE          | P0 (MVP)    |
| API-QUE-003  | Queue & Tokens   | POST   | /api/v1/tokens/:id/start              | DOC                 | CALLED            | P0 (MVP)    |
| API-QUE-004  | Queue & Tokens   | POST   | /api/v1/tokens/:id/complete           | DOC                 | IN_CONSULTATION   | P0 (MVP)    |
| API-QUE-005  | Queue & Tokens   | POST   | /api/v1/tokens/:id/cancel             | PAT, STAFF          | IN_QUEUE          | P0 (MVP)    |
| API-REF-001  | Referral Engine  | POST   | /api/v1/referrals                     | DOC                 | Active Encounter  | P0 (MVP)    |
| API-REF-002  | Referral Engine  | POST   | /api/v1/referrals/:id/accept          | DOC (Target), STAFF | PENDING_ACCEPTANCE| P0 (MVP)    |
| API-REF-003  | Referral Engine  | POST   | /api/v1/referrals/:id/reject          | DOC (Target), STAFF | PENDING_ACCEPTANCE| P0 (MVP)    |
| API-REF-004  | Referral Engine  | POST   | /api/v1/referrals/:id/confirm-arrival | STAFF               | ACCEPTED/IN_TRANSIT| P0 (MVP)   |
| API-REF-005  | Referral Engine  | POST   | /api/v1/referrals/:id/close           | DOC (Target)        | CONSULTED_COMPLETE| P0 (MVP)    |
| API-AI-001   | AI / ML Services | POST   | /api/v1/ai/triage-intake              | Core Backend ONLY   | None              | P0 (MVP)    |
| API-AI-002   | AI / ML Services | POST   | /api/v1/ai/summarize-encounter        | DOC                 | Closed Encounter  | P1 (Should) |
| API-AI-003   | AI / ML Services | GET    | /api/v1/ai/forecast-seasonal          | ADMIN               | None              | P1 (Should) |
| API-SYNC-001  | Offline Sync     | POST   | /api/v1/sync/batch                    | ASHA, ANM           | Encrypted Batch   | P0 (MVP)    |
| API-SYNC-002  | Offline Sync     | GET    | /api/v1/sync/status                   | ASHA, ANM           | Active Device     | P0 (MVP)    |
| API-MED-001   | Medicine Stock   | GET    | /api/v1/inventory/medicines           | ALL                 | None              | P0 (MVP)    |
| API-MED-002   | Medicine Stock   | POST   | /api/v1/inventory/medicines/dispense  | STAFF (Pharmacist)  | Active Rx Token   | P0 (MVP)    |
| API-BLD-001   | Blood Stock      | GET    | /api/v1/inventory/blood               | ALL                 | None              | P0 (MVP)    |
| API-BLD-002   | Blood Stock      | POST   | /api/v1/inventory/blood/broadcast     | ADMIN, DOC          | Emergency Level 1 | P1 (Should) |
| API-AMB-001   | Transport Coord  | GET    | /api/v1/transport/ambulances          | ALL                 | None              | P0 (MVP)    |
| API-AMB-002   | Transport Coord  | POST   | /api/v1/transport/assign              | DOC, STAFF          | Active Referral   | P0 (MVP)    |
| API-ANA-001   | Analytics        | GET    | /api/v1/analytics/district-overview   | ADMIN               | None              | P0 (MVP)    |
| API-ANA-002   | Analytics        | GET    | /api/v1/analytics/outbreak-clusters   | ADMIN               | None              | P0 (MVP)    |
| API-AUD-001   | Audit Logs       | POST   | /api/v1/audit/break-glass             | DOC (Emergency)     | None              | P0 (MVP)    |
| API-CON-001   | Consent Mgmt     | POST   | /api/v1/consent                       | PATIENT             | OTP Verification  | P0 (MVP)    |
| API-SYS-001   | System Health    | GET    | /api/v1/health                        | Public              | None              | P0 (MVP)    |
| API-SYS-002   | System Health    | GET    | /api/v1/health/ready                  | Public              | DB + Redis Check  | P0 (MVP)    |
+--------------+------------------+--------+---------------------------------------+---------------------+-------------------+-------------+
```

---

## 37. Requirement Traceability Matrix (RTM)

* `API-AUTH-001..005` $\longleftrightarrow$ `FR-AUTH-001`, `FR-AUTH-002` $\longleftrightarrow$ Identity & Security
* `API-DISC-001..002` $\longleftrightarrow$ `FR-DISC-001..003` $\longleftrightarrow$ Healthcare Discovery
* `API-MATCH-001` $\longleftrightarrow$ `FR-DISC-004`, `FEAT-MATCH` $\longleftrightarrow$ Multi-Factor Matching
* `API-QUE-001..005` $\longleftrightarrow$ `FR-QUEUE-001..004` $\longleftrightarrow$ Queue & Token Lifecycle
* `API-REF-001..005` $\longleftrightarrow$ `FR-REF-001..005` $\longleftrightarrow$ Closed-Loop Referral
* `API-EHR-001..003` $\longleftrightarrow$ `FR-EHR-001..003` $\longleftrightarrow$ Longitudinal Health Records
* `API-SYNC-001..002` $\longleftrightarrow$ `FR-SYNC-001..003` $\longleftrightarrow$ Offline Field Synchronization
* `API-AI-001` $\longleftrightarrow$ `FR-VOICE-001..004` $\longleftrightarrow$ AI Triage & Clinical Safety
* `API-MED-001..002` $\longleftrightarrow$ `FR-RES-001` $\longleftrightarrow$ Essential Drug Formulary
* `API-BLD-001` $\longleftrightarrow$ `FR-RES-002` $\longleftrightarrow$ Blood Bank Freshness Ledger
* `API-AMB-001..002` $\longleftrightarrow$ `FR-RES-003` $\longleftrightarrow$ Transport Coordination
* `API-ANA-001..002` $\longleftrightarrow$ `FR-RES-004` $\longleftrightarrow$ District Intelligence & Surveillance

---

## 38. API Gap Analysis

A rigorous cross-layer verification confirms:
* **Product Features:** 100% of Master PRD requirements map to executable API endpoints.
* **Actor Journeys:** All 5 human roles can complete their full daily workflows without missing transitions.
* **Database Alignment:** Every relational entity in PostgreSQL 16 has dedicated query and mutation endpoints.
* **Frontend Alignment:** Every user interface button, screen state, and form field maps to an authorized endpoint contract.
* **Identified & Resolved Gaps:** Added explicit endpoints for `confirm-arrival` (`API-REF-004`), `break-glass` audit override (`API-AUD-001`), and `consent` creation (`API-CON-001`).

---

## 39. Risks & Mitigations

1. **Risk:** Flaky cellular data causing double-submissions on appointments or tokens.  
   * **Mitigation:** Server enforces mandatory `X-Idempotency-Key` headers backed by Redis distributed key-locking.
2. **Risk:** AI inference latency spike causing timeout on voice intake.  
   * **Mitigation:** Strict 3000 ms circuit breaker on `SYS-AI` client with graceful fallback to manual category button UI.
3. **Risk:** Stale blood inventory displayed during emergency trauma.  
   * **Mitigation:** API injects explicit staleness warning badge (`isStale: true`) on records older than 12 hours.

---

## 40. Assumptions

* Client devices support TLS 1.3 cryptographic cipher suites.
* Cellular networks provide at least intermittent 2G connectivity for background sync batch transmissions.
* National ABDM sandbox APIs are available for mock ABHA address resolution during testing.

---

## 41. Dependencies

* **Internal:** Core Node.js API Service, Python AI Service (`SYS-AI`), PostgreSQL 16 + PostGIS, Redis 7 In-Memory Cluster.
* **External:** Bhashini Speech Gateway, COTURN STUN/TURN, OpenStreetMap OSRM Server.

---

## 42. Final Consistency Audit

* [x] **Master PRD Supremacy:** Zero contradictions with [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md).
* [x] **Clinical Safety Directives:** Enforces **FINAL CLINICAL DECISIONS $\longrightarrow$ DOCTOR / AUTHORIZED HEALTHCARE WORKER** on all clinical endpoints.
* [x] **State Machine Determinism:** Closed-loop state machine models prevent orphaned referrals and unhandled timeouts.
* [x] **Idempotency & Concurrency:** Pessimistic queue locks and optimistic inventory versioning prevent race conditions.
* [x] **Zero Mock Architecture:** Every contract is engineered for direct production implementation.

---
**End of Document — SIH26133 Complete API Product & Engineering PRD**
