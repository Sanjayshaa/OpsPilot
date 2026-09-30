# OpsPilot — Master Architectural Vision & Target Specification

> **Fixed Architecture Reference Document**  
> *Status:* FIXED STATE / BASELINE SPECIFICATION  
> *Purpose:* Establishes the definitive vision, target multi-agent architecture, evidence model, policy controls, and roadmap for OpsPilot to prevent architectural drift.

---

## 1. Identity & Vision

### Proposed Final Identity
**OpsPilot — Multi-Agent AI DevOps & Cloud Operations Platform**  
*Alternative Technical Title:* **OpsPilot: An AI-Native Multi-Agent Platform for Infrastructure Management, Observability and Autonomous Incident Investigation**

### Strategic Paradigm Shift
Move OpsPilot from a standard Docker container dashboard to an AI-native multi-agent DevOps and Cloud Operations platform where Docker is only one execution provider.

**Old Identity:**  
`React UI` → `FastAPI` → `Docker SDK` → `Docker`

**Target Identity:**  
```
                         ┌──────────────────────┐
                         │     Developer        │
                         │      / DevOps        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      OpsPilot UI     │
                         │ Dashboard / AI / Ops │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │       OPSPILOT CONTROL       │
                    │            PLANE             │
                    └──────────────┬───────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │ Agent        │   │ Policy /     │   │ Execution    │
        │ Orchestrator │   │ Security     │   │ Engine       │
        └──────┬───────┘   └──────────────┘   └──────┬───────┘
               │                                      │
       ┌───────┼────────┐                    ┌────────┼────────┐
       ▼       ▼        ▼                    ▼        ▼        ▼
    Repo    Infra   Observe               Docker   K8s    Cloud
    Agent   Agent    Agent                Compose  Helm   Terraform
       │       │        │
       └───────┼────────┘
               ▼
        ┌───────────────┐
        │ AI Reasoning  │
        │ + RAG + Tools │
        └───────┬───────┘
                │
                ▼
       Evidence → Diagnosis
       → Recommendation
       → Approval
       → Execution
       → Verification
       → Audit
```

---

## 2. Core Differentiator: Evidence-Driven Autonomous Investigation

OpsPilot is **NOT** a "chatbot inside a dashboard". It is an autonomous incident investigation & operations engine.

```
User request
     ↓
Incident Agent
     ↓
Repository Agent
     ↓
Infrastructure Agent
     ↓
Observability Agent
     ↓
Security Agent
     ↓
Deployment Agent
     ↓
Evidence aggregation
     ↓
AI reasoning
     ↓
Root-cause hypothesis
     ↓
Confidence + evidence
     ↓
Recommended remediation
     ↓
Policy validation
     ↓
Human approval
     ↓
Execution
     ↓
Health verification
     ↓
Audit trail
```

---

## 3. Specialized Multi-Agent Roster (10 Agents)

1. **Repository Intelligence Agent**: Analyzes GitHub/GitLab/Local repos, languages, frameworks, dependencies, Dockerfiles, Compose, K8s, Helm, Terraform, CI/CD, and outputs application blueprints.
2. **Live Website / Application Investigation Agent**: Performs runtime browser & HTTP investigations via Playwright/HTTP inspection (status, response times, headers, console errors, network waterfalls, DOM, screenshots, performance).
3. **Infrastructure Agent**: Manages and inspects Docker, Docker Compose, Kubernetes cluster resources (Pods, Deployments, Services, Ingress, Events), and Cloud SDKs/Terraform.
4. **Observability Agent**: Ingests OpenTelemetry logs, metrics, traces, and correlates deployment events with runtime anomalies.
5. **Incident Investigation Agent**: Flagship agent. Correlates telemetry, Git commits, website behavior, and infrastructure state to form ranked hypotheses with confidence scores and evidence pointers.
6. **Security Agent**: Performs static analysis on repos (secrets, dependency vulns), containers (root execution, image vulns), K8s manifests, and cloud IAM/security groups using deterministic policy tools (e.g. OPA/Rego).
7. **FinOps Agent**: Calculates deterministic cost breakdowns across compute, memory, storage, and cloud resources, recommending right-sizing optimizations.
8. **Deployment Agent**: Manages build, test, security scan, policy check, deployment execution, and health monitoring/rollback for Docker, Compose, K8s, and Terraform targets.
9. **Architecture Intelligence Agent**: Constructs dynamic architecture dependency graphs (Frontend → API Gateway → Auth / Payment → DB / Queues).
10. **Remediation Agent**: Executes structured tool calls safely post-authorization and human approval, followed by health verification and audit logging.

---

## 4. Architectural Guiding Principles & Security Controls

```
DETERMINISTIC SYSTEMS  ──>  produce facts
       ↓
AI AGENTS              ──>  interpret facts
       ↓
POLICY ENGINE          ──>  controls actions
       ↓
HUMAN APPROVAL         ──>  controls risky operations
       ↓
EXECUTION PROVIDERS    ──>  perform infrastructure changes
       ↓
OBSERVABILITY          ──>  verifies results
       ↓
AUDIT SYSTEM           ──>  records everything
```

- **LLM Isolation**: The LLM must **never** be the security boundary, **never** have unrestricted shell access, and **never** be the single source of truth for system state.
- **Structured Tools**: All actions (restarts, scale, deploy, rollback) execute via strictly validated schemas and structured tool definitions.
- **Policy Enforcement**: Destructive operations (`destroy`, `delete`, `terminate`, `scale down`, `rotate credentials`) require explicit human approval via the Policy Engine.
- **SSRF & Web Investigation Security**: Live website investigations must enforce URL allowlists, restrict local/private IP ranges (127.0.0.1, 169.254.169.254, internal subnets, Unix sockets), and require explicit target authorization.
- **Open AI Model Gateway**: Use a model-agnostic abstraction layer (e.g. LiteLLM / custom gateway) supporting Ollama, vLLM, local models, or cloud providers (Gemini, OpenAI, Anthropic).

---

## 5. Master Transformation Prompt (Operational Reference)

```
OPSPILOT — MAJOR PROJECT TRANSFORMATION MASTER PROMPT

ROLE
Act as a Principal DevOps Architect, Cloud Platform Engineer, SRE, AI Agent Architect, Security Engineer, and Senior Full-Stack Engineer.

You are working on an existing project called:
OpsPilot — AI-Native Multi-Agent DevOps & Cloud Operations Platform

The existing OpsPilot project already contains substantial Docker/container-management functionality. Do NOT throw away the existing implementation.

Your task is to evolve the existing system into a technically serious, production-oriented major project with:
* DevOps automation
* Cloud infrastructure management
* Multi-agent AI
* Repository intelligence
* Live website/application investigation
* Infrastructure observability
* Incident investigation
* Security analysis
* FinOps/cost analysis
* Infrastructure-as-Code
* Kubernetes support
* Docker/Compose support
* GitHub/GitLab/local repository support
* RAG
* Open-source/local LLM support
* Model-provider abstraction
* Policy-based safe execution
* Evidence-based root-cause analysis
* Auditability
* Human approval for risky actions
* Enterprise-grade architecture

1. MOST IMPORTANT RULE
Do NOT treat OpsPilot as a Docker dashboard with an AI chatbot.
Docker is only one infrastructure provider. The final product must be infrastructure-agnostic.

2. FINAL PRODUCT VISION
Transform OpsPilot into an evidence-driven, multi-agent AI DevOps & Cloud Operations platform allowing developers to connect repos, analyze architecture, investigate live web runtimes, correlate telemetry, inspect incidents, enforce security/FinOps policies, and execute approved remediations safely.

3. EXISTING SYSTEM PRESERVATION
Inspect existing code, create docs/CURRENT_ARCHITECTURE.md, docs/TARGET_ARCHITECTURE.md, and docs/MIGRATION_PLAN.md before refactoring. Maintain backward compatibility.
```

---

## 6. Phase-by-Phase Roadmap

- **Phase 13**: Architecture refactoring + provider abstraction
- **Phase 14**: Project/environment model
- **Phase 15**: Repository Intelligence Agent
- **Phase 16**: Architecture Graph
- **Phase 17**: Live Website Investigation Agent
- **Phase 18**: Observability Agent
- **Phase 19**: Incident Investigation Agent
- **Phase 20**: Security + Policy Engine
- **Phase 21**: Deployment/GitOps Engine
- **Phase 22**: FinOps Agent
- **Phase 23**: RAG + Knowledge System
- **Phase 24**: Multi-agent orchestration
- **Phase 25**: Controlled remediation engine
- **Phase 26**: Kubernetes support
- **Phase 27**: Terraform + Cloud Providers
- **Phase 28**: Security hardening & SSRF protection
- **Phase 29**: AI evaluation & benchmarking
- **Phase 30**: Production packaging & Docker Compose setup
- **Phase 31**: Enterprise Operations UI

---

## 7. Signature Resume Demonstration Scenario

**Scenario: Autonomous Incident Investigation & Remediation**
1. **Incident Trigger**: High 500 error rate on checkout service.
2. **Multi-Agent Swarm**:
   - `Web Agent`: Detects TTFB latency spike & HTTP 500 on `/checkout`.
   - `Repository Agent`: Identifies recent commit `abc123` on payment module.
   - `Infrastructure Agent`: Finds 7 container restarts on `payment-api`.
   - `Observability Agent`: Correlates DB connection pool saturation (98%).
   - `Architecture Agent`: Traces dependency from Frontend → Gateway → Payment API → PostgreSQL.
3. **Evidence Graph**: Pins exact log traces, commit hashes, and telemetry metrics.
4. **Policy & Remediation**: AI proposes rollback of deployment `#184`. Policy flags `REQUIRES_HUMAN_APPROVAL`. User clicks `[APPROVE REMEDIATION]`.
5. **Verification**: System executes rollback, verifies container health, monitors error rate recovery, and posts full audit record.
