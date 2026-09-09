# DOMAIN PRD 03: API CONTRACT & INTEGRATION SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-API-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Specification Standard:** OpenAPI 3.0 / RESTful JSON over HTTPS (TLS 1.3)  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for API & Integration Team Implementation  

---

## 1. Global API Architectural Standards

### 1.1 Universal Request & Response Envelopes
All REST endpoints adhere to a standardized JSON response envelope to guarantee client predictability.

#### Standard Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "requestId": "req-0191d9f8-7b24-7f11-92be-4a56c0b31e90",
    "timestamp": "2026-09-09T17:12:44.120Z",
    "pagination": {
      "cursor": "cur_eyJsYXN0SWQiOiAiMTEwNCJ9",
      "hasMore": false,
      "totalCount": 42
    }
  }
}
```

#### Standard Error Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR_FACILITY_CAPACITY_EXCEEDED",
    "message": "The selected facility has exceeded emergency ICU bed thresholds.",
    "details": [
      {
        "field": "targetFacilityId",
        "issue": "ICU occupancy is currently at 100%"
      }
    ]
  },
  "meta": {
    "requestId": "req-0191d9f8-7b24-7f11-92be-4a56c0b31e90",
    "timestamp": "2026-09-09T17:12:44.120Z"
  }
}
```

### 1.2 Mandatory Headers
* `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Required for all protected routes).
* `X-Idempotency-Key: <UUIDv7>` (Mandatory for all state-mutating `POST`, `PUT`, and `PATCH` requests; duplicate submissions return cached results).
* `X-Request-Id: <UUIDv7>` (Injected if missing; preserved across logging traces).

### 1.3 Rate Limiting & Throttling
* **General Endpoints:** 100 requests per minute per IP/User.
* **OTP Dispatch Endpoints:** 3 requests per 15 minutes per mobile number.
* **Batch Sync Endpoints:** 10 batch submissions per minute per frontline worker token.

---

## 2. Core Endpoint Domain Contracts

### 2.1 Domain: Authentication & RBAC

#### Endpoint: `POST /api/v1/auth/otp/request`
* **Purpose:** Initiate citizen mobile OTP authentication.
* **Auth:** Public.
* **Request Payload:**
```json
{ "mobileNumber": "9876543210" }
```
* **Response (HTTP 200):**
```json
{
  "success": true,
  "data": { "message": "OTP dispatched successfully", "expiresInSec": 300 },
  "error": null,
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```
* **Validation Rules:** `mobileNumber` must match regex `^[6-9]\d{9}$`.
* **Errors:** `429 Too Many Requests` (`ERR_OTP_RATE_LIMIT_EXCEEDED`).

#### Endpoint: `POST /api/v1/auth/otp/verify`
* **Purpose:** Verify OTP and return session JWT access & refresh tokens.
* **Auth:** Public.
* **Request Payload:**
```json
{ "mobileNumber": "9876543210", "otp": "582194" }
```
* **Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJFZERTQ...",
    "refreshToken": "ref_8f93a1029c7e4...",
    "expiresIn": 900,
    "user": {
      "id": "usr-0191d9f8-7b24-7f11-92be-4a56c0b31e90",
      "role": "PATIENT",
      "mobileNumber": "9876543210"
    }
  },
  "error": null,
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```
* **Errors:** `401 Unauthorized` (`ERR_INVALID_OTP`, `ERR_OTP_EXPIRED`).

---

### 2.2 Domain: Facility Discovery & Matching

#### Endpoint: `POST /api/v1/facilities/match`
* **Purpose:** Deterministic clinical-suitability facility matching engine.
* **Auth:** Authenticated (`PATIENT`, `ASHA`, `DOCTOR`).
* **Request Payload:**
```json
{
  "userCoordinates": { "latitude": 22.0357, "longitude": 74.9035 },
  "searchRadiusKm": 50,
  "requiredSpecialty": "OBSTETRICS",
  "requiredEquipment": ["ULTRASOUND"],
  "urgencyTier": "URGENT_4HR"
}
```
* **Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "facilityId": "fac-0191d9f8-1122",
        "facilityName": "District Hospital Barwani",
        "facilityType": "DISTRICT_HOSPITAL",
        "distanceKm": 14.2,
        "suitabilityScore": 0.88,
        "matchRationale": "Specialist on duty (Dr. Ananya), Ultrasound operational, 8 general beds available.",
        "activeDoctorShift": { "doctorName": "Dr. Ananya Sharma", "specialty": "OBSTETRICS", "shiftUntil": "17:00 IST" },
        "equipmentStatus": { "ultrasound": "OPERATIONAL", "lastVerified": "2026-09-09T08:30:00Z" },
        "bedCapacity": { "generalAvailable": 8, "icuAvailable": 2 },
        "estimatedWaitMinutes": 35
      }
    ]
  },
  "error": null,
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```

---

### 2.3 Domain: Queue & Token Management

#### Endpoint: `POST /api/v1/tokens/issue`
* **Purpose:** Generate sequential daily OPD or Teleconsultation token.
* **Auth:** Authenticated (`PATIENT`, `ASHA`, `FACILITY_STAFF`).
* **Headers:** `X-Idempotency-Key` mandatory.
* **Request Payload:**
```json
{
  "facilityId": "fac-0191d9f8-1122",
  "departmentCode": "CARDIOLOGY",
  "citizenId": "cit-0191d9f8-3344",
  "tokenType": "WALK_IN",
  "referralId": null
}
```
* **Response (HTTP 201 Created):**
```json
{
  "success": true,
  "data": {
    "tokenId": "tok-0191d9f8-9988",
    "tokenDisplay": "WLK-42",
    "priorityLevel": 4,
    "queuePosition": 6,
    "estimatedWaitMinutes": 42,
    "roomNumber": "Chamber 4",
    "doctorName": "Dr. Vikram Deshmukh",
    "status": "IN_QUEUE"
  },
  "error": null,
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```

---

### 2.4 Domain: Closed-Loop Referral Engine

#### Endpoint: `POST /api/v1/referrals`
* **Purpose:** Clinician generates inbound digital referral with pre-arrival dossier.
* **Auth:** Mandatory role: `DOCTOR`.
* **Headers:** `X-Idempotency-Key` mandatory.
* **Request Payload:**
```json
{
  "citizenId": "cit-0191d9f8-3344",
  "originatingFacilityId": "fac-0191d9f8-0001",
  "targetFacilityId": "fac-0191d9f8-1122",
  "requiredSpecialty": "CARDIOLOGY",
  "urgencyTier": "URGENT_4HR",
  "clinicalRationale": "Suspected Unstable Angina. Resting ECG shows T-wave inversions. Needs Echo.",
  "vitalsAtReferral": { "bp": "160/100", "pulse": 104, "spo2": 96 },
  "attachedReportIds": ["rep-0191d9f8-5544"],
  "transportRequired": true
}
```
* **Response (HTTP 201 Created):**
```json
{
  "success": true,
  "data": {
    "referralId": "ref-0191d9f8-8877",
    "status": "PENDING_ACCEPTANCE",
    "slaExpiresAt": "2026-09-09T21:12:44.120Z",
    "targetFacility": "District Hospital Barwani",
    "transportAssigned": false
  },
  "error": null,
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```

#### Endpoint: `POST /api/v1/referrals/:id/accept`
* **Purpose:** Receiving specialist accepts referral and assigns priority reserved slot.
* **Auth:** Mandatory role: `DOCTOR` (Target Facility) or `FACILITY_STAFF`.
* **Request Payload:**
```json
{
  "scheduledSlotTime": "2026-09-10T10:30:00.000Z",
  "allocatedDoctorId": "usr-0191d9f8-doc2",
  "specialistNotes": "Bed reserved in Cardiac Step-Down Unit."
}
```
* **Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "referralId": "ref-0191d9f8-8877",
    "status": "ACCEPTED",
    "destinationToken": "REF-12",
    "scheduledSlotTime": "2026-09-10T10:30:00.000Z"
  },
  "error": null,
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```

---

### 2.5 Domain: Offline Synchronization

#### Endpoint: `POST /api/v1/sync/batch`
* **Purpose:** Frontline ASHA background batch upload of encrypted field mutations.
* **Auth:** Mandatory role: `ASHA` / `ANM`.
* **Request Payload:**
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
* **Response (HTTP 200):**
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
  "meta": { "requestId": "req-0191d9f8-7b24", "timestamp": "2026-09-09T17:12:44.120Z" }
}
```

---

### 2.6 Domain: AI Microservice Contract (`SYS-AI`)

#### Internal Endpoint: `POST /api/v1/ai/triage-intake`
* **Caller:** Core Backend API Gateway $\longrightarrow$ **Target:** Python AI Microservice.
* **Timeout SLA:** 3000 ms (Strict circuit breaker).
* **Request Payload:**
```json
{
  "audioBase64": "UklGRi...",
  "languageHint": "hi",
  "patientDemographics": {
    "age": 34,
    "gender": "FEMALE",
    "isPregnant": true,
    "gestationalWeeks": 24
  }
}
```
* **Response Payload:**
```json
{
  "transcript": "तीन दिन से बहुत तेज बुखार है और सीने में भारीपन लग रहा है",
  "languageDetected": "hi",
  "entities": [
    { "name": "High Fever", "severity": "SEVERE", "durationDays": 3, "snomedCode": "386661006" },
    { "name": "Chest Heaviness", "severity": "MODERATE", "durationDays": 1, "snomedCode": "271813007" }
  ],
  "redFlagDetected": true,
  "redFlagRationale": "Chest heaviness in pregnant female requires immediate ECG and obstetric trauma check.",
  "suggestedSpecialty": "CARDIOLOGY",
  "confidenceScore": 0.89,
  "modelVersion": "indic-med-triage-v2.1"
}
```

---

## 3. External System Integrations

1. **Bhashini / Indic Speech Gateway:** RESTful audio ingestion gateway for regional ASR. Fallback: Localized quantized Whisper on GPU node.
2. **COTURN STUN/TURN Signaling:** STUN port `3478`, TURN TLS port `5349`. Authenticated with ephemeral 24-hour time-limited credentials generated via HMAC-SHA1.
3. **OpenStreetMap (OSRM):** Self-hosted OSRM engine for accurate road distance and travel time matrix calculation (`/route/v1/driving/{lon1},{lat1};{lon2},{lat2}`).
4. **NIC SMS Gateway (Mock/Sandbox):** Outbound transactional SMS dispatching conforming to standard DLT templates.

---

## 4. API Acceptance Criteria

### AC-API-001: Idempotent Token Request
* **Given** a client submits `POST /api/v1/tokens/issue` with header `X-Idempotency-Key: 0191d9f8-7b24-7f11-92be-4a56c0b31e90`,
* **When** network drops and client retries the exact request with the same idempotency key 5 seconds later,
* **Then** the API must return HTTP 200 with the previously issued token payload and must not increment the queue counter.

### AC-API-002: Red-Flag Emergency Triage Escalation
* **Given** an audio payload containing speech symptoms matching Acute Coronary Syndrome,
* **When** `POST /api/v1/ai/triage-intake` completes,
* **Then** the API response must set `redFlagDetected: true` and return HTTP 200 within $\le 2000\text{ ms}$.
