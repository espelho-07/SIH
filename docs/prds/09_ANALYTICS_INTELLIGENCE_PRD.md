# DOMAIN PRD 09: ANALYTICS, MONITORING & HEALTHCARE INTELLIGENCE SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-ANALYTICS-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Analytics Engine:** PostgreSQL 16 TimescaleDB Extensions / Materialized Views / ClickHouse (Roadmap)  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for Analytics & Intelligence Team Implementation  

---

## 1. Analytics Architecture & Aggregation Pipeline

To ensure that analytical queries never degrade real-time clinical transaction throughput on the primary PostgreSQL database, the analytics architecture utilizes **Read-Replica Streaming** and **Automated Materialized Views** refreshed every 15 minutes.

```
+----------------------------------------------------------------------------------------------------+
|                                    ANALYTICS PIPELINE TOPOLOGY                                     |
|                                                                                                    |
|  [ Primary PostgreSQL 16 Master ] ---> (Transactional Writes: Encounters, Tokens, Referrals)       |
|                 |                                                                                  |
|                 v (WAL Streaming Asynchronous Replication)                                         |
|  [ PostgreSQL Read-Replica ]                                                                       |
|                 |                                                                                  |
|                 v (Scheduled Cron Worker: Every 15 Minutes)                                        |
|  +-----------------------------------------------------------------------------------------------+ |
|  | MATERIALIZED AGGREGATION VIEWS                                                                | |
|  |  * mv_facility_hourly_metrics    * mv_referral_loop_completion  * mv_disease_cluster_spatial    | |
|  |  * mv_drug_depletion_velocity   * mv_queue_waiting_times       * mv_asha_field_coverage        | |
|  +-----------------------------------------------------------------------------------------------+ |
|                 |                                                                                  |
|                 v                                                                                  |
|  [ REST Analytics APIs ] ---> /api/v1/analytics/* (Cached in Redis for 300 seconds)                |
|                 |                                                                                  |
|                 v                                                                                  |
|  [ Role Dashboards: Facility Ops | District CMHO Command Center | State Health Mission ]          |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Multi-Tier Healthcare Metrics Catalog

### 2.1 Tier 1: Patient-Centric Experience Metrics
1. **Average OPD Waiting Time ($\text{AWT}$):** Duration from token generation to consultation initiation (`called_at - created_at`). Target: $\le 45\text{ minutes}$.
2. **Patient Travel Distance Avoided:** Cumulative kilometers saved by resolving primary concerns at local PHCs or via teleconsultation rather than traveling to District Hospitals.
3. **Closed-Loop Referral Completion Rate:** Percentage of issued referrals that culminate in a confirmed specialist consultation receipt. Target: $\ge 80\%$.
4. **Diagnostic Turnaround Time (TAT):** Elapsed hours from sample collection at peripheral PHC to verified report availability on citizen timeline.

### 2.2 Tier 2: Facility Operational Metrics
1. **Equipment Operational Uptime:** Percentage of operating hours critical machinery (Ultrasound, X-Ray, ECG) is flagged `OPERATIONAL`.
2. **Bed & ICU Occupancy Ratio:** Real-time occupied beds versus sanctioned capacity. Threshold $>85\%$ triggers warning; $>95\%$ triggers redirection.
3. **Doctor Shift Adherence:** Percentage of scheduled doctor duty hours with active consultation activity.
4. **Essential Drug Stock-Out Frequency:** Number of NLEM medicines with stock level $< 7$ days of average consumption.

### 2.3 Tier 3: District & Epidemiological Metrics
1. **Spatial Epidemic Cluster Density:** Geospatial clustering (DBSCAN over PostGIS coordinates) of reported fever, acute diarrhea, or respiratory infections flagging early disease outbreaks.
2. **Specialist Deficit Index:** Ratio of specialist referrals generated versus completed consultations within the district.
3. **High-Risk Maternal Follow-Up Coverage:** Percentage of mothers flagged with gestational hypertension or diabetes who receive timely ASHA home visits.

---

## 3. Dedicated Operational & Strategic Dashboards

```
+----------------------------------------------------------------------------------------------------+
|                                      ROLE-BASED DASHBOARDS                                         |
+---------------------+-------------------+---------------------+------------------------------------+
| Dashboard Type      | Primary Actor     | Visual Components   | Actionable Decision Capability     |
+---------------------+-------------------+---------------------+------------------------------------+
| **1. Facility**     | Facility Staff /  | Hourly Queue Depth, | Toggle emergency bed buffers;      |
| **Operations**      | Medical Supdt     | Bed Gauges, Drug Dep| reassign doctor chambers; update   |
|                     |                   | -letion Countdown   | broken equipment status.           |
| **2. District CMHO**| District Health   | Outbreak Heatmap,   | Coordinate inter-facility drug     |
| **Command Center**  | Officer / Admin   | Referral Loop Gauges| rebalancing; deploy mobile medical |
|                     |                   | 30-Day Demand Chart | units to disease clusters.         |
| **3. Community**    | ASHA / ANM        | Village Coverage Map| Prioritize overdue maternal and    |
| **Surveillance**    | Supervisor        | Missed Immunizations| infant home visits; manage offline |
|                     |                   | High-Risk Watchlist | synchronization queues.            |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 4. Data Quality, Missing Data & Anti-Fabrication Principles

1. **Zero Fabricated Statistics:** Under no circumstances shall the platform generate placeholder or random numbers to populate dashboard widgets.
2. **Explicit Staleness Badging:** If an inventory or bed record has not been updated within the last 12 hours, the widget displays an explicit warning: `[!] Unverified Data — Last confirmed 14 hours ago`.
3. **Delayed Sync Imputation Flagging:** When metrics incorporate late-arriving offline batches from ASHA tablets, the dashboard visually indicates historical retro-fitted data points with a dotted trendline.

---

## 5. Analytics Acceptance Criteria

### AC-ANA-001: Materialized View Refresh Performance
* **Given** an active database with 100,000 encounters and 15,000 active referrals,
* **When** the scheduled background cron executes `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_referral_loop_completion`,
* **Then** the refresh must complete in $\le 4.5\text{ seconds}$ without taking exclusive table locks on the primary transaction tables.

### AC-ANA-002: Real-Time Referral Completion Rate Metric
* **Given** a district has 200 referrals generated in the last 7 days, of which 164 have confirmed consultation outcome receipts,
* **When** queried via `GET /api/v1/analytics/district-overview`,
* **Then** the response must return `referralCompletionRate: 0.82` ($82.0\%$) and complete the API request in $\le 150\text{ ms}$.
