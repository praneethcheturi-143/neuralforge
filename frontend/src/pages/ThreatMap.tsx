import { useState, useEffect, useRef } from "react"
import { Shield, Wifi } from "lucide-react"

const ATTACK_ORIGINS = [
  { city:"New York", lat:40.7, lng:-74.0, country:"US" },
  { city:"London", lat:51.5, lng:-0.1, country:"UK" },
  { city:"Beijing", lat:39.9, lng:116.4, country:"CN" },
  { city:"Moscow", lat:55.7, lng:37.6, country:"RU" },
  { city:"Tokyo", lat:35.7, lng:139.7, country:"JP" },
  { city:"Berlin", lat:52.5, lng:13.4, country:"DE" },
  { city:"São Paulo", lat:-23.5, lng:-46.6, country:"BR" },
  { city:"Sydney", lat:-33.9, lng:151.2, country:"AU" },
  { city:"Mumbai", lat:19.1, lng:72.9, country:"IN" },
  { city:"Toronto", lat:43.7, lng:-79.4, country:"CA" },
  { city:"Paris", lat:48.9, lng:2.3, country:"FR" },
  { city:"Singapore", lat:1.3, lng:103.8, country:"SG" },
]

const TARGET = { city:"NeuralForge HQ", lat:37.7, lng:-122.4 }

const ATTACK_TYPES = ["FGSM","PGD","C&W","DeepFool","SQL Injection","Data Poisoning"]
const LEVELS = ["low","medium","high","critical"]
const LEVEL_COLORS: any = { low:"#22c55e", medium:"#f59e0b", high:"#f97316", critical:"#ef4444" }

function latLngToXY(lat: number, lng: number, w: number, h: number) {
  const x = (lng + 180) / 360 * w
  const y = (90 - lat) / 180 * h
  return { x, y }
}

export default function ThreatMap() {
  const [attacks, setAttacks] = useState<any[]>([])
  const [stats, setStats] = useState({ total:0, blocked:0, critical:0 })
  const canvasRef = useRef<SVGSVGElement>(null)
  const W = 680, H = 340

  useEffect(() => {
    const interval = setInterval(() => {
      const origin = ATTACK_ORIGINS[Math.floor(Math.random() * ATTACK_ORIGINS.length)]
      const level = LEVELS[Math.floor(Math.random() * LEVELS.length)]
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]
      const newAttack = { id: Date.now(), origin, type, level, timestamp: Date.now(), opacity: 1 }
      setAttacks(prev => [newAttack, ...prev].slice(0, 15))
      setStats(prev => ({
        total: prev.total + 1,
        blocked: prev.blocked + (Math.random() > 0.3 ? 1 : 0),
        critical: prev.critical + (level === "critical" ? 1 : 0),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const target = latLngToXY(TARGET.lat, TARGET.lng, W, H)

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:600,color:"#fff",marginBottom:4}}>Live Threat Map</h1>
          <p style={{fontSize:13,color:"#64748b"}}>Real-time adversarial attack origins streaming from around the world.</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#22c55e"}}>
          <Wifi size={14}/> Live
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {label:"Total Attacks",value:stats.total,col:"#3b82f6"},
          {label:"Blocked",value:stats.blocked,col:"#22c55e"},
          {label:"Critical",value:stats.critical,col:"#ef4444"},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:"16px",textAlign:"center"}}>
            <p style={{fontSize:32,fontWeight:700,color:s.col,fontFamily:"monospace",margin:"0 0 4px"}}>{s.value}</p>
            <p style={{fontSize:12,color:"#64748b",margin:0}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <svg ref={canvasRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:"#060d1f",display:"block"}}>
          {/* Grid lines */}
          {Array.from({length:7},(_,i)=>(
            <line key={`h${i}`} x1={0} y1={i*H/6} x2={W} y2={i*H/6} stroke="#0f2040" strokeWidth={0.5}/>
          ))}
          {Array.from({length:13},(_,i)=>(
            <line key={`v${i}`} x1={i*W/12} y1={0} x2={i*W/12} y2={H} stroke="#0f2040" strokeWidth={0.5}/>
          ))}

          {/* Continent outlines (simplified dots) */}
          {ATTACK_ORIGINS.map(o=>{
            const p = latLngToXY(o.lat, o.lng, W, H)
            return <circle key={o.city} cx={p.x} cy={p.y} r={3} fill="#1e3a5f" stroke="#2d5a8e" strokeWidth={0.5}/>
          })}

          {/* Attack lines */}
          {attacks.map(a=>{
            const from = latLngToXY(a.origin.lat, a.origin.lng, W, H)
            const col = LEVEL_COLORS[a.level]
            const age = (Date.now() - a.timestamp) / 8000
            const opacity = Math.max(0, 1 - age)
            return (
              <g key={a.id} opacity={opacity}>
                <line x1={from.x} y1={from.y} x2={target.x} y2={target.y}
                  stroke={col} strokeWidth={1} strokeDasharray="4 4" opacity={0.6}/>
                <circle cx={from.x} cy={from.y} r={5} fill={col} opacity={0.8}>
                  <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
              </g>
            )
          })}

          {/* Target */}
          <circle cx={target.x} cy={target.y} r={8} fill="#3b82f6" opacity={0.9}/>
          <circle cx={target.x} cy={target.y} r={14} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={0.5}>
            <animate attributeName="r" values="8;20;8" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
          </circle>
          <text x={target.x+16} y={target.y+4} fill="#3b82f6" fontSize={10} fontFamily="monospace">NeuralForge</text>

          {/* City labels */}
          {attacks.slice(0,3).map(a=>{
            const p = latLngToXY(a.origin.lat, a.origin.lng, W, H)
            const col = LEVEL_COLORS[a.level]
            const age = (Date.now() - a.timestamp) / 8000
            const opacity = Math.max(0, 1 - age)
            return (
              <text key={`label-${a.id}`} x={p.x+8} y={p.y-4} fill={col} fontSize={9} fontFamily="monospace" opacity={opacity}>
                {a.origin.city} [{a.type}]
              </text>
            )
          })}
        </svg>
      </div>

      {/* Recent attacks feed */}
      <div className="card" style={{padding:16}}>
        <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <Shield size={14}/>Recent Attacks
        </h2>
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
          {attacks.map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:6,background:"#0a0e1a",fontSize:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:LEVEL_COLORS[a.level]}}/>
                <span style={{color:"#fff",fontFamily:"monospace"}}>{a.type}</span>
                <span style={{color:"#64748b"}}>from {a.origin.city}, {a.origin.country}</span>
              </div>
              <span style={{color:LEVEL_COLORS[a.level],fontFamily:"monospace",fontSize:10}}>{a.level.toUpperCase()}</span>
            </div>
          ))}
          {attacks.length===0 && <p style={{color:"#475569",fontSize:12}}>Waiting for attacks...</p>}
        </div>
      </div>
    </div>
  )
}
