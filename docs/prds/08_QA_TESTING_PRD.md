# DOMAIN PRD 08: QA, TESTING & QUALITY SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-QA-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Testing Tooling:** Jest, Vitest, PyTest, Supertest, Playwright, k6 (Load Testing), Axe-Core (Accessibility)  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for QA & Quality Assurance Team Implementation  

---

## 1. Testing Pyramid Architecture

Quality assurance spans 6 rigorous verification layers to guarantee reliability across all public health workflows:

```
+----------------------------------------------------------------------------------------------------+
|                                    TESTING PYRAMID ARCHITECTURE                                    |
|                                                                                                    |
|                                     / \                                                            |
|                                    /   \                                                           |
|                                   / E2E \       --> Playwright Headless (13 Flagship Journeys)     |
|                                  /-------\                                                         |
|                                 / Perform \     --> k6 Load & Stress Testing (5,000 Concurrent)    |
|                                / & Security\    --> OWASP ZAP & SAST SonarCloud Scans              |
|                               /-------------\                                                      |
|                              /  Integration  \  --> Supertest & Testcontainers PostgreSQL          |
|                             / & API Contract  \ --> Pact / Spectral OpenAPI Schema Testing         |
|                            /-------------------\                                                   |
|                           /  Unit & Logic Tests \ --> Jest / Vitest / PyTest (>= 85% Code Coverage)|
|                          +-----------------------+                                                 |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Mandatory Quality Gates (CI Pipeline Enforcers)

No code merge or container deployment is permitted without satisfying all 8 non-negotiable quality gates:

```
+----------------------------------------------------------------------------------------------------+
|                                      MANDATORY QUALITY GATES                                       |
+---------------------+-------------------+---------------------+------------------------------------+
| Quality Gate        | Enforcing Tool    | Mandatory Threshold | Action on Failure                  |
+---------------------+-------------------+---------------------+------------------------------------+
| 1. Static Typecheck | TypeScript (`tsc`)| Zero errors         | Pipeline fails; blocks PR merge    |
| 2. Code Linting     | ESLint / Ruff     | Zero warnings/errors| Pipeline fails; blocks PR merge    |
| 3. Unit Test Scope  | Vitest / PyTest   | $\ge 85\%$ coverage | Pipeline fails; blocks PR merge    |
| 4. Security Scan    | Trivy / OWASP ZAP | 0 Critical / 0 High | Pipeline fails; alerts Security    |
| 5. API Compatibility| Spectral OpenAPI  | 100% schema match   | Pipeline fails; blocks release     |
| 6. Performance SLA  | k6 Load Test      | P95 $\le 300\text{ms}$| Pipeline fails; flags regression |
| 7. Accessibility    | Axe-Core / Pa11y  | 100% WCAG 2.1 AA    | Pipeline fails; blocks UI merge    |
| 8. E2E Journeys     | Playwright        | 13/13 Pass (100%)   | Pipeline fails; blocks deployment  |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 3. The 13 Critical End-to-End User Journeys

Every release must automatically execute and pass these 13 end-to-end integration journeys:

### Journey 1: Citizen Registration to In-Person OPD Consultation
* Citizen registers via Mobile OTP $\rightarrow$ Generates daily walk-in token (`WLK-`) $\rightarrow$ Doctor console advances queue $\rightarrow$ Token called $\rightarrow$ Doctor records ICD-10 diagnosis and e-prescription $\rightarrow$ Pharmacist dispenses medicine and inventory decrements.

### Journey 2: ASHA Door-to-Door Field Screening to Doctor Queue
* ASHA registers pregnant mother in offline hamlet $\rightarrow$ Captures elevated blood pressure ($160/100$) $\rightarrow$ Enters Wi-Fi zone $\rightarrow$ Automatic background sync uploads mutation batch $\rightarrow$ PHC doctor console highlights high-risk badge.

### Journey 3: Closed-Loop Referral with Guaranteed Fallback Rerouting
* PHC Doctor submits urgent referral requiring Echocardiogram to District Hospital Barwani $\rightarrow$ Barwani Echo machine is flagged `DOWN_FOR_MAINTENANCE` $\rightarrow$ System rejects direct routing $\rightarrow$ Matching engine recommends CHC Sendhwa $\rightarrow$ Sendhwa accepts $\rightarrow$ Pre-arrival clinical summary transmitted $\rightarrow$ Patient attends with reserved token `REF-` $\rightarrow$ Outcome receipt sent back to PHC doctor.

### Journey 4: Emergency Red-Flag Speech Intake Bypass
* Citizen speaks severe chest pain into vernacular voice assistant $\rightarrow$ ASR and NER detect Acute Coronary Syndrome $\rightarrow$ General symptom Q&A halted $\rightarrow$ High-contrast red emergency screen displays $\rightarrow$ 1-click calling to 108 trauma line and turn-by-turn navigation to nearest 24/7 cardiac hospital rendered.

### Journey 5: Diagnostic Hub-and-Spoke Phlebotomy Pipeline
* PHC Medical Officer orders Liver Function Test $\rightarrow$ Phlebotomist scans barcoded tube $\rightarrow$ Sample added to digital cold-chain manifest $\rightarrow$ CHC central lab receives batch and uploads signed PDF report $\rightarrow$ Critical value alert triggers notification to doctor $\rightarrow$ Results append to citizen longitudinal timeline.

### Journey 6: Offline-First ASHA Concurrent Conflict Resolution
* ASHA-1 updates patient village address offline; ASHA-2 records new vital observation offline $\rightarrow$ Both tablets reconnect simultaneously $\rightarrow$ Server processes sync batches $\rightarrow$ CRDT engine merges non-conflicting fields and preserves both clinical vitals with distinct timestamps.

### Journey 7: Real-Time WebRTC Teleconsultation with Adaptive Audio Degradation
* Doctor and rural patient initiate video consultation $\rightarrow$ Bandwidth throttled to 48 kbps via network proxy $\rightarrow$ Video feed smoothly pauses with warning badge while audio stream maintains clear, uninterrupted 16kHz speech.

### Journey 8: Blood Bank Emergency Unit Reservation & Staleness Warning
* Clinician checks Blood Group B+ availability $\rightarrow$ Facility inventory older than 12 hours displays amber "Stale — Verify by Phone" badge $\rightarrow$ Active inventory allows 1-click reserve with SMS alert to blood bank technician.

### Journey 9: Community Transport Ambulance Dispatch Coordination
* Emergency referral tagged `NEEDS_TRANSPORT` $\rightarrow$ System matches nearest idle BLS ambulance $\rightarrow$ Driver receives SMS with patient pickup coordinates and hospital emergency room contact.

### Journey 10: Seasonal Epidemic Stock Depletion Early Warning
* Nightly Prophet forecasting job runs $\rightarrow$ Identifies predicted Dengue surge in Barwani Block $\rightarrow$ IV Saline stock projected to deplete in 6 days $\rightarrow$ Automated stock replenishment alert generated on District CMHO dashboard.

### Journey 11: Community High-Risk Maternal Follow-Up Closure
* Postpartum mother discharged from District Hospital $\rightarrow$ System automatically schedules Day-3 home visit on ASHA's worklist $\rightarrow$ ASHA visits mother, records normal vitals, and marks follow-up `CLOSED`.

### Journey 12: Emergency "Break-Glass" Security Access & Audit Trail
* Unconscious trauma victim arrives at emergency room $\rightarrow$ Doctor initiates Break-Glass override with mandatory clinical reason $\rightarrow$ Access granted for 60 minutes $\rightarrow$ Immutable audit log recorded and SMS alert dispatched to patient's family.

### Journey 13: Facility Equipment Breakdown mid-Shift with Auto-Reroute
* Technician flags District Hospital Digital X-Ray `DOWN_FOR_MAINTENANCE` $\rightarrow$ System identifies 14 active referral tokens heading to that machine $\rightarrow$ System sends instant SMS alerts to patients and reroutes tokens to secondary operational CHC.

---

## 4. Failure, Chaos & Resilience Test Suite

```
+----------------------------------------------------------------------------------------------------+
|                                     CHAOS & RESILIENCE TESTS                                       |
+---------------------+-------------------+---------------------+------------------------------------+
| Test Case           | Failure Injection | Expected Resilient Behavior                              |
+---------------------+-------------------+---------------------+------------------------------------+
| **TC-FAIL-001**     | 100% Cellular Net | Client seamlessly continues local operations; forms        |
|                     | Drop during intake| cache in SQLite; persistent offline banner renders.        |
| **TC-FAIL-002**     | 100 Concurrent    | Redis distributed mutex prevents sequence collision;      |
|                     | Token Requests    | exactly 100 unique sequential tokens issued (No gaps).    |
| **TC-FAIL-003**     | Database Process  | API returns graceful HTTP 503; retry queue buffers writes; |
|                     | Killed (SIGKILL)  | restarts in <= 30s with zero corrupted transaction state.  |
| **TC-FAIL-004**     | AI Microservice   | Circuit breaker trips in <= 3000 ms; fallback categorical  |
|                     | Unresponsive      | manual symptom buttons immediately display to user.        |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 5. QA Acceptance Criteria

### AC-QA-001: Automated E2E Regression Pass Rate
* **Given** the full suite of 13 critical Playwright E2E journey tests executed against the staging build,
* **When** run under simulated network latency (100 ms) and multi-user concurrency,
* **Then** 100% of test journeys must pass without manual intervention or flaky timeout failures.

### AC-QA-002: Accessibility Automated Compliance
* **Given** automated Axe-Core accessibility scans executed across all 18 primary application views,
* **When** evaluated against WCAG 2.1 Level AA criteria,
* **Then** the report must confirm **zero critical, zero serious, and zero moderate accessibility violations**.
