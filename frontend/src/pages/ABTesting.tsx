import { useState, useEffect } from "react"
import { Play, Square, RefreshCw, Trophy, Zap } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { api } from "../utils/api"

export default function ABTesting() {
  const [state, setState] = useState<any>(null)
  const [split, setSplit] = useState(50)
  const [loading, setLoading] = useState("")

  const fetchStatus = async () => {
    try { const r = await api.get("/api/v1/abtest/status"); setState(r.data) } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const t = setInterval(fetchStatus, 3000)
    return () => clearInterval(t)
  }, [])

  const start = async () => {
    setLoading("start")
    try { await api.post("/api/v1/abtest/start"); await fetchStatus() } catch {}
    finally { setLoading("") }
  }

  const stop = async () => {
    setLoading("stop")
    try { await api.post("/api/v1/abtest/stop"); await fetchStatus() } catch {}
    finally { setLoading("") }
  }

  const simulate = async () => {
    setLoading("sim")
    try { const r = await api.post("/api/v1/abtest/simulate"); setState(r.data) } catch {}
    finally { setLoading("") }
  }

  const updateTraffic = async (val: number) => {
    setSplit(val)
    try { await api.post("/api/v1/abtest/traffic", { split: val }) } catch {}
  }

  const chartData = state ? [
    { name:"Accuracy", "Model A": state.model_a.accuracy, "Model B": state.model_b.accuracy },
    { name:"Latency (ms)", "Model A": state.model_a.latency, "Model B": state.model_b.latency },
    { name:"Requests", "Model A": state.model_a.requests, "Model B": state.model_b.requests },
  ] : []

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:600,color:"#fff",marginBottom:4}}>Model A/B Testing</h1>
          <p style={{fontSize:13,color:"#64748b"}}>Compare two model versions with live traffic splitting to find the best performer.</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {!state?.running ? (
            <button onClick={start} disabled={loading==="start"} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#22c55e",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
              <Play size={14}/>Start Test
            </button>
          ) : (
            <button onClick={stop} disabled={loading==="stop"} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
              <Square size={14}/>Stop Test
            </button>
          )}
          <button onClick={simulate} disabled={!state?.running||loading==="sim"} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #1e2d4a",background:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
            <Zap size={14}/>Simulate Traffic
          </button>
        </div>
      </div>

      {/* Winner banner */}
      {state?.winner && (
        <div style={{padding:"16px 20px",borderRadius:10,background:"#052e16",border:"1px solid #14532d",display:"flex",alignItems:"center",gap:12}}>
          <Trophy size={20} style={{color:"#22c55e"}}/>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:"#22c55e",margin:0}}>
              Winner: {state.winner === "model_a" ? state.model_a.name : state.model_b.name}
            </p>
            <p style={{fontSize:12,color:"#86efac",margin:0}}>Statistical confidence: {(state.confidence*100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Traffic split */}
      <div className="card" style={{padding:20}}>
        <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:16}}>Traffic Split</h2>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:13,color:"#3b82f6",fontWeight:600,minWidth:80}}>Model A: {split}%</span>
          <input type="range" min="10" max="90" step="10" value={split}
            onChange={e=>updateTraffic(parseInt(e.target.value))}
            style={{flex:1,accentColor:"#3b82f6"}}/>
          <span style={{fontSize:13,color:"#8b5cf6",fontWeight:600,minWidth:80,textAlign:"right"}}>Model B: {100-split}%</span>
        </div>
        <div style={{display:"flex",gap:4,marginTop:10,height:8,borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${split}%`,background:"#3b82f6",transition:"width 0.3s"}}/>
          <div style={{flex:1,background:"#8b5cf6"}}/>
        </div>
      </div>

      {/* Model cards */}
      {state && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[
            {key:"model_a",col:"#3b82f6",label:"Model A"},
            {key:"model_b",col:"#8b5cf6",label:"Model B"},
          ].map(({key,col,label})=>{
            const m = state[key]
            const isWinner = state.winner === key
            return (
              <div key={key} className="card" style={{padding:20,border:`1px solid ${isWinner?col+"88":"#1e2d4a"}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:col}}/>
                    <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{label}</span>
                    <span style={{fontSize:11,color:"#64748b"}}>{m.name}</span>
                  </div>
                  {isWinner && <Trophy size={14} style={{color:"#22c55e"}}/>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {label:"Accuracy",value:`${m.accuracy}%`,col:"#22c55e"},
                    {label:"Latency",value:`${m.latency}ms`,col:"#3b82f6"},
                    {label:"Requests",value:m.requests,col:"#f59e0b"},
                    {label:"Traffic",value:`${m.traffic}%`,col},
                  ].map(stat=>(
                    <div key={stat.label} style={{padding:"10px 12px",borderRadius:6,background:"#0a0e1a",textAlign:"center"}}>
                      <p style={{fontSize:20,fontWeight:600,color:stat.col,margin:"0 0 2px",fontFamily:"monospace"}}>{stat.value}</p>
                      <p style={{fontSize:11,color:"#64748b",margin:0}}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Chart */}
      {state && chartData.length > 0 && (
        <div className="card" style={{padding:20}}>
          <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:16}}>Performance Comparison</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="name" stroke="#475569" tick={{fontSize:11}}/>
              <YAxis stroke="#475569" tick={{fontSize:11}}/>
              <Tooltip contentStyle={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:8,fontSize:12}}/>
              <Bar dataKey="Model A" fill="#3b82f6" radius={[4,4,0,0]}/>
              <Bar dataKey="Model B" fill="#8b5cf6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!state?.running && !state?.winner && (
        <div className="card" style={{padding:40,textAlign:"center"}}>
          <Play size={48} style={{color:"#1e2d4a",margin:"0 auto 16px",display:"block"}}/>
          <p style={{color:"#475569"}}>Click Start Test to begin comparing models. Then use Simulate Traffic to generate requests.</p>
        </div>
      )}
    </div>
  )
}
