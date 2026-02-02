# NeuralForge 🧠

> A production-grade AI Security and MLOps intelligence platform — adversarial attack simulation, real-time threat detection, model drift monitoring, SHAP explainability, and automated retraining, all in one live dashboard.

**Live:** [neuralforge-ten.vercel.app](https://neuralforge-ten.vercel.app) &nbsp;|&nbsp; **API:** [neuralforge-e6ci.onrender.com/docs](https://neuralforge-e6ci.onrender.com/docs) &nbsp;|&nbsp; **Repo:** [github.com/praneethcheturi-143/neuralforge](https://github.com/praneethcheturi-143/neuralforge)

![Python](https://img.shields.io/badge/Python-3.11-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.2-red)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![MLflow](https://img.shields.io/badge/MLflow-2.11-orange)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black)
![Deployed](https://img.shields.io/badge/Deployed-Render%20%2B%20Vercel-brightgreen)

---

## Why this project exists

AI security is one of the fastest-growing engineering disciplines in 2026 — yet almost no portfolio projects touch it. NeuralForge demonstrates a complete production MLOps and AI security stack: real adversarial attacks implemented from scratch in PyTorch, live drift detection, automated retraining, SHAP explainability, and a real-time WebSocket threat feed — all deployed and accessible right now.

This single project covers 7 different role types that are actively hiring.

---

## Roles this project targets

| Role | Skills demonstrated |
|---|---|
| ML Engineer | PyTorch, ResNet-18, DistilBERT fine-tuning, model training |
| AI Security Engineer | FGSM, PGD, C&W adversarial attacks from scratch |
| MLOps Engineer | MLflow experiment tracking, drift detection, auto-retraining |
| NLP Engineer | DistilBERT, 3-class sentiment classification, text attacks |
| Data Engineer | Feature pipelines, PSI monitoring, data quality checks |
| Full-Stack Engineer | FastAPI + React + TypeScript, WebSocket, REST API |
| DevOps Engineer | Docker, GitHub Actions CI/CD, Render, Vercel |

---

## What it does

### 13 interactive modules

| Module | What it shows | Key tech |
|---|---|---|
| 📊 **Overview** | Live stats — attack count, drift severity, model accuracy, threat level | FastAPI, WebSocket |
| ⚔️ **Attack Simulator** | Run FGSM, PGD, or C&W attacks on ResNet-18 with configurable epsilon | PyTorch, custom attack engine |
| 🔍 **Attack Visualiser** | Side-by-side original vs adversarial image with confidence heatmap | React, Canvas API |
| 📉 **Drift Monitor** | PSI + Jensen-Shannon divergence across 10 features with severity levels | Evidently AI, scikit-learn |
| 🔄 **Auto-Retrain** | 8-stage automated retraining pipeline triggered on severe drift | MLflow, PyTorch |
| 🧠 **SHAP Explainability** | Feature importance waterfall charts for both ResNet-18 and DistilBERT | SHAP, Recharts |
| 💬 **AI Assistant** | Chatbot answering ML security and MLOps questions | NLP knowledge base |
| 🧪 **A/B Testing** | Live traffic splitting between model versions with statistical winner detection | FastAPI, React |
| 🌍 **Threat Map** | Animated real-time global attack origin map | React, geolocation data |
| 🏆 **Attack Leaderboard** | Live rankings of FGSM vs PGD vs C&W effectiveness — updated every 3s | WebSocket, Recharts |
| 📋 **Model Cards** | Google/HuggingFace standard documentation for ResNet-18 and DistilBERT | React, Recharts |
| 🌐 **NLP Analyser** | DistilBERT sentiment analysis on custom security-domain text | Transformers, FastAPI |
| 📖 **Showcase** | Full project architecture and engineering decision walkthrough | React |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│          React 18 + TypeScript Dashboard (Vercel)         │
│   13 pages · Recharts · WebSocket · dark/light mode      │
└──────────────┬───────────────────────────┬───────────────┘
               │ REST (Axios)              │ WebSocket
┌──────────────▼───────────────────────────▼───────────────┐
│           FastAPI Backend (Render)                        │
│   12+ endpoints · WebSocket server · Swagger docs        │
└──────┬──────────────┬──────────────┬────────────────┬────┘
       │              │              │                │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐ ┌──────▼──────┐
│ ML Models   │ │  Security  │ │  MLOps    │ │  NLP        │
│ ResNet-18   │ │  Engine    │ │  Pipeline │ │  DistilBERT │
│ 91.2% acc   │ │ FGSM/PGD   │ │ MLflow    │ │  88.7% acc  │
│ IsoForest   │ │ C&W attacks│ │ Drift PSI │ │  Sentiment  │
└─────────────┘ └────────────┘ └───────────┘ └─────────────┘
```

---

## Models

| Model | Task | Accuracy | Latency | Parameters |
|---|---|---|---|---|
| ResNet-18 | Image classification (CIFAR-10, 10 classes) | 91.2% | 23ms | 11.2M |
| DistilBERT | Sentiment analysis (3-class, security domain) | 88.7% | 44ms | 66M |
| IsolationForest | Anomaly detection on feature distributions | 94.1% | 5ms | — |

---

## Adversarial attacks

All three attacks are implemented from scratch in PyTorch — not wrappers around libraries.

| Attack | Type | Steps | Threat level |
|---|---|---|---|
| FGSM | Single-step gradient sign | 1 | Medium–High |
| PGD | Iterative projected gradient descent | 40 | High–Critical |
| C&W | L2-norm optimisation | Iterative | Critical |

**Robustness results (ResNet-18):**

| Attack | Accuracy drop | Robust accuracy |
|---|---|---|
| FGSM (ε=0.03) | -38.2% | 52.8% |
| PGD (40 steps) | -61.4% | 29.8% |
| C&W (L2) | -74.1% | 17.1% |

---

## MLOps pipeline

```
New data arrives
      ↓
Drift detection (PSI + Jensen-Shannon across 10 features)
      ↓
Severity: none / mild / moderate / severe
      ↓ (if severe)
Auto-retrain triggered (8-stage pipeline)
  1. Data validation
  2. Feature engineering
  3. Model initialisation
  4. Training
  5. Evaluation
  6. Comparison vs production model
  7. MLflow logging
  8. Model registration
      ↓
New model promoted to production
```

---

## Tech stack

**Backend**
- Python 3.11, FastAPI, Uvicorn
- PyTorch 2.x — model training, adversarial attacks
- Transformers (HuggingFace) — DistilBERT fine-tuning
- scikit-learn — IsolationForest, preprocessing
- MLflow 2.11 — experiment tracking, model registry
- Evidently AI — drift detection
- SHAP — model explainability

**Frontend**
- React 18, TypeScript
- Recharts — line, bar, radar, area charts
- Lucide React — icon system
- Custom WebSocket hook — real-time alert streaming

**Infrastructure**
- Docker + docker-compose
- GitHub Actions — 5-stage CI/CD (test → lint → security scan → deploy backend → deploy frontend)
- Render — FastAPI backend
- Vercel — React frontend

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/stats` | Live model stats and threat metrics |
| POST | `/api/attack` | Run adversarial attack (FGSM/PGD/C&W) |
| POST | `/api/drift` | Run drift detection across features |
| POST | `/api/analyse-text` | DistilBERT sentiment inference |
| GET | `/api/shap/image` | SHAP values for ResNet-18 |
| GET | `/api/shap/nlp` | SHAP values for DistilBERT |
| POST | `/api/retrain` | Trigger auto-retraining pipeline |
| GET | `/api/ab-test` | Current A/B test results |
| POST | `/api/ab-test/update` | Update traffic split |
| WS | `/ws/alerts` | WebSocket — live threat alert stream |
| GET | `/docs` | Interactive Swagger API explorer |

---

## CI/CD pipeline

Every push to `master` triggers:

```
1. Test         → pytest unit tests
2. Lint         → flake8 (Python) + ESLint (TypeScript)
3. Security     → safety check on Python dependencies
4. Deploy API   → Render (Python backend)
5. Deploy UI    → Vercel (React frontend)
```

---

## Running locally

```bash
# Clone
git clone https://github.com/praneethcheturi-143/neuralforge
cd neuralforge

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python train_models.py --quick     # trains all 3 models
uvicorn app.main:app --reload      # → http://localhost:8000/docs

# Frontend (new terminal)
cd frontend
npm install
npm run dev                        # → http://localhost:5173

# Or run everything with Docker
docker-compose up --build
```

---

## Project structure

```
neuralforge/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + WebSocket server
│   │   └── core/config.py        # Settings
│   ├── models/
│   │   ├── image_classifier.py   # ResNet-18 training + MLflow
│   │   └── nlp_sentiment.py      # DistilBERT fine-tuning
│   ├── security/
│   │   └── attack_engine.py      # FGSM, PGD, C&W from scratch
│   ├── pipeline/
│   │   └── drift_monitor.py      # PSI + Jensen-Shannon drift
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx         # Main layout + sidebar
│       │   ├── AttackVisualiser.tsx  # Before/after image comparison
│       │   ├── ShapExplainer.tsx     # SHAP waterfall charts
│       │   ├── AIChatbot.tsx         # AI assistant
│       │   ├── AutoRetrain.tsx       # 8-stage retrain pipeline
│       │   ├── ABTesting.tsx         # Traffic split + winner detection
│       │   ├── ThreatMap.tsx         # Global attack origin map
│       │   ├── AttackLeaderboard.tsx # Live attack rankings (NEW)
│       │   ├── ModelCard.tsx         # Model cards — ResNet + BERT (NEW)
│       │   └── Showcase.tsx          # Project showcase
│       ├── hooks/
│       │   └── useAlertStream.ts     # WebSocket hook
│       └── utils/api.ts             # Axios API client
├── .env.example
├── CONTRIBUTING.md
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

---

## Skills demonstrated

- **Deep learning** — ResNet-18 training on CIFAR-10, DistilBERT fine-tuning, inference pipelines
- **AI security** — adversarial attacks (FGSM, PGD, C&W) implemented from scratch in PyTorch
- **MLOps** — MLflow experiment tracking, model registry, PSI drift detection, automated retraining
- **NLP** — DistilBERT fine-tuning, 3-class sentiment classification, text adversarial attacks
- **Real-time systems** — WebSocket threat streaming, live leaderboard updates
- **Explainability** — SHAP values for both image and NLP models
- **API design** — FastAPI, Pydantic, OpenAPI/Swagger, WebSocket endpoints
- **Frontend** — React 18, TypeScript, Recharts, custom hooks, dark mode
- **DevOps** — Docker, docker-compose, 5-stage GitHub Actions CI/CD
- **Model documentation** — Google/HuggingFace standard model cards

---

*Built by Praneeth Cheturi — [github.com/praneethcheturi-143](https://github.com/praneethcheturi-143)*
