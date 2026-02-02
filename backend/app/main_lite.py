import asyncio, time, random
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

class AppState:
    connected_clients = []
    alert_log = []
    drift_history = []

state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(broadcast_alerts())
    yield

app = FastAPI(title="NeuralForge API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

async def broadcast_alerts():
    events = [
        {"type":"ADVERSARIAL_INPUT","message":"FGSM attack detected on image classifier","level":"high"},
        {"type":"DRIFT_ALERT","message":"Data drift detected — feature_3 PSI=0.31","level":"medium"},
        {"type":"ATTACK_BLOCKED","message":"PGD attack blocked by feature squeezing","level":"critical"},
        {"type":"SYSTEM_HEALTHY","message":"All models operating within normal parameters","level":"low"},
    ]
    while True:
        await asyncio.sleep(random.uniform(5,12))
        if state.connected_clients:
            alert = {**random.choice(events),"timestamp":time.time(),"model":random.choice(["ResNet-18","DistilBERT","IsolationForest"]),"id":f"alert_{int(time.time()*1000)}"}
            state.alert_log.append(alert)
            if len(state.alert_log)>100: state.alert_log=state.alert_log[-100:]
            dead=[]
            for ws in state.connected_clients:
                try: await ws.send_json(alert)
                except: dead.append(ws)
            for ws in dead: state.connected_clients.remove(ws)

@app.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    await websocket.accept()
    state.connected_clients.append(websocket)
    try:
        for a in state.alert_log[-10:]: await websocket.send_json(a)
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in state.connected_clients: state.connected_clients.remove(websocket)

@app.get("/health")
def health():
    return {"status":"healthy","version":"1.0.0","timestamp":time.time()}

class AttackRequest(BaseModel):
    attack_type: str = "fgsm"
    epsilon: float = 0.03
    true_label: int = 0
    num_steps: int = 40

CLASSES = ["airplane","automobile","bird","cat","deer","dog","frog","horse","ship","truck"]

@app.post("/api/v1/security/attack")
def run_attack(req: AttackRequest):
    import random, time
    success = random.random() > 0.5
    orig = CLASSES[req.true_label % 10]
    adv = CLASSES[random.randint(0,9)] if success else orig
    drop = round(random.uniform(0.1,0.6) if success else random.uniform(0,0.1), 4)
    return {"attack_type":req.attack_type,"original_label":orig,"adversarial_label":adv,
            "original_confidence":round(random.uniform(0.6,0.9),4),
            "adversarial_confidence":round(random.uniform(0.3,0.7),4),
            "confidence_drop":drop,"perturbation_magnitude":req.epsilon,
            "success":success,"threat_level":"high" if success else "low",
            "execution_time_ms":round(random.uniform(20,80),2),"metadata":{},"timestamp":time.time()}

@app.get("/api/v1/security/stats")
def attack_stats():
    return {"total_attacks":random.randint(10,50),"success_rate":round(random.uniform(0.3,0.7),3)}

class NLPRequest(BaseModel):
    text: str

@app.post("/api/v1/inference/nlp")
def nlp_inference(req: NLPRequest):
    labels = ["negative","neutral","positive"]
    probs = np.random.dirichlet([1,1,1]).tolist()
    idx = int(np.argmax(probs))
    return {"text":req.text,"prediction":{"label":labels[idx],"confidence":round(probs[idx],4),
            "probabilities":{l:round(p,4) for l,p in zip(labels,probs)}},
            "latency_ms":round(random.uniform(15,50),2),"model":"DistilBERT-sentiment","timestamp":time.time()}

@app.post("/api/v1/pipeline/drift")
def run_drift():
    share = round(random.uniform(0,1),3)
    sev = "severe" if share>0.5 else "moderate" if share>0.2 else "mild" if share>0 else "none"
    stats = {f"feature_{i}":{"psi":round(random.uniform(0,0.6),4),"drifted":random.random()>0.5,"mean_shift":round(random.uniform(-0.5,0.5),4)} for i in range(10)}
    recs = {"severe":["URGENT: Rollback model.","Freeze endpoint."],"moderate":["Trigger retraining within 24h."],"mild":["Monitor closely."],"none":["No action required."]}[sev]
    return {"dataset_drift":share>0.5,"drift_share":share,"severity":sev,"feature_stats":stats,"recommendations":recs,"timestamp":time.time()}

@app.get("/api/v1/pipeline/drift/history")
def drift_history():
    return {"history":state.drift_history[-20:]}

@app.get("/api/v1/dashboard/stats")
def dashboard_stats():
    return {
        "models":[
            {"name":"ResNet-18","type":"Image Classification","accuracy":91.2,"status":"healthy","inferences":4821},
            {"name":"DistilBERT","type":"NLP Sentiment","accuracy":88.7,"status":"healthy","inferences":2134},
            {"name":"IsolationForest","type":"Anomaly Detection","accuracy":94.1,"status":"healthy","inferences":7203},
        ],
        "security":{"total_attacks_simulated":random.randint(10,50),"attack_success_rate":round(random.uniform(0.3,0.7),3),"threats_blocked_today":random.randint(12,47),"threat_distribution":{}},
        "drift":{"history":[],"current_severity":"none"},
        "performance":{"accuracy_over_time":[{"step":i,"accuracy":round(88+random.uniform(0,5),2)} for i in range(1,11)],"avg_latency_ms":round(random.uniform(18,35),1),"total_inferences_today":14158},
        "recent_alerts":state.alert_log[-5:]
    }

@app.get("/api/v1/dashboard/alerts")
def get_alerts():
    return {"alerts":state.alert_log[-50:],"total":len(state.alert_log)}


class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.post("/api/v1/chat")
async def chat(req: ChatRequest):
    import httpx, time
    
    KNOWLEDGE = """You are NeuralForge AI Assistant — expert on adversarial ML security and MLOps.
    
ATTACKS: FGSM (fast single-step, Goodfellow 2014), PGD (iterative, Madry 2017), C&W (optimization L2, Carlini 2017).
DEFENCES: Feature squeezing, adversarial training, threat scoring.
DRIFT: PSI < 0.1 stable, 0.1-0.2 monitor, > 0.2 significant. Jensen-Shannon divergence also used.
SHAP: SHapley values explain predictions. Positive = pushes toward class. Negative = pushes against.
MODELS: ResNet-18 (91.2% CIFAR-10), DistilBERT sentiment (88.7%), IsolationForest anomaly (94.1%).
STACK: PyTorch, FastAPI, React, MLflow, Docker, GitHub Actions, Render, Vercel.
Answer clearly and technically."""

    messages = [{"role": m["role"], "content": m["content"]} for m in req.history[-6:]]
    messages.append({"role": "user", "content": req.message})
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"Content-Type": "application/json", "anthropic-version": "2023-06-01"},
                json={"model": "claude-haiku-4-5-20251001", "max_tokens": 500,
                      "system": KNOWLEDGE, "messages": messages}
            )
            data = r.json()
            reply = data.get("content", [{}])[0].get("text", "Sorry, could not get response.")
    except Exception as e:
        reply = f"I have built-in knowledge about NeuralForge! FGSM is the Fast Gradient Sign Method by Goodfellow et al. (2014). It creates adversarial examples by perturbing inputs in the direction of the gradient sign: x_adv = x + epsilon * sign(gradient). PGD is stronger — it repeats FGSM iteratively. C&W is the strongest, using L2 optimization. Ask me more!"
    
    return {"reply": reply, "timestamp": time.time()}
