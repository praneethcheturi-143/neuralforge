import { useState, useEffect, useCallback } from "react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Shield, Activity, Brain, MessageSquare, GitBranch, Globe, Sun, Moon, AlertTriangle, Cpu, Database, TrendingUp, Lock, Eye, RefreshCw, Wifi, WifiOff, Zap, Terminal, ChevronRight } from "lucide-react"
import Showcase from "./Showcase"
import AttackVisualiser from "./AttackVisualiser"
import ShapExplainer from "./ShapExplainer"
import AIChatbot from "./AIChatbot"
import AutoRetrain from "./AutoRetrain"
import ABTesting from "./ABTesting"
import ThreatMap from "./ThreatMap"
import AttackLeaderboard from "./AttackLeaderboard"
import ModelCard from "./ModelCard"
import { useAlertStream } from "../hooks/useAlertStream"
import { runAttack, runDrift, getStats, analyseText } from "../utils/api"

const WS = "ws://localhost:8000/ws/alerts"
const lc: any = { critical:"#ef4444", high:"#f97316", medium:"#eab308", low:"#22c55e" }
const lb: any = { critical:"#450a0a", high:"#431407", medium:"#422006", low:"#052e16" }
const lt: any = { critical:"#fca5a5", high:"#fdba74", medium:"#fcd34d", low:"#86efac" }

function Card({ icon:Icon, label, value, sub, col="#3b82f6" }: any) {
  return (
    <div className="card" style={{padding:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:8}}>
      <div style={{background:col+"22",padding:8,borderRadius:8}}><Icon size={18} style={{color:col}}/></div>
      <p style={{fontSize:12,color:"#94a3b8"}}>{label}</p>
      <p style={{fontSize:26,fontWeight:600,color:"#fff",lineHeight:1}}>{value}</p>
      {sub && <p style={{fontSize:11,color:"#64748b"}}>{sub}</p>}
    </div>
  )
}

function Badge({ level }: any) {
  return <span style={{fontSize:10,fontFamily:"monospace",padding:"2px 8px",borderRadius:4,background:lb[level]||lb.low,color:lt[level]||lt.low,border:`1px solid ${lc[level]||lc.low}`}}>{level?.toUpperCase()}</span>
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview")
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('light', !dark)
  }, [dark])
  const [stats, setStats] = useState<any>(null)
  const [attackResult, setAttackResult] = useState<any>(null)
  const [driftResult, setDriftResult] = useState<any>(null)
  const [nlpText, setNlpText] = useState("The adversarial attack was successfully blocked.")
  const [nlpResult, setNlpResult] = useState<any>(null)
  const [loading, setLoading] = useState<string|null>(null)
  const [cfg, setCfg] = useState({ attack_type:"fgsm", epsilon:0.03, true_label:3, num_steps:40 })
  const { alerts, connected } = useAlertStream(WS)

  const fetchStats = useCallback(async () => { try { setStats(await getStats()) } catch {} }, [])
  useEffect(() => { fetchStats(); const t = setInterval(fetchStats,15000); return ()=>clearInterval(t) }, [fetchStats])

  const doAttack = async () => { setLoading("attack"); try { setAttackResult(await runAttack(cfg)) } catch(e:any){setAttackResult({error:e.message})} finally{setLoading(null)} }
  const doDrift  = async () => { setLoading("drift");  try { setDriftResult(await runDrift()) }        catch(e:any){setDriftResult({error:e.message})}  finally{setLoading(null)} }
  const doNLP    = async () => { setLoading("nlp");    try { setNlpResult(await analyseText(nlpText)) } catch(e:any){setNlpResult({error:e.message})}   finally{setLoading(null)} }

  const tabs = [
    {id:"overview",label:"Overview",icon:Activity},
    {id:"attacks",label:"Attack Sim",icon:Shield},
    {id:"drift",label:"Drift Monitor",icon:TrendingUp},
    {id:"nlp",label:"NLP Analyser",icon:Terminal},
    {id:"visualiser",label:"Attack Visual",icon:Eye},
    {id:"shap",label:"Explainability",icon:Brain},
    {id:"chat",label:"AI Assistant",icon:MessageSquare},
    {id:"retrain",label:"Auto-Retrain",icon:RefreshCw},
    {id:"abtest",label:"A/B Testing",icon:GitBranch},
    {id:"threatmap",label:"Threat Map",icon:Globe},
    {id:"leaderboard",label:"Leaderboard",icon:Zap},
    {id:"modelcard",label:"Model Cards",icon:Database},
    {id:"showcase",label:"About Project",icon:Eye},
  ]

  return (
    <div style={{minHeight:"100vh",background:"#0a0e1a",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <header style={{background:"#0f1629",borderBottom:"1px solid #1e2d4a",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",gap:4}}>{["#8b5cf6","#3b82f6","#14b8a6"].map(c=><div key={c} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}</div>
          <span style={{fontFamily:"monospace",fontWeight:600,fontSize:18,color:"#fff"}}>NeuralForge</span>
          <span style={{fontSize:12,color:"#475569"}}>AI Security & MLOps Platform</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,fontSize:12}}>
          <span style={{display:"flex",alignItems:"center",gap:6,color:connected?"#22c55e":"#ef4444"}}>
            {connected ? <Wifi size={12}/> : <WifiOff size={12}/>} {connected?"Live":"Offline"}
          </span>
          <button onClick={()=>setDark(d=>!d)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",padding:4}}>{dark?<Sun size={14}/>:<Moon size={14}/>}</button>
          <button onClick={fetchStats} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",padding:4}}><RefreshCw size={14}/></button>
        </div>
      </header>

      <div style={{display:"flex",flex:1}}>
        {/* Sidebar */}
        <aside style={{width:180,background:"#0c1120",borderRight:"1px solid #1e2d4a",padding:"16px 8px",flexShrink:0}}>
          <nav style={{display:"flex",flexDirection:"column",gap:4}}>
            {tabs.map(({id,label,icon:Icon})=>(
              <button key={id} onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:tab===id?"1px solid #3b82f644":"1px solid transparent",background:tab===id?"#3b82f622":"none",color:tab===id?"#93c5fd":"#94a3b8",cursor:"pointer",fontSize:13,width:"100%",textAlign:"left"}}>
                <Icon size={14}/>{label}
              </button>
            ))}
          </nav>

          <div style={{marginTop:24}}>
            <p style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingLeft:4}}>Live Alerts</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {alerts.slice(0,5).map(a=>(
                <div key={a.id} style={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:6,padding:"6px 8px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <div className={a.level==="critical"?"pulse":""} style={{width:6,height:6,borderRadius:"50%",background:lc[a.level],flexShrink:0}}/>
                    <span style={{fontSize:10,fontFamily:"monospace",color:lc[a.level]}}>{a.level}</span>
                  </div>
                  <p style={{fontSize:11,color:"#94a3b8",lineHeight:1.3}}>{a.message.slice(0,50)}{a.message.length>50?"...":""}</p>
                </div>
              ))}
              {alerts.length===0 && <p style={{fontSize:11,color:"#475569",paddingLeft:4}}>Waiting...</p>}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{flex:1,padding:20,display:"flex",flexDirection:"column",gap:16,overflowY:"auto"}}>

          {/* OVERVIEW */}
          {tab==="overview" && <>
            <h1 style={{fontSize:20,fontWeight:600,color:"#fff"}}>Platform Overview</h1>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              <Card icon={Cpu} label="Total Inferences" value={stats?.performance?.total_inferences_today?.toLocaleString()??"—"} sub="today" col="#3b82f6"/>
              <Card icon={Shield} label="Threats Blocked" value={stats?.security?.threats_blocked_today??"—"} sub="today" col="#ef4444"/>
              <Card icon={Activity} label="Avg Latency" value={stats?.performance?.avg_latency_ms?`${stats.performance.avg_latency_ms}ms`:"—"} sub="per inference" col="#14b8a6"/>
              <Card icon={AlertTriangle} label="Attack Success" value={stats?.security?.attack_success_rate?`${(stats.security.attack_success_rate*100).toFixed(1)}%`:"0%"} sub="simulated" col="#f59e0b"/>
            </div>

            <div className="card" style={{padding:16}}>
              <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><Cpu size={14}/>Active Models</h2>
              {(stats?.models??[{name:"ResNet-18",type:"Image Classification",accuracy:91.2,status:"healthy",inferences:4821},{name:"DistilBERT",type:"NLP Sentiment",accuracy:88.7,status:"healthy",inferences:2134},{name:"IsolationForest",type:"Anomaly Detection",accuracy:94.1,status:"healthy",inferences:7203}]).map((m:any)=>(
                <div key={m.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,background:"#0a0e1a",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:m.status==="healthy"?"#22c55e":"#ef4444"}}/>
                    <span style={{fontSize:13,fontFamily:"monospace",color:"#fff"}}>{m.name}</span>
                    <span style={{fontSize:12,color:"#64748b"}}>{m.type}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:20,fontSize:12,color:"#94a3b8"}}>
                    <span>Acc: <span style={{color:"#fff"}}>{m.accuracy}%</span></span>
                    <span>Inferences: <span style={{color:"#fff"}}>{m.inferences?.toLocaleString()}</span></span>
                    <Badge level="low"/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:16}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>Model Accuracy Over Time</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats?.performance?.accuracy_over_time??Array.from({length:10},(_,i)=>({step:i+1,accuracy:88+Math.random()*5}))}>
                    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
                    <XAxis dataKey="step" stroke="#475569" tick={{fontSize:11}}/>
                    <YAxis domain={[80,100]} stroke="#475569" tick={{fontSize:11}}/>
                    <Tooltip contentStyle={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:8,fontSize:12}}/>
                    <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" fill="url(#ag)" strokeWidth={2} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{padding:16}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <Eye size={14}/>Live Threat Feed {connected&&<span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>}
                </h2>
                <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:180,overflowY:"auto"}}>
                  {alerts.slice(0,8).map(a=>(
                    <div key={a.id} style={{display:"flex",gap:8,padding:"6px 8px",borderRadius:6,background:"#0a0e1a",fontSize:12}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:lc[a.level],flexShrink:0,marginTop:4}}/>
                      <span style={{fontFamily:"monospace",color:lc[a.level]}}>[{a.type}]</span>
                      <span style={{color:"#94a3b8"}}>{a.message}</span>
                    </div>
                  ))}
                  {alerts.length===0&&<p style={{color:"#475569",fontSize:12}}>Waiting for events...</p>}
                </div>
              </div>
            </div>
          </>}

          {/* ATTACKS */}
          {tab==="attacks" && <>
            <h1 style={{fontSize:20,fontWeight:600,color:"#fff"}}>Adversarial Attack Simulator</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:8}}><Lock size={14}/>Attack Configuration</h2>
                <div>
                  <p style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Attack Type</p>
                  <div style={{display:"flex",gap:8}}>
                    {["fgsm","pgd","cw"].map(t=>(
                      <button key={t} onClick={()=>setCfg(c=>({...c,attack_type:t}))} style={{padding:"6px 16px",borderRadius:6,border:`1px solid ${cfg.attack_type===t?"#3b82f6":"#1e2d4a"}`,background:cfg.attack_type===t?"#2563eb":"none",color:cfg.attack_type===t?"#fff":"#94a3b8",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>{t.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>Epsilon: <span style={{color:"#fff",fontFamily:"monospace"}}>{cfg.epsilon}</span></p>
                  <input type="range" min="0.001" max="0.3" step="0.001" value={cfg.epsilon} onChange={e=>setCfg(c=>({...c,epsilon:parseFloat(e.target.value)}))} style={{width:"100%",accentColor:"#3b82f6"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569",marginTop:4}}><span>0.001 (imperceptible)</span><span>0.3 (visible)</span></div>
                </div>
                <div>
                  <p style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>Target class: <span style={{color:"#fff",fontFamily:"monospace"}}>{["airplane","automobile","bird","cat","deer","dog","frog","horse","ship","truck"][cfg.true_label]}</span></p>
                  <input type="range" min="0" max="9" step="1" value={cfg.true_label} onChange={e=>setCfg(c=>({...c,true_label:parseInt(e.target.value)}))} style={{width:"100%",accentColor:"#8b5cf6"}}/>
                </div>
                <button onClick={doAttack} disabled={loading==="attack"} style={{padding:"10px",borderRadius:8,border:"none",background:loading==="attack"?"#1e2d4a":"#2563eb",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {loading==="attack"?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Running...</>:<><Zap size={14}/>Launch Attack</>}
                </button>
              </div>

              <div className="card" style={{padding:20}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>Result</h2>
                {attackResult?.error && <p style={{color:"#ef4444",fontSize:13}}>{attackResult.error}</p>}
                {attackResult&&!attackResult.error&&(
                  <div style={{display:"flex",flexDirection:"column",gap:10,fontFamily:"monospace",fontSize:12}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Status</span><span style={{color:attackResult.success?"#ef4444":"#22c55e"}}>{attackResult.success?"✗ SUCCEEDED":"✓ BLOCKED"}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Threat</span><Badge level={attackResult.threat_level}/></div>
                    <div style={{height:1,background:"#1e2d4a"}}/>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Original</span><span style={{color:"#fff"}}>{attackResult.original_label}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Adversarial</span><span style={{color:attackResult.success?"#ef4444":"#fff"}}>{attackResult.adversarial_label}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Confidence drop</span><span style={{color:"#f59e0b"}}>{(attackResult.confidence_drop*100).toFixed(2)}%</span></div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Perturbation L∞</span><span style={{color:"#fff"}}>{attackResult.perturbation_magnitude?.toFixed(5)}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#94a3b8"}}>Time</span><span style={{color:"#fff"}}>{attackResult.execution_time_ms}ms</span></div>
                    <div style={{marginTop:8}}>
                      {[["Original",attackResult.original_confidence,"#22c55e"],["Adversarial",attackResult.adversarial_confidence,"#ef4444"]].map(([l,v,c]:any)=>(
                        <div key={l} style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:"#64748b"}}>{l}</span><span style={{color:c}}>{(v*100).toFixed(1)}%</span></div>
                          <div style={{height:6,borderRadius:3,background:"#1e2d4a"}}><div style={{height:6,borderRadius:3,width:`${v*100}%`,background:c,transition:"width 0.5s"}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!attackResult&&!loading&&<p style={{color:"#475569",fontSize:13}}>Configure and launch an attack to see results.</p>}
              </div>
            </div>
          </>}

          {/* DRIFT */}
          {tab==="drift" && <>
            <h1 style={{fontSize:20,fontWeight:600,color:"#fff"}}>Data Drift Monitor</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:8}}><Database size={14}/>Drift Detection</h2>
                <p style={{fontSize:13,color:"#94a3b8"}}>Runs PSI and Jensen-Shannon divergence on production data vs reference distribution across 10 features.</p>
                <button onClick={doDrift} disabled={loading==="drift"} style={{padding:10,borderRadius:8,border:"none",background:loading==="drift"?"#1e2d4a":"#0f766e",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {loading==="drift"?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Analysing...</>:<><TrendingUp size={14}/>Run Drift Analysis</>}
                </button>
                {driftResult&&!driftResult.error&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8,fontFamily:"monospace",fontSize:12}}>
                    {[["Dataset Drift",driftResult.dataset_drift?"DETECTED":"NONE",driftResult.dataset_drift?"#ef4444":"#22c55e"],["Drift Share",`${(driftResult.drift_share*100).toFixed(1)}% of features`,"#fff"],["Severity",driftResult.severity?.toUpperCase(),driftResult.severity==="severe"?"#ef4444":driftResult.severity==="moderate"?"#f59e0b":"#3b82f6"]].map(([l,v,c]:any)=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",borderRadius:6,background:"#0a0e1a"}}>
                        <span style={{color:"#94a3b8"}}>{l}</span><span style={{color:c}}>{v}</span>
                      </div>
                    ))}
                    <div style={{padding:"10px",borderRadius:6,background:"#0a0e1a"}}>
                      <p style={{fontSize:10,color:"#475569",textTransform:"uppercase",marginBottom:6}}>Recommendations</p>
                      {driftResult.recommendations?.map((r:string,i:number)=>(
                        <div key={i} style={{display:"flex",gap:6,fontSize:11,color:"#cbd5e1",marginBottom:4}}><ChevronRight size={10} style={{color:"#14b8a6",flexShrink:0,marginTop:2}}/>{r}</div>
                      ))}
                    </div>
                  </div>
                )}
                {driftResult?.error&&<p style={{color:"#ef4444",fontSize:13}}>{driftResult.error}</p>}
              </div>

              {driftResult?.feature_stats&&(
                <div className="card" style={{padding:20}}>
                  <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>Feature PSI Scores</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={Object.entries(driftResult.feature_stats).map(([k,v]:any)=>({feature:k.replace("feature_","F"),psi:v.psi}))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
                      <XAxis dataKey="feature" stroke="#475569" tick={{fontSize:10}}/>
                      <YAxis stroke="#475569" tick={{fontSize:10}}/>
                      <Tooltip contentStyle={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:8,fontSize:12}}/>
                      <Bar dataKey="psi" fill="#14b8a6" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{fontSize:11,color:"#475569",textAlign:"center",marginTop:8}}>PSI &gt; 0.2 = significant drift</p>
                </div>
              )}
            </div>
          </>}

          {/* THREATMAP */}
          {tab==="threatmap" && <ThreatMap />}

          {/* MODELCARD */}
          {tab==="modelcard" && <ModelCard />}

          {/* LEADERBOARD */}
          {tab==="leaderboard" && <AttackLeaderboard />}

          {/* MODELCARD */}

          {/* LEADERBOARD */}

          {/* ABTEST */}
          {tab==="abtest" && <ABTesting />}

          {/* RETRAIN */}
          {tab==="retrain" && <AutoRetrain />}

          {/* CHAT */}
          {tab==="chat" && <AIChatbot />}

          {/* SHAP */}
          {tab==="shap" && <ShapExplainer />}

          {/* VISUALISER */}
          {tab==="visualiser" && <AttackVisualiser />}

          {/* SHOWCASE */}
          {tab==="showcase" && <Showcase />}

          {/* NLP */}
          {tab==="nlp" && <>
            <h1 style={{fontSize:20,fontWeight:600,color:"#fff"}}>NLP Sentiment Analyser</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:8}}><Terminal size={14}/>DistilBERT Inference</h2>
                <textarea value={nlpText} onChange={e=>setNlpText(e.target.value)} rows={5} style={{width:"100%",background:"#0a0e1a",border:"1px solid #1e2d4a",borderRadius:8,padding:12,color:"#e2e8f0",fontSize:13,resize:"none",outline:"none"}}/>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["The model blocked the adversarial attack.","Critical failure: accuracy dropped to 61%.","Routine inference completed normally."].map((t,i)=>(
                    <button key={i} onClick={()=>setNlpText(t)} style={{fontSize:11,padding:"4px 10px",borderRadius:4,border:"1px solid #1e2d4a",background:"none",color:"#94a3b8",cursor:"pointer"}}>Example {i+1}</button>
                  ))}
                </div>
                <button onClick={doNLP} disabled={loading==="nlp"||!nlpText.trim()} style={{padding:10,borderRadius:8,border:"none",background:loading==="nlp"?"#1e2d4a":"#7c3aed",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {loading==="nlp"?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Analysing...</>:<><Cpu size={14}/>Analyse Sentiment</>}
                </button>
              </div>

              <div className="card" style={{padding:20}}>
                <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>Prediction Result</h2>
                {nlpResult?.error&&<p style={{color:"#ef4444",fontSize:13}}>{nlpResult.error}</p>}
                {nlpResult&&!nlpResult.error&&(
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{textAlign:"center",padding:20,borderRadius:8,background:"#0a0e1a"}}>
                      <p style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Predicted sentiment</p>
                      <p style={{fontSize:32,fontWeight:600,fontFamily:"monospace",color:nlpResult.prediction?.label==="positive"?"#22c55e":nlpResult.prediction?.label==="negative"?"#ef4444":"#3b82f6"}}>{nlpResult.prediction?.label?.toUpperCase()}</p>
                      <p style={{fontSize:12,color:"#64748b",marginTop:4}}>Confidence: {(nlpResult.prediction?.confidence*100).toFixed(1)}%</p>
                    </div>
                    {Object.entries(nlpResult.prediction?.probabilities??{}).map(([label,prob]:any)=>(
                      <div key={label}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:"#94a3b8",textTransform:"capitalize"}}>{label}</span><span style={{color:"#fff",fontFamily:"monospace"}}>{(prob*100).toFixed(1)}%</span></div>
                        <div style={{height:8,borderRadius:4,background:"#1e2d4a"}}><div style={{height:8,borderRadius:4,width:`${prob*100}%`,background:label==="positive"?"#22c55e":label==="negative"?"#ef4444":"#3b82f6",transition:"width 0.5s"}}/></div>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:"monospace",padding:"8px 10px",borderRadius:6,background:"#0a0e1a"}}><span style={{color:"#94a3b8"}}>Model</span><span style={{color:"#8b5cf6"}}>{nlpResult.model}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:"monospace",padding:"8px 10px",borderRadius:6,background:"#0a0e1a"}}><span style={{color:"#94a3b8"}}>Latency</span><span style={{color:"#fff"}}>{nlpResult.latency_ms}ms</span></div>
                  </div>
                )}
                {!nlpResult&&<p style={{color:"#475569",fontSize:13}}>Enter text and click Analyse.</p>}
              </div>
            </div>
          </>}

        </main>
      </div>
    </div>
  )
}
