# DOMAIN PRD 07: DEVOPS, DEPLOYMENT & INFRASTRUCTURE SPECIFICATION

**Platform Code:** SIH26133  
**Project Name:** SANJEEVANI-CONNECT (संजीवनी-कनेक्ट)  
**Document Reference:** PRD-SIH26133-DOM-DEVOPS-V1.0  
**Parent Document:** [`MASTER_PRD_SIH26133.md`](file:///e:/Hackathon/SIH%202026/MASTER_PRD_SIH26133.md)  
**Target Infrastructure:** Docker Containerized Architecture / Kubernetes (K8s) on Cloud or National NIC MeghRaj Data Center  
**Classification:** Google-Quality Production Engineering Specification  
**Status:** Frozen for DevOps & Infrastructure Team Implementation  

---

## 1. Multi-Environment Topology

The platform operates across four isolated environments to guarantee stability and prevent untested changes from impacting healthcare operations:

```
+----------------------------------------------------------------------------------------------------+
|                                   MULTI-ENVIRONMENT TOPOLOGY                                       |
+---------------------+-------------------+---------------------+------------------------------------+
| Environment         | Infrastructure    | Data Configuration  | Deployment Trigger                 |
+---------------------+-------------------+---------------------+------------------------------------+
| **1. Development**  | Local Docker      | Anonymized seed     | Manual / Local git branch          |
|                     | Compose on dev PC | synthetic dataset   | feature work                       |
| **2. Testing / CI** | Ephemeral GitHub  | Automated synthetic | Pull Request creation or update    |
|                     | Actions runners   | test fixtures       | to `main` or `develop`             |
| **3. Staging**      | NIC MeghRaj Cloud | Sanitized pilot data| Merge to `develop` branch          |
|                     | staging cluster   | with mock gateways  | (Automated CD pipeline)            |
| **4. Production**   | High-Availability | Live encrypted      | Tagged release (e.g., `v1.0.0`)     |
|                     | Multi-Zone K8s    | patient databases   | with manual approval gate          |
+---------------------+-------------------+---------------------+------------------------------------+
```

---

## 2. Infrastructure Architecture & Container Topology

```
+----------------------------------------------------------------------------------------------------+
|                               PRODUCTION DEPLOYMENT TOPOLOGY                                       |
|                                                                                                    |
|  [ Public Internet / Cellular Towers (2G / 3G / 4G / 5G) ]                                         |
|                                |                                                                   |
|                                v                                                                   |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Cloud Load Balancer (HTTPS 443 / WSS) - TLS 1.3 Termination & DDoS Mitigation (Nginx / HAProxy)| |
|  +-----------------------------------------------------------------------------------------------+ |
|                                |                                                                   |
|         +----------------------+----------------------+----------------------+                     |
|         |                                             |                      |                     |
|         v                                             v                      v                     |
|  +-----------------------------+      +-----------------------------+  +-------------------------+ |
|  | Core Backend Replicas (x3)  |      | AI Microservice Worker (x2) |  | COTURN STUN/TURN Server | |
|  | (Node.js / Express Container|      | (Python FastAPI + ONNX)     |  | (WebRTC Media Relay)    | |
|  |  Stateless Pods)            |      | (GPU/vCPU Accelerated Pods) |  | (Ports 3478 / 5349)     | |
|  +-----------------------------+      +-----------------------------+  +-------------------------+ |
|                 |                                     |                                            |
|                 +------------------+------------------+                                            |
|                                    |                                                               |
|                                    v                                                               |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Internal High-Speed Virtual Private Cloud (VPC) Data Tier                                     | |
|  |  * Primary PostgreSQL 16 (PostGIS) - Master Write Node (Encrypted NVMe)                       | |
|  |  * Read-Replica PostgreSQL 16 - Streaming Replication (Asynchronous)                          | |
|  |  * Redis 7 In-Memory Cluster - Active Token Queues & Pub/Sub Event Bus                        | |
|  |  * MinIO / S3 Encrypted Object Store - Diagnostic PDF Reports & Audio Transcripts              | |
|  +-----------------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Automated CI/CD Pipeline (GitHub Actions)

Every pull request and merge triggers an automated pipeline enforcing quality and security gates:

```text
[ Push / PR Event ]
        |
        v
1. [ Lint & Typecheck ]      -> ESLint, Prettier, TypeScript strict check (`tsc --noEmit`)
        |
        v
2. [ Security SAST Scan ]    -> SonarCloud / Trivy container vulnerability scanner
        |
        v
3. [ Unit & Integration Tests]-> Jest / Vitest / PyTest against containerized PostgreSQL fixture
        |
        v
4. [ API Contract Verification]-> Spectral OpenAPI validation + Pact contract test
        |
        v
5. [ Docker Multi-Arch Build]-> BuildKit cached image build (`linux/amd64`, `linux/arm64`)
        |
        v
6. [ Staging Auto-Deploy ]   -> Rolling update to Kubernetes staging cluster
        |
        v
7. [ Smoke Test Execution ]  -> Automated Playwright headless synthetic health checks
```

---

## 4. Zero-Downtime Database Migration Protocol

To prevent schema locks and application downtime during releases:
1. **Backward-Compatible Migrations:** All schema changes must follow the *Expand/Contract* pattern. Adding a column must provide a default or allow NULL; removing a column requires a 2-release deprecation cycle.
2. **Migration Tooling:** Managed via versioned migration scripts (e.g., Prisma Migrate / Knex / Flyway).
3. **Execution Gate:** Migrations run as a Kubernetes `pre-install` / `pre-upgrade` Helm hook prior to routing traffic to new container versions.
4. **Automated Rollback:** If a migration script fails, the transaction is rolled back and the deployment halts immediately without terminating running pods.

---

## 5. High-Availability, Backups & Disaster Recovery (DR)

* **Recovery Objectives:**
  * **RPO (Recovery Point Objective):** $\le 5\text{ minutes}$ (Continuous PostgreSQL Write-Ahead Log [WAL] streaming to encrypted S3 bucket).
  * **RTO (Recovery Time Objective):** $\le 30\text{ minutes}$ (Automated infrastructure recreation via Terraform/Helm).
* **Backup Cadence:**
  * Full snapshot daily at 02:00 IST (Off-peak). Retained for 30 days.
  * Continuous incremental WAL archiving every 5 minutes. Retained for 7 days.
  * Monthly disaster recovery restoration drills executed in the staging environment.

---

## 6. Observability, Logging & Alerting

### 6.1 Application Health Check Probes
* **Liveness Probe (`GET /api/v1/health`):** Verifies application event loop responsiveness. Fails if process is deadlocked ($timeout = 3\text{s}$).
* **Readiness Probe (`GET /api/v1/health/ready`):** Verifies active database connection pool and Redis ping. If PostgreSQL is unreachable, the container is taken out of the load balancer pool.

### 6.2 Metrics & Telemetry (Prometheus & Grafana)
* **API Metrics:** Request rate (req/s), error rate (HTTP 5xx percentage), P50/P95/P99 latency histograms.
* **Queue Metrics:** Active tokens in queue, average wait time per department, emergency token preemption counts.
* **Referral Metrics:** Unacknowledged referrals approaching SLA thresholds (30m/4h/24h).
* **AI Metrics:** ASR inference duration, entity extraction confidence distribution, circuit breaker trips.

---

## 7. DevOps Acceptance Criteria

### AC-OPS-001: Rolling Zero-Downtime Deployment
* **Given** the production cluster is handling 2,000 active concurrent user sessions,
* **When** a new container release is deployed via Kubernetes rolling update,
* **Then** 0% of active HTTP requests shall return 502 Bad Gateway or drop connection, and P95 latency shall not spike by $>15\%$ during the rollout.

### AC-OPS-002: Automated Container Health Self-Healing
* **Given** a backend container instance experiences an out-of-memory (OOM) event or unhandled process crash,
* **When** the liveness probe fails 3 consecutive checks (15 seconds),
* **Then** the container orchestrator must automatically terminate the faulty pod, spin up a healthy replacement pod, and restore service capacity in $\le 45\text{ seconds}$.
