# DOMAIN PRD 06: SECURITY, PRIVACY & RESPONSIBLE TECHNOLOGY SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-SECURITY-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Regulatory Standards:** Indian Digital Personal Data Protection (DPDP) Act 2023, National Digital Health Blueprint (NDHB), ISO/IEC 27001, OWASP Top 10 (2021)  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for Security & Compliance Team Implementation  

---

## 1. System Threat Model (STRIDE Methodology)

The security architecture addresses specific threat vectors unique to rural public healthcare networks:

```
+----------------------------------------------------------------------------------------------------+
|                                    STRIDE THREAT MODEL MATRIX                                      |
+---------------------+-------------------+---------------------+------------------------------------+
| STRIDE Category     | Concrete Attack   | Vulnerability Point | Implemented Architectural Defense  |
+---------------------+-------------------+---------------------+------------------------------------+
| **Spoofing**        | Doctor Imperson-  | Forged clinician JWT| Asymmetric Ed25519 JWT signing;    |
|                     | ation             | or stolen credential| staff credentials tied to HPR registry|
| **Tampering**       | Referral Priority | Intercepted referral| Cryptographic HMAC on referral     |
|                     | Elevation         | payload in transit  | payloads; database check constraints|
| **Repudiation**     | Denial of Clinical| Disputed diagnosis  | Immutable, append-only audit trail |
|                     | Consultation Note | or prescription     | with doctor timestamp & signature  |
| **Information**     | Unauthorized PII  | Eavesdropping or SQL| TLS 1.3 everywhere; AES-256 column |
| **Disclosure**      | / PHI Exfiltration| Injection on patient| encryption; parameterized queries  |
| **Denial of**       | Queue Starvation /| Scripted bot flood  | Redis sliding-window rate limiting;|
| **Service**         | Token Hoarding    | on token issuance   | mobile OTP verification requirement|
| **Elevation of**    | Receptionist acting| Broken object-level | Strict RBAC middleware checking    |
| **Privilege**       | as Medical Officer| authorization (BOLA)| role claims & institutional scope  |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 2. Specific Healthcare Attack Scenarios & Mitigations

### 2.1 Scenario 1: Theft or Physical Compromise of ASHA Offline Tablet
* **Risk:** Frontline worker's tablet is lost or stolen in a village; device contains cached offline patient registers.
* **Mitigation:**
  1. Local database is encrypted at rest using **SQLCipher (AES-256)** with a key derived via PBKDF2 from a hardware-backed keystore + user PIN.
  2. The mobile app automatically locks after 5 minutes of inactivity.
  3. Remote wipe command dispatched via FCM on next network heartbeat if device reported stolen.

### 2.2 Scenario 2: Manipulation of Facility Bed or Blood Availability Ledger
* **Risk:** Malicious actor updates District Hospital blood inventory to show zero units, causing panic or diverting patients.
* **Mitigation:**
  1. Only staff accounts with verified `FACILITY_STAFF` or `BLOOD_BANK_OFFICER` roles assigned to that specific `facility_id` can mutate inventory rows.
  2. All inventory mutations require an audit trail entry recording `staff_user_id`, `prior_quantity`, `new_quantity`, and `client_ip`.
  3. Automatic anomaly detection flags any sudden $>50\%$ inventory drop for supervisor review.

### 2.3 Scenario 3: Unauthorized Cross-Facility Medical Record Access
* **Risk:** A doctor at Facility A attempts to browse clinical records of a patient who only visited Facility B.
* **Mitigation:**
  1. Backend enforces explicit Consent Artifact validation (`consent_artifacts` table). A doctor can only access records if:
     * Patient is currently in the doctor's active queue token list.
     * Patient has an active referral targeting the doctor's facility.
     * The doctor initiates an auditable **"Break-Glass Emergency Override"**.

---

## 3. Emergency "Break-Glass" Access Protocol

In severe polytrauma, unconsciousness, or acute obstetric shock, a certified emergency room clinician can bypass consent requirements to view critical medical history (allergies, blood group, chronic conditions):
1. **Trigger:** Clinician clicks `[Emergency Break-Glass Access]` on the patient search view.
2. **Mandatory Input:** Clinician must enter an explicit clinical justification (e.g., *"Unconscious polytrauma patient in Shock Room 1"*).
3. **Execution:** Access granted for a single 60-minute window restricted to read-only clinical summaries.
4. **Audit Alert:** Backend immediately generates an immutable P0 Security Audit Event, pushes an SMS alert to the patient's registered mobile number, and flags the incident on the District CMHO Security Dashboard.

---

## 4. Cryptographic Standards & Key Management

* **Transport Layer Security:** TLS 1.3 mandatory with HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`). Insecure ciphers (SSLv3, TLS 1.0, TLS 1.1) disabled.
* **Data at Rest Encryption:** PostgreSQL transparent data encryption (TDE) utilizing AES-256-GCM.
* **Asymmetric Session Signing:** Ed25519 private key stored in an isolated Hardware Security Module (HSM) or cloud KMS (AWS KMS / HashiCorp Vault); public key cached by API Gateway for fast, distributed token verification.
* **Password Storage:** Staff passwords hashed using **Argon2id** ($m=65536, t=3, p=4$).

---

## 5. Indian DPDP Act 2023 Compliance Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                  DPDP ACT 2023 COMPLIANCE ENGINE                                   |
+---------------------+-------------------+---------------------+------------------------------------+
| Statutory Principle | System Mapping    | Technical Implementation                                 |
+---------------------+-------------------+---------------------+------------------------------------+
| **Notice & Consent**| Digital Consent   | Cryptographic consent artifacts captured via OTP;        |
|                     | Artifacts         | multilingual notice presented before data collection.   |
| **Purpose**         | Scoped API Access | Consent tokens specify valid duration and purpose code   |
| **Limitation**      |                   | (e.g., 'REFERRAL_CONSULTATION'). Cross-use blocked.      |
| **Data**            | In-Memory Audio   | ASR audio streams discarded post-transcription; PII      |
| **Minimization**    | Processing        | stripped before ML summarization.                        |
| **Right to**        | Demographic Edit  | Citizens can correct misspelt names/DOB via ASHA workers;|
| **Correction**      | Workflows         | previous values archived in versioned audit trail.       |
| **Data Retention**  | 7-Year NMC Rule   | Clinical records retained for 7 years; automated batch   |
|                     | Lifecycle         | archival to cold encrypted storage thereafter.           |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 6. Immutable Audit Logging Specification

Every view, query, mutation, or export of Protected Health Information (PHI) writes an immutable record to the partitioned `audit_logs` table:

```json
{
  "logId": "aud-0191d9f8-7b24-7f11-92be-4a56c0b31e90",
  "timestamp": "2026-09-09T17:12:44.120Z",
  "actorId": "usr-0191d9f8-doc1",
  "actorRole": "DOCTOR",
  "facilityId": "fac-0191d9f8-1122",
  "action": "PHI_VIEW_LONGITUDINAL_EHR",
  "targetCitizenId": "cit-0191d9f8-3344",
  "ipAddress": "103.21.144.12",
  "userAgent": "Mozilla/5.0 (Android 11; Mobile; rv:109.0)",
  "accessJustification": "ACTIVE_OPD_CONSULTATION",
  "consentArtifactId": "con-0191d9f8-8899"
}
```

---

## 7. Security Acceptance Criteria

### AC-SEC-001: Prevention of Broken Object-Level Authorization (BOLA)
* **Given** an authenticated doctor logged into PHC Sendhwa (`facility_id: fac-A`),
* **When** the doctor attempts to query `GET /api/v1/referrals/ref-B` belonging exclusively to District Hospital Barwani (`facility_id: fac-B`) without an active referral linkage,
* **Then** the API gateway must reject the request with HTTP 403 Forbidden (`ERR_UNAUTHORIZED_RESOURCE_SCOPE`) and log a security audit event.

### AC-SEC-002: Offline Storage SQLCipher Encryption Validation
* **Given** an ASHA mobile tablet running the Sanjeevani Android application,
* **When** the physical `.db` SQLite database file is extracted via ADB shell and inspected with standard non-encrypted SQLite tools,
* **Then** the file header must return raw encrypted ciphertext and fail to open without the hardware-derived decryption key.
