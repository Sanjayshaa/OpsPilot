# OpsPilot — Multi-Agent AI DevOps & Cloud Operations Platform

> An AI-native, multi-agent platform designed for autonomous incident investigation, infrastructure management, observability, and policy-governed cloud operations.

---

## 🎯 Project Vision

OpsPilot is evolving from a single-provider container management tool into an **infrastructure-agnostic AI DevOps and Cloud Operations platform**. 

Rather than functioning as a standard conversational chatbot, OpsPilot is architected as an **evidence-driven multi-agent system** that investigates production incidents by cross-correlating runtime telemetry, git changes, architecture dependencies, and system state, safely executing human-approved remediations.

In this architecture, **Docker is only one execution provider** among several planned infrastructure targets.

---

## 🏛️ Current Architecture (Phase 13 Baseline)

```
                ┌──────────────────────────────────────┐
                │    OpsPilot Web UI (React + Vite)    │
                │     Tailwind CSS + Lucide Icons      │
                └──────────────────┬───────────────────┘
                                   │ REST API / Axios
                ┌──────────────────▼───────────────────┐
                │        FastAPI Control Plane         │
                │        Domain Models & Config        │
                └──────────────────┬───────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │  ProviderRegistry   │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │ BaseInfrastructureProvider Abstraction  │
              └────────────────────┬────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   DockerProvider    │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
       ┌────────────────────────┐    ┌────────────────────────┐
       │     Docker Daemon      │    │  Resilient Demo Mode   │
       │ (/var/run/docker.sock) │    │  (In-Memory Fallback)  │
       └────────────────────────┘    └────────────────────────┘
```

---

## ✅ Current Status & Implemented Features

### Development Status: **Phase 13 Complete (Verified & Tested)**

| Component | Status | Details |
|---|---|---|
| **Provider Abstraction** | **IMPLEMENTED** | `BaseInfrastructureProvider` interface decoupling core API from container runtime |
| **Provider Registry** | **IMPLEMENTED** | `ProviderRegistry` for dynamic provider resolution and registration (`/api/providers`) |
| **Docker Provider** | **IMPLEMENTED** | `DockerProvider` supporting full container lifecycle, inspection, stats, and logs |
| **Demo / Mock Fallback** | **IMPLEMENTED** | Automatic zero-crash fallback to simulated environment when Docker socket is unavailable |
| **Domain Models** | **IMPLEMENTED** | Base schemas for `Workload`, `HostStats`, `Project`, `Environment`, `DeploymentSpec` |
| **Infrastructure Dashboard** | **IMPLEMENTED** | Live KPI cards: Total/Running/Stopped containers, host CPU/RAM/Disk metrics |
| **Container Lifecycle** | **IMPLEMENTED** | Interactive actions: Start, Stop, Restart, and Remove containers |
| **Deployment Wizard** | **IMPLEMENTED** | One-click presets (Nginx, Redis, Postgres, MongoDB, Node.js, Ubuntu) & custom images |
| **Telemetry & Monitoring** | **IMPLEMENTED** | Real-time container CPU %, RAM allocation, and Network I/O (Rx/Tx) |
| **Log Viewer & Downloader** | **IMPLEMENTED** | Dark terminal log stream with search filter, log level filters, and download |
| **Docker Resource Cleanup**| **IMPLEMENTED** | Inspection of local images, volumes, and networks with system prune capability |
| **Automated Test Suite** | **IMPLEMENTED** | 7/7 unit & contract tests passing with `pytest` |

---

## 🔮 Future Roadmap (Planned Capabilities)

The following capabilities are specified in [`docs/OPSPILOT_MASTER_VISION.md`](file:///Users/sanjay/docker%20container%20project/docs/OPSPILOT_MASTER_VISION.md) and scheduled for subsequent phases:

- ⏳ **Phase 14**: Project & Environment Foundation (multi-tenancy, dev/staging/prod workspaces)
- ⏳ **Phase 15**: Repository Intelligence Agent (Git repo scanning, framework & manifest detection)
- ⏳ **Phase 16**: Architecture Dependency Graph (service-to-database topology reconstruction)
- ⏳ **Phase 17**: Live Website Investigation Agent (Playwright/HTTP runtime correlation)
- ⏳ **Phase 18**: Observability Agent (OpenTelemetry logs, metrics, and trace ingestion)
- ⏳ **Phase 19**: Incident Investigation Agent (Flagship multi-agent evidence-grounded root-cause analysis)
- ⏳ **Phase 20**: Security Agent & Policy Engine (deterministic OPA/Rego policies, human approval gates)
- ⏳ **Phase 21**: Deployment & GitOps Engine (deployment reconciliation and rollback pipelines)
- ⏳ **Phase 22**: FinOps Agent (deterministic resource cost estimation and right-sizing)
- ⏳ **Phase 23**: RAG & Runbook Knowledge Base (pgvector incident search and runbook context)
- ⏳ **Phase 24–25**: Multi-Agent Orchestrator & Controlled Remediation Engine
- ⏳ **Phase 26–27**: Kubernetes Provider & Terraform / Cloud Provider Integrations

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS v3, Axios, Lucide React, React Router 6.
- **Backend**: FastAPI 0.110, Uvicorn, Python Docker SDK (`docker` 7.0), `psutil`, Pydantic v2.
- **Testing**: `pytest` 8.4, `httpx` 0.27.
- **Deployment**: Docker Compose.

---

## 🔌 API Compatibility Summary

OpsPilot maintains 100% backward compatibility for all existing routes while introducing provider-aware routing:

| Method | Endpoint | Description | Provider-Aware |
|---|---|---|:---:|
| `GET` | `/` | Root health & daemon connectivity | Yes |
| `GET` | `/api/providers` | Lists active infrastructure providers | **New** |
| `GET` | `/api/engine/status` | Current engine connection status | Yes |
| `GET` | `/api/dashboard` | Infrastructure overview & host resource stats | Yes (`?provider=`) |
| `GET` | `/api/containers` | Workloads list with status & port mappings | Yes (`?provider=`) |
| `GET` | `/api/container/{id}/inspect` | Granular workload configuration inspection | Yes (`?provider=`) |
| `POST` | `/api/deploy` | Instantiates a new workload specification | Yes (`req.provider`) |
| `POST` | `/api/container/start` | Starts a stopped workload | Yes (`req.provider`) |
| `POST` | `/api/container/stop` | Stops an active workload | Yes (`req.provider`) |
| `POST` | `/api/container/restart` | Restarts a workload | Yes (`req.provider`) |
| `DELETE` | `/api/container/{id}` | Removes a workload from provider | Yes (`?provider=`) |
| `GET` | `/api/logs/{id}` | Fetches tail stdout/stderr workload logs | Yes (`?provider=`) |
| `GET` | `/api/stats/{id}` | Returns real-time CPU %, RAM, Net I/O telemetry | Yes (`?provider=`) |
| `GET` | `/api/resources` | Lists images, persistent volumes, and networks | Yes (`?provider=`) |
| `POST` | `/api/cleanup` | Executes system prune on unused provider resources | Yes (`?provider=`) |

---

## 🧪 Testing Status

The automated test suite verifies provider registration, contract adherence, and endpoint backwards compatibility:

```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/ -v
```

**Results:**
- `test_provider_registry`: PASSED
- `test_docker_provider_methods`: PASSED
- `test_api_providers_endpoint`: PASSED
- `test_api_dashboard_endpoint`: PASSED
- `test_api_containers_endpoint`: PASSED
- `test_api_resources_endpoint`: PASSED
- `test_api_deploy_validation`: PASSED
- **Total: 7 passed in 0.41s**

---

## 💻 Local Development Setup

### Option 1: Run via Docker Compose (Recommended)
```bash
docker compose up --build
```
- Dashboard UI: `http://localhost:3000`
- API Backend: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### Option 2: Run Backend & Frontend Separately
#### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
