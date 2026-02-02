import { useState, useEffect } from "react"
import { RefreshCw, Zap, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { api } from "../utils/api"

export default function AutoRetrain() {
  const [status, setStatus] = useState<any>(null)
  const [triggering, setTriggering] = useState(false)

  const fetchStatus = async () => {
    try {
      const r = await api.get("/api/v1/pipeline/retrain/status")
      setStatus(r.data)
    } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const t = setInterval(fetchStatus, 2000)
    return () => clearInterval(t)
  }, [])

  const trigger = async () => {
    setTriggering(true)
    try { await api.post("/api/v1/pipeline/retrain") }
    catch {}
    finally { setTriggering(false) }
  }

  const stages = [
    "Fetching latest production data...",
    "Validating data quality...",
    "Preprocessing & feature engineering...",
    "Training model on updated dataset...",
    "Evaluating model performance...",
    "Running adversarial robustness tests...",
    "Registering model in MLflow...",
    "Deploying new model version!",
  ]

  const stageProgress = [10,25,40,55,70,82,92,100]

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:600,color:"#fff",marginBottom:4}}>Auto-Retrain Pipeline</h1>
          <p style={{fontSize:13,color:"#64748b"}}>Automatically retrain models when drift severity reaches critical levels.</p>
        </div>
        <button onClick={trigger} disabled={triggering||status?.running}
          style={{padding:"10px 20px",borderRadius:8,border:"none",background:status?.running?"#1e2d4a":"#f59e0b",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
          {status?.running ? <><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Running...</> : <><Zap size={14}/>Trigger Retrain</>}
        </button>
      </div>

      {/* Current status */}
      {status && (
        <div className="card" style={{padding:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <h2 style={{fontSize:14,fontWeight:600,color:"#fff",margin:0}}>Pipeline Status</h2>
            <span style={{fontSize:12,padding:"4px 12px",borderRadius:20,background:status.running?"#f59e0b22":"#22c55e22",color:status.running?"#f59e0b":"#22c55e",border:`1px solid ${status.running?"#f59e0b44":"#22c55e44"}`}}>
              {status.running ? "Running" : "Idle"}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
              <span style={{color:"#94a3b8"}}>{status.stage || "Waiting for trigger..."}</span>
              <span style={{color:"#fff",fontFamily:"monospace"}}>{status.progress}%</span>
            </div>
            <div style={{height:8,borderRadius:4,background:"#1e2d4a"}}>
              <div style={{height:8,borderRadius:4,width:`${status.progress}%`,background:"linear-gradient(90deg,#f59e0b,#ef4444)",transition:"width 0.5s"}}/>
            </div>
          </div>

          {/* Stage checklist */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {stages.map((stage,i)=>{
              const done = status.progress >= stageProgress[i]
              const active = status.running && status.stage === stage
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:6,background:done?"#052e16":active?"#422006":"#0a0e1a",border:`1px solid ${done?"#14532d":active?"#78350f":"#1e2d4a"}`}}>
                  {done ? <CheckCircle size={14} style={{color:"#22c55e",flexShrink:0}}/> : active ? <RefreshCw size={14} style={{color:"#f59e0b",flexShrink:0,animation:"spin 1s linear infinite"}}/> : <Clock size={14} style={{color:"#475569",flexShrink:0}}/>}
                  <span style={{fontSize:11,color:done?"#86efac":active?"#fcd34d":"#475569"}}>{stage}</span>
                </div>
              )
            })}
          </div>

          {status.triggered_by && (
            <div style={{marginTop:16,padding:"8px 12px",borderRadius:6,background:"#0a0e1a",display:"flex",alignItems:"center",gap:8}}>
              <AlertTriangle size={12} style={{color:"#f59e0b"}}/>
              <span style={{fontSize:11,color:"#94a3b8"}}>Triggered by: <span style={{color:"#f59e0b"}}>{status.triggered_by}</span></span>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {status?.history?.length > 0 && (
        <div className="card" style={{padding:20}}>
          <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>Retrain History</h2>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {status.history.slice().reverse().map((h:any,i:number)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:8,background:"#0a0e1a"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <CheckCircle size={14} style={{color:"#22c55e"}}/>
                  <span style={{fontSize:12,color:"#94a3b8"}}>{new Date(h.timestamp*1000).toLocaleTimeString()}</span>
                </div>
                <div style={{display:"flex",gap:20,fontSize:12}}>
                  <span style={{color:"#ef4444"}}>Before: {(h.accuracy_before*100).toFixed(1)}%</span>
                  <span style={{color:"#64748b"}}>→</span>
                  <span style={{color:"#22c55e"}}>After: {(h.accuracy_after*100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card" style={{padding:20}}>
        <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>How Auto-Retrain Works</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[
            {n:"01",title:"Drift Detected",desc:"PSI > 0.2 triggers severity=severe alert",col:"#ef4444"},
            {n:"02",title:"Pipeline Triggered",desc:"Auto-retrain job starts automatically",col:"#f59e0b"},
            {n:"03",title:"Model Trained",desc:"New model trained on updated data",col:"#3b82f6"},
            {n:"04",title:"Auto-Deployed",desc:"Better model replaces old version",col:"#22c55e"},
          ].map(s=>(
            <div key={s.n} style={{padding:14,borderRadius:8,background:"#0a0e1a",borderTop:`3px solid ${s.col}`}}>
              <p style={{fontSize:20,fontWeight:700,color:s.col,fontFamily:"monospace",margin:"0 0 6px"}}>{s.n}</p>
              <p style={{fontSize:13,fontWeight:600,color:"#fff",margin:"0 0 4px"}}>{s.title}</p>
              <p style={{fontSize:11,color:"#64748b",margin:0,lineHeight:1.4}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
