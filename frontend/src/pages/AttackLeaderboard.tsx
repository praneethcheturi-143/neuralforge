import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";


const ATTACK_COLORS: Record<string, string> = {
  FGSM:  "#6366f1",
  PGD:   "#ef4444",
  "C&W": "#f59e0b",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#f59e0b",
  low:      "#10b981",
};

type AttackEntry = {
  attack: string;
  model: string;
  success_rate: number;
  avg_confidence_drop: number;
  avg_perturbation: number;
  threat_level: string;
  count: number;
  timestamp: string;
};

function generateMockData(): AttackEntry[] {
  const attacks = ["FGSM", "PGD", "C&W"];
  const models = ["ResNet-18", "DistilBERT"];
  const levels = ["critical", "high", "medium", "low"];
  return attacks.flatMap(attack =>
    models.map(model => ({
      attack,
      model,
      success_rate:          attack === "C&W" ? 87 + Math.random()*8 : attack === "PGD" ? 72 + Math.random()*12 : 55 + Math.random()*15,
      avg_confidence_drop:   attack === "C&W" ? 0.65 + Math.random()*0.2 : attack === "PGD" ? 0.48 + Math.random()*0.2 : 0.32 + Math.random()*0.2,
      avg_perturbation:      attack === "FGSM" ? 0.031 + Math.random()*0.01 : attack === "PGD" ? 0.018 + Math.random()*0.008 : 0.009 + Math.random()*0.005,
      threat_level:          attack === "C&W" ? "critical" : attack === "PGD" ? levels[Math.floor(Math.random()*2)] : levels[1 + Math.floor(Math.random()*2)],
      count:                 Math.floor(20 + Math.random()*80),
      timestamp:             new Date().toISOString(),
    }))
  );
}

function generateHistoryPoint(t: number) {
  return {
    time: new Date(Date.now() - (19 - t) * 3000).toLocaleTimeString(),
    FGSM:  +(55 + Math.random()*20).toFixed(1),
    PGD:   +(70 + Math.random()*18).toFixed(1),
    "C&W": +(85 + Math.random()*10).toFixed(1),
  };
}

export default function AttackLeaderboard() {
  const [data, setData]       = useState<AttackEntry[]>(generateMockData());
  const [history, setHistory] = useState(() => Array.from({length:20}, (_, i) => generateHistoryPoint(i)));
  const [live, setLive]       = useState(true);
  const [sortBy, setSortBy]   = useState<keyof AttackEntry>("success_rate");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!live) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setData(generateMockData());
      setHistory(h => [...h.slice(1), generateHistoryPoint(19)]);
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [live]);

  const sorted = [...data].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

  const radarData = ["FGSM","PGD","C&W"].map(attack => {
    const entries = data.filter(d => d.attack === attack);
    const avg = (key: keyof AttackEntry) =>
      entries.reduce((s, e) => s + (e[key] as number), 0) / entries.length;
    return {
      attack,
      "Success rate":     +avg("success_rate").toFixed(1),
      "Confidence drop":  +(avg("avg_confidence_drop")*100).toFixed(1),
      "Stealth":          +(100 - avg("avg_perturbation")*2000).toFixed(1),
      "Threat score":     entries.filter(e => e.threat_level === "critical").length > 0 ? 90 : 60,
    };
  });

  const barData = ["FGSM","PGD","C&W"].map(attack => ({
    attack,
    ResNet18:    +data.find(d => d.attack === attack && d.model === "ResNet-18")?.success_rate.toFixed(1)! || 0,
    DistilBERT:  +data.find(d => d.attack === attack && d.model === "DistilBERT")?.success_rate.toFixed(1)! || 0,
  }));

  return (
    <div style={{ padding: "24px", color: "var(--text, #1a1a2e)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Attack leaderboard</h2>
          <p style={{ fontSize:13, color:"#6b7280", margin:"4px 0 0" }}>
            Live rankings of adversarial attack effectiveness — updated every 3s
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:12, color:"#9ca3af" }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setLive(l => !l)}
            style={{
              padding:"6px 14px", borderRadius:8, border:"1px solid",
              borderColor: live ? "#10b981" : "#e5e7eb",
              background: live ? "#10b98122" : "transparent",
              color: live ? "#10b981" : "#6b7280",
              cursor:"pointer", fontSize:13, fontWeight:600,
            }}
          >
            {live ? "🟢 Live" : "⏸ Paused"}
          </button>
        </div>
      </div>

      {/* Top stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {["FGSM","PGD","C&W"].map(attack => {
          const entries = data.filter(d => d.attack === attack);
          const avgRate = entries.reduce((s,e) => s + e.success_rate, 0) / entries.length;
          const topThreat = entries.some(e => e.threat_level === "critical");
          return (
            <div key={attack} style={{
              background:"#f8f9fb", border:`2px solid ${ATTACK_COLORS[attack]}33`,
              borderRadius:12, padding:16,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontWeight:700, fontSize:15, color:ATTACK_COLORS[attack] }}>{attack}</span>
                <span style={{
                  fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:600,
                  background: topThreat ? "#ef444422" : "#f59e0b22",
                  color: topThreat ? "#ef4444" : "#f59e0b",
                }}>
                  {topThreat ? "CRITICAL" : "HIGH"}
                </span>
              </div>
              <div style={{ fontSize:32, fontWeight:800, color:ATTACK_COLORS[attack] }}>
                {avgRate.toFixed(1)}%
              </div>
              <div style={{ fontSize:11, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                avg success rate
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        {/* Bar chart */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Success rate by model</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="attack" tick={{ fontSize:12 }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize:11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Bar dataKey="ResNet18"   name="ResNet-18"   fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="DistilBERT" name="DistilBERT"  fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Attack profile radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={[
              { metric:"Success rate", FGSM:62, PGD:78, "C&W":91 },
              { metric:"Stealth",      FGSM:45, PGD:68, "C&W":88 },
              { metric:"Speed",        FGSM:95, PGD:55, "C&W":20 },
              { metric:"Threat score", FGSM:55, PGD:72, "C&W":93 },
              { metric:"Conf. drop",   FGSM:38, PGD:54, "C&W":72 },
            ]}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize:11 }} />
              <PolarRadiusAxis domain={[0,100]} tick={false} />
              <Tooltip />
              {["FGSM","PGD","C&W"].map(a => (
                <Radar key={a} name={a} dataKey={a}
                  stroke={ATTACK_COLORS[a]} fill={ATTACK_COLORS[a]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live history */}
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, marginBottom:24 }}>
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Live success rate history</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize:10 }} interval={4} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize:11 }} domain={[40,100]} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Legend />
            {["FGSM","PGD","C&W"].map(a => (
              <Line key={a} type="monotone" dataKey={a}
                stroke={ATTACK_COLORS[a]} strokeWidth={2} dot={false} name={a} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard table */}
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700 }}>Full rankings</h3>
          <select
            value={sortBy as string}
            onChange={e => setSortBy(e.target.value as keyof AttackEntry)}
            style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"5px 10px", fontSize:13 }}
          >
            <option value="success_rate">Sort by success rate</option>
            <option value="avg_confidence_drop">Sort by confidence drop</option>
            <option value="count">Sort by count</option>
          </select>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              {["Rank","Attack","Model","Success rate","Conf. drop","Perturbation","Threat","Count"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", borderBottom:"2px solid #e5e7eb", color:"#9ca3af", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={`${row.attack}-${row.model}`} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"10px 12px", fontWeight:700, color: i===0?"#f59e0b":i===1?"#9ca3af":i===2?"#cd7f32":"#6b7280" }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                </td>
                <td style={{ padding:"10px 12px", fontWeight:700, color:ATTACK_COLORS[row.attack] }}>{row.attack}</td>
                <td style={{ padding:"10px 12px", color:"#374151" }}>{row.model}</td>
                <td style={{ padding:"10px 12px", fontWeight:600 }}>{row.success_rate.toFixed(1)}%</td>
                <td style={{ padding:"10px 12px" }}>{(row.avg_confidence_drop*100).toFixed(1)}%</td>
                <td style={{ padding:"10px 12px" }}>{row.avg_perturbation.toFixed(4)}</td>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{
                    padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600,
                    background:SEVERITY_COLORS[row.threat_level]+"22",
                    color:SEVERITY_COLORS[row.threat_level],
                  }}>{row.threat_level}</span>
                </td>
                <td style={{ padding:"10px 12px", color:"#6b7280" }}>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
