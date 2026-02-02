import { useState } from "react"
import { Shield, Zap, RefreshCw } from "lucide-react"
import { api } from "../utils/api"

const CLASSES = ["airplane","automobile","bird","cat","deer","dog","frog","horse","ship","truck"]

export default function AttackVisualiser() {
  const [cfg, setCfg] = useState({ attack_type:"fgsm", epsilon:0.03, true_label:3, num_steps:40 })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const r = await api.post("/api/v1/security/attack-visualise", cfg)
      setResult(r.data)
    } catch(e:any) { setResult({error: e.message}) }
    finally { setLoading(false) }
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <h1 style={{fontSize:20,fontWeight:600,color:"#fff"}}>Attack Visualiser</h1>
      <div className="card" style={{padding:20,display:"flex",gap:20,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div>
          <p style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Attack Type</p>
          <div style={{display:"flex",gap:8}}>
            {["fgsm","pgd","cw"].map(t=>(
              <button key={t} onClick={()=>setCfg(c=>({...c,attack_type:t}))} style={{padding:"6px 16px",borderRadius:6,border:"1px solid #1e2d4a",background:cfg.attack_type===t?"#2563eb":"none",color:cfg.attack_type===t?"#fff":"#94a3b8",cursor:"pointer",fontSize:12}}>{t.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <p style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Epsilon: <span style={{color:"#fff"}}>{cfg.epsilon}</span></p>
          <input type="range" min="0.001" max="0.3" step="0.001" value={cfg.epsilon} onChange={e=>setCfg(c=>({...c,epsilon:parseFloat(e.target.value)}))} style={{width:"100%"}}/>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <p style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Target: <span style={{color:"#fff"}}>{CLASSES[cfg.true_label]}</span></p>
          <input type="range" min="0" max="9" step="1" value={cfg.true_label} onChange={e=>setCfg(c=>({...c,true_label:parseInt(e.target.value)}))} style={{width:"100%"}}/>
        </div>
        <button onClick={run} disabled={loading} style={{padding:"10px 24px",borderRadius:8,border:"none",background:loading?"#1e2d4a":"#2563eb",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
          {loading ? <><RefreshCw size={14}/>Running...</> : <><Zap size={14}/>Run Attack</>}
        </button>
      </div>
      {result?.error && <p style={{color:"#ef4444"}}>{result.error}</p>}
      {result && !result.error && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            {[["Original",result.original_image,"#22c55e",result.original_label],["Heatmap",result.heatmap,"#f59e0b","pixel diff"],["Adversarial",result.adversarial_image,result.success?"#ef4444":"#22c55e",result.adversarial_label]].map(([label,img,col,sub]:any)=>(
              <div key={label} className="card" style={{padding:16,textAlign:"center"}}>
                <p style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>{label}</p>
                <img src={`data:image/png;base64,${img}`} alt={label} style={{width:"100%",borderRadius:8,border:`2px solid ${col}44`}}/>
                <p style={{fontSize:13,fontWeight:600,color:col,marginTop:8,textTransform:"capitalize"}}>{sub}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:16,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:result.success?"#ef4444":"#22c55e"}}/>
            <span style={{fontSize:15,fontWeight:600,color:result.success?"#ef4444":"#22c55e"}}>
              {result.success ? `Attack SUCCEEDED: ${result.original_label} → ${result.adversarial_label}` : `Attack FAILED — model held: ${result.original_label}`}
            </span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[["Original Confidence",result.original_probs,"#22c55e"],["Adversarial Confidence",result.adversarial_probs,"#ef4444"]].map(([title,probs,col]:any)=>(
              <div key={title} className="card" style={{padding:16}}>
                <p style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:12}}>{title}</p>
                {Object.entries(probs).sort(([,a]:any,[,b]:any)=>(b as number)-(a as number)).slice(0,5).map(([cls,prob]:any)=>(
                  <div key={cls} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:"#94a3b8",textTransform:"capitalize"}}>{cls}</span>
                      <span style={{color:"#fff"}}>{(prob*100).toFixed(1)}%</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"#1e2d4a"}}>
                      <div style={{height:6,borderRadius:3,width:`${prob*100}%`,background:col}}/>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {!result && !loading && (
        <div className="card" style={{padding:40,textAlign:"center"}}>
          <Shield size={48} style={{color:"#1e2d4a",margin:"0 auto 16px",display:"block"}}/>
          <p style={{color:"#475569"}}>Configure settings above and click Run Attack.</p>
        </div>
      )}
    </div>
  )
}
