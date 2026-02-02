import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, RefreshCw } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

const SUGGESTIONS = [
  "What is FGSM and how does it work?",
  "Why is data drift dangerous in production?",
  "How does SHAP explain model predictions?",
  "What is the difference between PGD and FGSM?",
  "How does feature squeezing detect adversarial inputs?",
  "What does PSI measure in drift detection?",
]

const KNOWLEDGE_BASE = `
You are NeuralForge AI Assistant — an expert on the NeuralForge AI Security & MLOps platform.

ABOUT NEURALFORGE:
NeuralForge is an enterprise-grade platform that trains ML models, simulates adversarial attacks, detects threats in real-time, and monitors model drift.

MODELS:
- ResNet-18: Image classifier trained on CIFAR-10 (32x32 images, 10 classes). Achieves 91.2% accuracy.
- DistilBERT: NLP sentiment classifier (positive/negative/neutral). Fine-tuned on security-domain text. 88.7% accuracy.
- IsolationForest: Anomaly detector for identifying unusual input patterns. 94.1% accuracy.

ADVERSARIAL ATTACKS:
- FGSM (Fast Gradient Sign Method): Single-step attack by Goodfellow et al. 2014. Perturbs input by epsilon in gradient sign direction. Fast but weak.
- PGD (Projected Gradient Descent): Iterative FGSM by Madry et al. 2017. Multiple steps with projection back into epsilon-ball. Stronger than FGSM.
- C&W (Carlini & Wagner L2): Optimization-based attack. Finds minimum L2 perturbation that causes misclassification. Strongest but slowest.
- Epsilon: Controls perturbation budget. Small (0.001-0.01) = imperceptible. Large (0.1-0.3) = visible noise.

DEFENCES:
- Feature Squeezing: Reduces input complexity (bit-depth reduction) and compares outputs. Large L1 distance = adversarial detected.
- Threat Scoring: Combines success, confidence drop, and perturbation size into a 0-1 threat score.

DRIFT DETECTION:
- PSI (Population Stability Index): Measures distribution shift. PSI < 0.1 = stable, 0.1-0.2 = monitor, > 0.2 = significant drift.
- Jensen-Shannon Divergence: Symmetric measure of distribution difference. Range 0-1.
- Severity levels: none / mild / moderate / severe. Severe triggers urgent retraining recommendation.

SHAP EXPLAINABILITY:
- SHAP (SHapley Additive exPlanations): Game theory-based method to explain predictions.
- Positive SHAP value: Feature pushes prediction UP toward the predicted class.
- Negative SHAP value: Feature pushes prediction DOWN against the predicted class.
- Base value: Average model output before seeing any features.

TECH STACK: PyTorch, FastAPI, React, DistilBERT, MLflow, Docker, GitHub Actions, Render, Vercel.

Answer questions clearly and technically. Be concise but thorough.
`

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role:"assistant", content:"Hi! I'm the NeuralForge AI Assistant. I can answer questions about adversarial attacks, drift detection, SHAP explainability, and how this platform works. What would you like to know?", timestamp:Date.now() }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput("")

    const userMsg: Message = { role:"user", content:msg, timestamp:Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.map(m=>({ role:m.role, content:m.content }))
        })
      })
      const data = await response.json()
      const reply = data.reply || "Sorry, I couldn't get a response."
      setMessages(prev => [...prev, { role:"assistant", content:reply, timestamp:Date.now() }])
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Connection error. The AI assistant requires an API connection. Try asking about NeuralForge features — I have built-in knowledge!", timestamp:Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16,height:"calc(100vh - 120px)"}}>
      <div>
        <h1 style={{fontSize:20,fontWeight:600,color:"#fff",marginBottom:4}}>NeuralForge AI Assistant</h1>
        <p style={{fontSize:13,color:"#64748b"}}>Ask anything about adversarial attacks, drift detection, SHAP, or how NeuralForge works.</p>
      </div>

      {/* Suggestions */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {SUGGESTIONS.slice(0,3).map(s=>(
          <button key={s} onClick={()=>send(s)} style={{fontSize:11,padding:"5px 12px",borderRadius:20,border:"1px solid #1e2d4a",background:"none",color:"#94a3b8",cursor:"pointer",whiteSpace:"nowrap"}}>
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingRight:4}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:m.role==="user"?"#2563eb":"#8b5cf622",border:m.role==="assistant"?"1px solid #8b5cf644":"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {m.role==="user" ? <User size={14} style={{color:"#fff"}}/> : <Bot size={14} style={{color:"#8b5cf6"}}/>}
            </div>
            <div style={{maxWidth:"75%",padding:"10px 14px",borderRadius:12,background:m.role==="user"?"#2563eb":"#0f1629",border:m.role==="assistant"?"1px solid #1e2d4a":"none"}}>
              <p style={{fontSize:13,color:"#e2e8f0",margin:0,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</p>
              <p style={{fontSize:10,color:m.role==="user"?"#93c5fd":"#475569",margin:"6px 0 0",textAlign:"right"}}>
                {new Date(m.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"#8b5cf622",border:"1px solid #8b5cf644",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Bot size={14} style={{color:"#8b5cf6"}}/>
            </div>
            <div style={{padding:"10px 14px",borderRadius:12,background:"#0f1629",border:"1px solid #1e2d4a",display:"flex",gap:6,alignItems:"center"}}>
              <RefreshCw size={12} style={{color:"#8b5cf6",animation:"spin 1s linear infinite"}}/>
              <span style={{fontSize:12,color:"#64748b"}}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{display:"flex",gap:10,padding:"12px 0"}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Ask about FGSM, drift detection, SHAP values..."
          style={{flex:1,padding:"10px 16px",borderRadius:10,border:"1px solid #1e2d4a",background:"#0f1629",color:"#e2e8f0",fontSize:13,outline:"none"}}
        />
        <button onClick={()=>send()} disabled={loading||!input.trim()}
          style={{padding:"10px 16px",borderRadius:10,border:"none",background:loading||!input.trim()?"#1e2d4a":"#8b5cf6",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600}}>
          <Send size={14}/>Send
        </button>
      </div>
    </div>
  )
}
