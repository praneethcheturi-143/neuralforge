import { useState, useEffect } from "react"
import { Brain, RefreshCw } from "lucide-react"
import { api } from "../utils/api"

export default function ShapExplainer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await api.get("/api/v1/explainability/shap")
      setData(r.data)
    } catch(e:any) { setData({error: e.message}) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const Bar = ({ value, max }: any) => {
    const pct = Math.abs(value) / max * 100
    const col = value > 0 ? "#22c55e" : "#ef4444"
    return (
      <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
        <div style={{width:"50%",display:"flex",justifyContent:"flex-end"}}>
          {value < 0 && <div style={{height:8,borderRadius:4,background:col,width:`${pct}%`}}/>}
        </div>
        <div style={{width:2,height:16,background:"#1e2d4a",flexShrink:0}}/>
        <div style={{width:"50%"}}>
          {value > 0 && <div style={{height:8,borderRadius:4,background:col,width:`${pct}%`}}/>}
        </div>
      </div>
    )
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:600,color:"#fff",marginBottom:4}}>SHAP Model Explainability</h1>
          <p style={{fontSize:13,color:"#64748b"}}>Understand WHY the model made each prediction — which features pushed it positive or negative.</p>
        </div>
        <button onClick={fetch} disabled={loading} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #1e2d4a",background:"none",color:"#94a3b8",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:13}}>
          <RefreshCw size={14} style={loading?{animation:"spin 1s linear infinite"}:{}}/>Refresh
        </button>
      </div>

      {data?.error && <p style={{color:"#ef4444"}}>{data.error} — make sure backend is running.</p>}

      {data && !data.error && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          {/* Image Model SHAP */}
          <div className="card" style={{padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <Brain size={16} style={{color:"#3b82f6"}}/>
              <h2 style={{fontSize:14,fontWeight:600,color:"#fff",margin:0}}>ResNet-18 — Image Features</h2>
            </div>
            <div style={{background:"#0a0e1a",borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:"#94a3b8"}}>Prediction</span>
              <span style={{fontSize:12,fontWeight:600,color:"#3b82f6",textTransform:"capitalize"}}>{data.image_model.prediction} ({(data.image_model.confidence*100).toFixed(1)}%)</span>
            </div>

            {/* Legend */}
            <div style={{display:"flex",gap:16,marginBottom:12,fontSize:11,color:"#64748b"}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#22c55e",display:"inline-block"}}/> Pushes toward prediction</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#ef4444",display:"inline-block"}}/> Pushes against</span>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {data.image_model.shap_values.map((f:any) => {
                const max = data.image_model.shap_values[0].abs_value
                return (
                  <div key={f.feature}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                      <span style={{color:"#94a3b8"}}>{f.feature}</span>
                      <span style={{color:f.shap_value>0?"#22c55e":"#ef4444",fontFamily:"monospace"}}>{f.shap_value>0?"+":""}{f.shap_value}</span>
                    </div>
                    <Bar value={f.shap_value} max={max}/>
                  </div>
                )
              })}
            </div>
          </div>

          {/* NLP Model SHAP */}
          <div className="card" style={{padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <Brain size={16} style={{color:"#8b5cf6"}}/>
              <h2 style={{fontSize:14,fontWeight:600,color:"#fff",margin:0}}>DistilBERT — Word Importance</h2>
            </div>
            <div style={{background:"#0a0e1a",borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:"#94a3b8"}}>Prediction</span>
              <span style={{fontSize:12,fontWeight:600,color:"#8b5cf6",textTransform:"capitalize"}}>{data.nlp_model.prediction} ({(data.nlp_model.confidence*100).toFixed(1)}%)</span>
            </div>

            <div style={{display:"flex",gap:16,marginBottom:12,fontSize:11,color:"#64748b"}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#22c55e",display:"inline-block"}}/> Positive signal</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#ef4444",display:"inline-block"}}/> Negative signal</span>
            </div>

            {/* Word cloud style */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
              {data.nlp_model.shap_values.map((w:any) => {
                const opacity = 0.3 + w.abs_value * 1.4
                const col = w.shap_value > 0 ? "#22c55e" : "#ef4444"
                const size = 11 + w.abs_value * 10
                return (
                  <span key={w.word} style={{fontSize:size,color:col,opacity:Math.min(opacity,1),fontWeight:600,padding:"3px 8px",borderRadius:4,background:col+"22",border:`1px solid ${col}44`}}>
                    {w.word}
                  </span>
                )
              })}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {data.nlp_model.shap_values.slice(0,6).map((w:any) => {
                const max = data.nlp_model.shap_values[0].abs_value
                return (
                  <div key={w.word}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:"#94a3b8",fontFamily:"monospace"}}>"{w.word}"</span>
                      <span style={{color:w.shap_value>0?"#22c55e":"#ef4444",fontFamily:"monospace"}}>{w.shap_value>0?"+":""}{w.shap_value}</span>
                    </div>
                    <Bar value={w.shap_value} max={max}/>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Explanation summary */}
          <div className="card" style={{padding:20,gridColumn:"1/-1"}}>
            <h2 style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:12}}>How to Read This</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[
                {title:"Base Value",desc:"The model's average prediction before seeing any features — the starting point.",col:"#3b82f6"},
                {title:"Positive SHAP",desc:"Features pushing the prediction UP — green bars extending right. Higher = more influence.",col:"#22c55e"},
                {title:"Negative SHAP",desc:"Features pushing the prediction DOWN — red bars extending left. Larger = stronger opposition.",col:"#ef4444"},
              ].map(item=>(
                <div key={item.title} style={{padding:12,borderRadius:8,background:"#0a0e1a",borderLeft:`3px solid ${item.col}`}}>
                  <p style={{fontSize:13,fontWeight:600,color:item.col,marginBottom:6}}>{item.title}</p>
                  <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.5,margin:0}}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {loading && (
        <div style={{textAlign:"center",padding:40,color:"#475569"}}>
          <RefreshCw size={24} style={{animation:"spin 1s linear infinite",margin:"0 auto 12px",display:"block"}}/>
          Loading SHAP values...
        </div>
      )}
    </div>
  )
}
