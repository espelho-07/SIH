# DOMAIN PRD 04: FRONTEND PRODUCT & UX SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-FRONTEND-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Framework & Stack:** React 18 / Next.js 14 / Vite PWA, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, TanStack Query  
**Mandatory Skills Applied:** `ui-ux-pro-max`, `ui-styling`, `brand`, `vercel-react-best-practices`  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for Frontend & UX Team Implementation  

---

## 1. UX Design Philosophy & Rural Design Tokens

### 1.1 Core Principles (Derived from `ui-ux-pro-max` & `brand`)
1. **Low-Literacy First & Visual Affirmation:** Every clinical term or system action is paired with high-recognition universal pictograms (e.g., pregnant mother icon for ANC, blood drop for phlebotomy, ambulance icon for transport).
2. **Vernacular Speech as a First-Class Input:** Prominent, pulsating audio input triggers allow semi-literate citizens to speak symptoms in their regional language rather than navigate complex textual dropdowns.
3. **No Dead Ends / Always Offer a Path:** Every error, capacity-full, or machine-down state immediately presents an actionable alternative (e.g., fallback facility button or emergency 108 hotline trigger).
4. **Touch Target Sizing:** Minimum touch bounding box of $48 \times 48\text{ dp}$ across all mobile screens to accommodate field workers and users unaccustomed to precision capacitive touch.
5. **Color Contrast & Readability:** Strict WCAG 2.1 Level AA compliance with text-to-background contrast ratios $\ge 4.5:1$ for normal text and $\ge 3:1$ for large iconography.

### 1.2 Design System Tokens (`ui-styling` & Tailwind CSS)
* **Primary Palette (Trust & Public Health):**
  * `brand-primary-50`: `#F0FDF4` (Soft mint background)
  * `brand-primary-500`: `#16A34A` (Government health green)
  * `brand-primary-700`: `#15803D` (High-contrast active state)
* **Clinical Status Tokens:**
  * `emergency-red`: `#DC2626` (Red-Flag / Preemption / Urgent trauma)
  * `referral-blue`: `#2563EB` (Inbound digital referral tracking)
  * `teleconsult-purple`: `#9333EA` (Live video teleconsultation)
  * `offline-amber`: `#D97706` (Local cached / Unsynced data badge)
* **Typography Pairing:**
  * Headings: Inter / Noto Sans Devanagari (Semi-Bold, readable letter spacing)
  * Body: Inter / Noto Sans Regional (Medium, line-height $1.5$)

---

## 2. Mandatory Screen States Framework

In strict compliance with frontend engineering standards, **every screen** must implement 9 explicit visual states:

```
+----------------------------------------------------------------------------------------------------+
|                                      MANDATORY SCREEN STATES                                       |
+-------------------+--------------------------------------------------------------------------------+
| State             | Visual Presentation & Interaction Behavior                                     |
+-------------------+--------------------------------------------------------------------------------+
| 1. LOADING        | Accessible skeleton shimmer avoiding layout shifts; zero generic spinners.      |
| 2. EMPTY          | Culturally relevant illustration, friendly copy, and primary action button.    |
| 3. ERROR          | Actionable banner explaining the failure with a 1-click retry button.          |
| 4. SUCCESS        | Checkmark confirmation with auto-dismissing toast and updated dashboard badge. |
| 5. OFFLINE        | Persistent top amber banner: "Working Offline — Changes saved locally".         |
| 6. SYNCING        | Subtle rotating sync pill indicating background upload progress.               |
| 7. UNAUTHORIZED   | Informative message: "Access restricted to certified medical officers".       |
| 8. UNAVAILABLE    | Explains service downtime (e.g., "X-Ray down") with fallback facility links.   |
| 9. STALE DATA     | Amber badge on blood/beds older than 12h: "Stale data — Verify by phone".      |
+-------------------+--------------------------------------------------------------------------------+
```

---

## 3. Dedicated Role Consoles & Screen Specifications

### 3.1 Patient / Citizen Experience (`ROLE_PATIENT`)

#### Screen 1: Vernacular Home & Discovery (`/patient/home`)
* **Purpose:** Primary citizen dashboard for discovery, queue tracking, and voice intake.
* **Header:** Language Selector (10 languages) + Active Token Badge (if registered).
* **Hero Section:** Large vernacular voice button: *"यहाँ बोलकर बताएं क्या तकलीफ है"* (Tap to speak your symptoms).
* **Live Token Card (Conditional):** Displays live queue position (`WLK-42`), dynamic countdown (`~28 minutes wait`), room number, and doctor name.
* **Quick Action Grid:**
  * [Nearest Facilities with Operational Doctors]
  * [Blood Availability Check]
  * [My Prescriptions & Reports]

#### Screen 2: Assisted Voice Intake Modal (`/patient/triage`)
* **Interaction:** User taps microphone $\rightarrow$ Pulsing audio waveform visualizer $\rightarrow$ Speech stream transcribed in real-time in native script $\rightarrow$ Structured intake preview card appears.
* **Draft Intake Preview:** Lists extracted symptoms, severity, and duration with clear "Confirm" or "Re-record" options.
* **Emergency Bypass (Red-Flag):** If chest pain or stroke symptoms detected, screen flashes high-contrast red emergency banner with 1-click 108 calling and turn-by-turn map to nearest trauma hospital.

---

### 3.2 Frontline Worker Console (`ROLE_ASHA` / `ROLE_ANM`)

#### Screen 3: ASHA Offline Home & Task Board (`/asha/dashboard`)
* **Purpose:** Daily field schedule, high-risk maternal surveillance, and offline register.
* **Top Status Pill:** Indicates offline status and number of unsynced mutations (e.g., *"Offline Mode • 14 records pending sync"*).
* **High-Risk Maternal Watchlist (Red Category):** Prioritized list of pregnant mothers with systolic BP $\ge 140$ or missed ANC visits.
* **Today's Door-to-Door Action Plan:** Interactive card list of home visits with 1-click vitals recording forms.
* **Quick Floating Action Button:** `[+ New Offline Registration]`.

#### Screen 4: Field Vitals & Screening Form (`/asha/vitals`)
* **Inputs:** BP (Systolic/Diastolic), Blood Sugar (Fasting/Random), Hemoglobin ($\text{g/dL}$), Pulse, Weight.
* **Instant Risk Evaluation:** Automatic client-side validation rules immediately badge readings (e.g., Red badge for BP $> 140/90$).
* **Offline Save:** Saves record to local SQLite (`SQLCipher`) and queues mutation to outbox in $\le 50\text{ ms}$.

---

### 3.3 Doctor & Clinician Console (`ROLE_DOCTOR`)

#### Screen 5: Live OPD Queue & Consultation Pad (`/doctor/console`)
* **Split-Screen Layout:**
  * **Left Rail (Queue Stream):** Priority-tiered list of patients waiting (`EMG-` top, `REF-` next, `TEL-`, `WLK-`). Displays wait duration and chief complaint.
  * **Center Workspace (Longitudinal EHR):** Chronological timeline of patient encounters, previous prescriptions, and lab trends.
  * **Right Workspace (Prescription & Referral Pad):**
    * 3-click drug formulary search (NLEM catalog).
    * Diagnostic test ordering.
    * `[Create Digital Referral]` button.

#### Screen 6: Smart Referral Dispatcher (`/doctor/referrals/create`)
* **Purpose:** Clinician refers patient to higher-tier facility with automated capability matching.
* **Form Controls:** Urgency Tier selector (Emergency 30m / Urgent 4h / Routine 24h), Required Specialty dropdown, Diagnostic equipment required.
* **Live Matched Facilities Rail:** System queries matching engine and presents top 3 ranked hospitals with operational machinery, active specialist shifts, and travel distance.
* **1-Click Dispatch:** Transmits clinical notes, resting ECG, and vitals ahead of patient arrival.

---

### 3.4 Facility Staff Console (`ROLE_FACILITY_STAFF`)

#### Screen 7: Bed, Equipment & Inventory Hub (`/facility/operations`)
* **Bed Occupancy Gauge:** Real-time general and ICU bed count with 1-click `[+ Add Admission]` / `[- Discharge]`.
* **Equipment Operational Toggles:** Instant status switch for Ultrasound, X-Ray, and ECG machines (`OPERATIONAL` $\longleftrightarrow$ `DOWN_FOR_MAINTENANCE`).
* **Pharmacy Depletion Table:** Essential drug list highlighting items with $<7$ days of stock in red.
* **Inbound Referral Reception Desk:** List of incoming referred patients with expected arrival times and allocated priority tokens.

---

### 3.5 District Administrator Command Center (`ROLE_DISTRICT_ADMIN`)

#### Screen 8: Strategic Health Command Dashboard (`/admin/command`)
* **Spatial Outbreak Heatmap:** PostGIS geocoded map clustering reported fever and diarrhea cases to identify Dengue/Malaria clusters.
* **Closed-Loop Referral Completion Gauge:** Visual circular metric tracking percentage of referrals confirmed versus dropped out across the district.
* **Inter-Facility Stock Rebalance Control:** Recommends transferring excess Paracetamol from PHC-A to stock-depleted PHC-B.

---

## 4. Performance Optimization (`vercel-react-best-practices`)

1. **Eliminating Waterfalls:**
   * Parallel data fetching via `Promise.all()` for dashboard metrics, queue items, and notifications.
   * Route-level pre-fetching on hover for facility detail cards.
2. **Bundle Size & Dynamic Imports:**
   * Dynamic code splitting (`next/dynamic` or `React.lazy`) for heavy WebRTC video components, Recharts data visualization, and PostGIS maps.
   * Direct imports from icon and UI component libraries avoiding bloated barrel index files.
3. **Re-render Optimization:**
   * Fine-grained state selectors via Zustand to prevent entire queue lists from re-rendering when a single token timer ticks.
   * Virtualized windowing (`react-virtual`) for queue rails and drug inventories with $>100$ items.

---

## 5. Offline UX & Synchronization Mechanics

* **Visual Sync Pill States:**
  * Green: *"All records backed up to cloud"*.
  * Amber: *"Working offline • 8 records waiting for connection"*.
  * Blue (Pulsing): *"Syncing records..."*.
* **Sync Conflict Resolution Modal:** If an offline demographic edit conflicts with an online update, the user is presented with a side-by-side field comparison with an intuitive 1-click choice: *"Keep My Version"* or *"Use Hospital Version"*.

---

## 6. Frontend Acceptance Criteria

### AC-FE-001: Mobile Touch Target Compliance
* **Given** any interactive button, input field, or navigation link rendered on mobile viewports ($320\text{px} - 480\text{px}$),
* **When** tested via automated Chrome DevTools audit,
* **Then** 100% of touch bounding boxes must measure at least $48 \times 48\text{ dp}$ with no overlapping touch areas.

### AC-FE-002: Offline Form Submission Continuity
* **Given** an ASHA worker enters vitals on the offline screening screen with Wi-Fi and Cellular toggled off,
* **When** she taps `[Save Encounter]`,
* **Then** the UI must immediately display a green checkmark confirmation, increment the offline pending pill by +1, clear the form, and persist the record in encrypted local storage in $\le 100\text{ ms}$.
