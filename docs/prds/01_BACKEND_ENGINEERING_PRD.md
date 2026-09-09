# DOMAIN PRD 01: BACKEND ENGINEERING SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-BACKEND-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Target Runtime:** Node.js (TypeScript) / Express / Fastify (Modular Monolith) with Redis & PostgreSQL 16  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for Backend Team Implementation  

---

## 1. Architectural Architecture & Module Boundaries

### 1.1 Architectural Style: Modular Monolith
To prevent distributed transaction failures, network latency serialization overhead, and deployment complexity during hackathon and pilot scaling, the core backend is architected as a **Modular Monolith** with strict logical domain boundaries. The AI inference service resides as an isolated, independently scalable microservice (`SYS-AI`).

```
+----------------------------------------------------------------------------------------------------+
|                                  BACKEND MODULAR ARCHITECTURE                                      |
|                                                                                                    |
|  [ API Gateway & Reverse Proxy (Nginx) ] ---> HTTPS / WSS (TLS 1.3)                                |
|                                                    |                                               |
|                                                    v                                               |
|  +-----------------------------------------------------------------------------------------------+ |
|  | HTTP & WebSocket Transport Layer (Controllers, Middlewares, Rate Limiters, Auth Guards)       | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                    |                                               |
|                                                    v                                               |
|  +-----------------------------------------------------------------------------------------------+ |
|  | DOMAIN SERVICES LAYER (Pure Business Logic & Transaction Orchestration)                       | |
|  |  * AuthService        * QueueService        * ReferralEngine      * SyncService               | |
|  |  * FacilityService   * TriageService       * TeleconsultService  * ResourceService            | |
|  |  * EncounterService  * InventoryService    * FollowUpService     * AuditService               | |
|  +-----------------------------------------------------------------------------------------------+ |
|                               |                                                    |               |
|                               v                                                    v               |
|  +-------------------------------------------------------------+  +------------------------------+ |
|  | REPOSITORY & PERSISTENCE LAYER (Data Access / Query Builder) |  | EVENT BUS & BACKGROUND TASKS | |
|  |  * PostgreSQL 16 (PostGIS) Relational Repository            |  |  * BullMQ Job Queue (Redis)  | |
|  |  * Redis In-Memory Active Queues & Session Cache           |  |  * Event Emitter (Internal)  | |
|  +-------------------------------------------------------------+  +------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

### 1.2 Module Directory Hierarchy
```text
backend/src/
├── app.ts                  # Application bootstrap & middleware pipeline
├── server.ts               # HTTP & WebSocket listener binding
├── config/                 # Typed environment configurations & secret validators
├── common/                 # Base errors, standard JSON envelopes, crypto utils
│   ├── errors/             # AppError, NotFoundError, UnauthorizedError, ConflictError
│   ├── middlewares/        # authGuard, roleGuard, rateLimiter, requestValidator
│   └── utils/              # uuidv7, logger, responseEnvelope, dateTime
├── modules/
│   ├── auth/               # Mobile OTP, Staff Login, JWT generation, Refresh Family
│   ├── facility/           # Facility discovery, equipment registry, doctor rosters
│   ├── queue/              # Token generation, dynamic EWT formula, queue preemption
│   ├── teleconsult/        # WebRTC room allocation, ephemeral signaling tokens
│   ├── referral/           # Closed-loop state machine, fallback rerouter, SLA timers
│   ├── clinical/           # Longitudinal encounters, FHIR observations, e-prescriptions
│   ├── inventory/          # NLEM medicines, blood stock ledgers, ambulance registry
│   ├── sync/               # Offline mutation ingestion, CRDT resolver, sync vector
│   ├── followup/           # ASHA automated task scheduler, maternal/infant watchlists
│   └── audit/              # Immutable PHI access logging daemon
└── external/
    ├── aiClient.ts         # Resilient HTTP client for Python AI microservice
    └── telecomGateway.ts   # SMS and WhatsApp webhook dispatcher
```

---

## 2. Request Lifecycle & Pipeline Architecture

Every incoming HTTP request traverses an unyielding, deterministic 7-stage middleware pipeline:

```
[ Incoming Request ]
        |
        v
1. [ Request ID & Correlation ] -> Injects `X-Request-Id` (UUIDv7) into async context
        |
        v
2. [ Security & Rate Limiting ] -> Helmet headers, CORS check, sliding-window Redis limiter
        |
        v
3. [ Authentication Guard ]     -> Validates Bearer JWT or Session; unpacks Actor Claims
        |
        v
4. [ Role & Facility Guard ]    -> Verifies RBAC permissions against target resource
        |
        v
5. [ Schema Validation ]        -> Zod / Joi validation against typed DTOs (422 on failure)
        |
        v
6. [ Domain Service Execution ] -> Atomic database transaction (ACID boundary)
        |
        v
7. [ Standard Response Envelope]-> Formats `{ success: true, data: ..., error: null, meta: ... }`
```

---

## 3. Core Functional Module Specifications

### 3.1 Authentication & Authorization Module (`MOD-AUTH`)
* **Citizen OTP Login:** Accepts 10-digit Indian mobile number (`^[6-9]\d{9}$`). Generates a cryptographically random 6-digit numeric OTP (stored in Redis with a 300-second TTL and maximum 3 verification attempts).
* **Staff Credential Login:** Accepts username/email and password. Verifies password against salted Argon2id or Bcrypt ($cost \ge 12$) hash.
* **Token Issuance:** Generates asymmetric Ed25519 JWT access token (15-min expiry) containing `{ sub, role, facilityId, permissions }`. Generates cryptographically random 64-byte refresh token stored in PostgreSQL with token-family invalidation to detect token replay attacks.
* **ABHA Address Resolver:** Sandbox abstraction resolving 14-digit ABHA numbers to citizen profiles.

### 3.2 Facility Capability & Resource Module (`MOD-FACILITY`)
* **Equipment Verification Ledger:** Facilities maintain operational status (`OPERATIONAL`, `DOWN_FOR_MAINTENANCE`, `AWAITING_PARTS`) for critical equipment (Ultrasound, X-Ray, ECG, Biochemistry).
* **Doctor Duty Rosters:** Tracks doctor shifts (`SHIFT_MORNING`, `SHIFT_EVENING`, `SHIFT_NIGHT`, `ON_CALL`, `ABSENT`).
* **Spatial Matching Calculation:** Implements PostGIS `ST_DWithin` and `ST_Distance` queries over indexed spatial geometries (`geography(Point, 4326)`).

### 3.3 Dynamic Multi-Factor Facility Matching Engine (`MOD-MATCH`)
Executes the mathematical facility scoring formula defined in Master PRD Section 14:
$$\text{Score}(F) = 0.40 \cdot S_{\text{clinical}}(F) + 0.25 \cdot S_{\text{avail}}(F) + 0.20 \cdot S_{\text{capacity}}(F) + 0.15 \cdot S_{\text{proximity}}(F)$$
* **Binary Clinical Gate:** $S_{\text{clinical}}(F) = 0$ if facility lacks the exact specialty OR operational equipment. Overall score drops to 0.
* **Explainability Generation:** The backend constructs an explainable reason string returned in the payload (e.g., *"Matched CHC Sendhwa: Active Gynecologist on duty, Ultrasound operational, 18 km travel distance"*).

### 3.4 Queue & Token Lifecycle Engine (`MOD-QUEUE`)
* **Token Generator:** Daily sequential counter per department/doctor reset at 00:00 IST. Implemented via Redis `INCR` backed by database sequence to prevent duplicate numbers under high concurrency.
* **Priority Allocation Matrix:**
  * `EMG-`: Priority 1 (Immediate preemption of active doctor queue).
  * `REF-`: Priority 2 (Pre-reserved slot block, e.g., 10:00–11:00 AM).
  * `TEL-`: Priority 3 (Interspersed 1 video token every 4 physical OPD tokens).
  * `WLK-`: Priority 4 (Sequential First-Come, First-Served).
* **Dynamic Wait Time (EWT):** Recalculated every 15 minutes using the facility's rolling median consultation duration over the preceding 10 completed encounters:
  $$\text{EWT}_i = \sum_{k=1}^{n_{\text{ahead}}} \bar{T}_{\text{consult}} + \left(n_{\text{emergency}} \times T_{\text{emg\_buffer}}\right)$$

### 3.5 Closed-Loop Referral & Transfer Engine (`MOD-REF`)
* **Complete State Machine Transitions:**
  $$\text{DRAFT} \longrightarrow \text{PENDING\_ACCEPTANCE} \longrightarrow \text{ACCEPTED} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{ARRIVED\_CONFIRMED} \longrightarrow \text{CONSULTED} \longrightarrow \text{CLOSED}$$
* **SLA Escalation Engine:** Background cron (BullMQ) evaluates pending referrals:
  * Emergency Tier: SLA 30 minutes.
  * Urgent Tier: SLA 4 hours.
  * Routine Tier: SLA 24 hours.
* **Fallback Rerouting:** If receiving hospital rejects or SLA expires without acceptance, state transitions to `FALLBACK_REROUTING`. Engine automatically queries next best facility from `MOD-MATCH`, dispatches inbound dossier, and alerts District Health Operations desk.
* **Referral Closure Handshake:** Referral cannot transition to `CLOSED` until the receiving specialist enters consultation notes and the system transmits an electronic outcome receipt back to the originating PHC.

### 3.6 Offline Field Synchronization Engine (`MOD-SYNC`)
* **Batch Ingestion Handler:** Endpoint `POST /api/v1/sync/batch` receives an array of encrypted client mutations.
* **Idempotency Guarantee:** Every mutation contains client-generated UUIDv7 (`mutationId`). Backend checks `sync_logs` table. If `mutationId` already processed, backend skips re-execution and returns previously committed state.
* **Field-Level Conflict Resolution Strategy:**
  1. *Master Catalog Records:* Server always wins.
  2. *Clinical Encounters & Vitals:* Append-only. Both records preserved with distinct UUIDs and timestamps; contradictory clinical records flagged for doctor review.
  3. *Demographic Profile Updates:* Last-Write-Wins (LWW) evaluated using ISO 8601 UTC timestamps.

### 3.7 Healthcare Safety & Emergency Bypass Gate (`MOD-SAFETY`)
* **Deterministic Red-Flag Interceptor:** Before storing AI triage data or routing general appointments, the backend evaluates extracted entities against the hardcoded Red-Flag Catalog (Acute Coronary Syndrome, Stroke FAST, Severe Respiratory Distress, Postpartum Hemorrhage).
* **Bypass Execution:** Immediately sets token priority to `EMG-`, tags encounter record `RED_FLAG_ACTIVE`, generates emergency push/SMS notifications, and returns nearest 24/7 trauma center directions.
* **Zero Autonomous Prescription Gate:** The prescription service strictly rejects any mutation without a verified `doctorId` and valid digital signature token.

---

## 4. Transaction Boundaries & Concurrency Control

```
+----------------------------------------------------------------------------------------------------+
|                                    TRANSACTION BOUNDARY RULES                                      |
+---------------------+-------------------+---------------------+------------------------------------+
| Operation           | Isolation Level   | Locking Mechanism   | Rollback Condition                 |
+---------------------+-------------------+---------------------+------------------------------------+
| Token Issuance      | SERIALIZABLE      | Redis Mutex / P-Lock| Queue capacity exceeded / Duplicate|
| Referral Acceptance | READ COMMITTED    | SELECT FOR UPDATE   | Bed or specialist slot unavailable |
| Medicine Dispense   | READ COMMITTED    | Optimistic Version  | Insufficient stock on hand         |
| Offline Batch Sync  | READ COMMITTED    | Transaction per item| Malformed item; valid items commit |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 5. Non-Functional Requirements (Backend NFRs)

* **NFR-BE-001 (API Latency):** P95 response time $\le 300\text{ ms}$ for core operational endpoints (Token view, Queue status, Referral dispatch) under 5,000 concurrent active users.
* **NFR-BE-002 (Availability):** Service availability $\ge 99.9\%$ with zero single point of failure in the application container tier.
* **NFR-BE-003 (Sync Throughput):** Process a 50-mutation frontline sync batch within $\le 1200\text{ ms}$ on server-side execution.
* **NFR-BE-004 (Idempotency):** 100% duplicate-suppression guarantee across all state-mutating endpoints when `X-Idempotency-Key` is provided.

---

## 6. Acceptance Criteria (Given-When-Then)

### AC-BE-001: Closed-Loop Referral State Transition
* **Given** a valid referral in state `PENDING_ACCEPTANCE`,
* **When** the receiving hospital specialist submits `POST /api/v1/referrals/:id/accept` with a confirmed appointment time slot,
* **Then** the backend must transition referral state to `ACCEPTED`, create an inbound priority token (`REF-`) in the destination facility's queue, trigger SMS/Push notifications to the patient and ASHA, and record an audit log event within 500 ms.

### AC-BE-002: Offline Idempotent Mutation Replay
* **Given** an ASHA client resubmits a batch of 10 mutations containing 4 previously processed `mutationId` values,
* **When** `POST /api/v1/sync/batch` is executed,
* **Then** the backend must acknowledge the 4 duplicates without creating duplicate database rows, process the 6 new mutations atomically, and return all 10 mutation IDs in the sync success vector.

---

## 7. Cross-Domain Traceability
* **Master PRD Traceability:** Implements `FR-AUTH-001`, `FR-DISC-004`, `FR-QUEUE-001..004`, `FR-REF-001..005`, `FR-SYNC-001..003`, `FR-RES-001..004`.
* **Database Dependency:** Depends on PostgreSQL 16 schema domains defined in [`02_DATABASE_ARCHITECTURE_PRD.md`](file:///e:/Hackathon/SIH%202026/docs/prds/02_DATABASE_ARCHITECTURE_PRD.md).
* **API Dependency:** Implements REST endpoint contracts defined in [`03_API_INTEGRATION_PRD.md`](file:///e:/Hackathon/SIH%202026/docs/prds/03_API_INTEGRATION_PRD.md).
