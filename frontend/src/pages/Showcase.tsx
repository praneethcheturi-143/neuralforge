import { useState } from "react"

const tech = [
  { name:"PyTorch 2.x", cat:"ML", col:"#ef4444", desc:"ResNet-18 and DistilBERT training from scratch" },
  { name:"FastAPI", cat:"Backend", col:"#22c55e", desc:"Async REST API + WebSocket server" },
  { name:"React 18", cat:"Frontend", col:"#3b82f6", desc:"9-tab live dashboard with real-time updates" },
  { name:"DistilBERT", cat:"NLP", col:"#8b5cf6", desc:"Fine-tuned 3-class sentiment classifier" },
  { name:"MLflow", cat:"MLOps", col:"#f59e0b", desc:"Experiment tracking and model registry" },
  { name:"Docker", cat:"DevOps", col:"#06b6d4", desc:"Full stack containerisation" },
  { name:"GitHub Actions", cat:"CI/CD", col:"#6366f1", desc:"5-stage automated deploy pipeline" },
  { name:"Render", cat:"Cloud", col:"#10b981", desc:"Backend Python cloud hosting" },
  { name:"Vercel", cat:"Cloud", col:"#ffffff", desc:"Frontend edge network deployment" },
  { name:"Redis", cat:"Cache", col:"#ef4444", desc:"Real-time data caching layer" },
  { name:"TypeScript", cat:"Frontend", col:"#3b82f6", desc:"Type-safe React components" },
  { name:"Recharts", cat:"Frontend", col:"#8b5cf6", desc:"Data visualisation charts" },
]

const features = [
  { n:"01", title:"Attack Simulator", col:"#ef4444", desc:"FGSM, PGD, C&W adversarial attacks with real-time threat scoring and confidence bars.", tag:"Security" },
  { n:"02", title:"Attack Visualiser", col:"#f97316", desc:"Side-by-side original vs adversarial image comparison with pixel perturbation heatmap.", tag:"Computer Vision" },
  { n:"03", title:"Drift Monitor", col:"#f59e0b", desc:"PSI and Jensen-Shannon divergence across 10 features with severity classification.", tag:"MLOps" },
  { n:"04", title:"Auto-Retrain Pipeline", col:"#22c55e", desc:"8-stage retraining workflow triggered automatically when drift severity reaches critical.", tag:"MLOps" },
  { n:"05", title:"SHAP Explainability", col:"#14b8a6", desc:"Feature importance waterfall charts for ResNet-18 and word-level SHAP for DistilBERT.", tag:"Explainability" },
  { n:"06", title:"AI Assistant", col:"#3b82f6", desc:"Built-in chatbot with NeuralForge knowledge base answering ML security questions.", tag:"NLP" },
  { n:"07", title:"A/B Testing", col:"#8b5cf6", desc:"Live traffic splitting between model versions with statistical winner detection.", tag:"MLOps" },
  { n:"08", title:"Live Threat Map", col:"#ec4899", desc:"Real-time animated global map showing adversarial attack origins streaming in.", tag:"Security" },
  { n:"09", title:"NLP Sentiment", col:"#6366f1", desc:"DistilBERT fine-tuned on security-domain text with 88.7% accuracy at 44ms latency.", tag:"NLP" },
]

const metrics = [
  { label:"Features Built", value:"9", sub:"All production-ready" },
  { label:"Models Deployed", value:"3", sub:"ResNet-18 · DistilBERT · IsoForest" },
  { label:"Attack Types", value:"3", sub:"FGSM · PGD · C&W" },
  { label:"API Endpoints", value:"12+", sub:"REST + WebSocket" },
  { label:"Roles Covered", value:"7", sub:"ML · Security · MLOps · NLP · DE · FS · DevOps" },
  { label:"Build Stages", value:"7", sub:"Data to Deployment" },
]

const differences = [
  { title:"Real Adversarial Attacks", desc:"Most portfolios show accuracy charts. NeuralForge implements actual FGSM, PGD and C&W attacks from scratch in PyTorch — the same methods used in academic research and red-teaming.", icon:"attack" },
  { title:"Production MLOps", desc:"Not just a Jupyter notebook. Full MLflow experiment tracking, PSI drift detection, model registry, and automated retraining pipeline — same tools used at Google, Meta, and Uber.", icon:"mlops" },
  { title:"Live WebSocket Alerts", desc:"Real-time threat streaming using WebSockets. The dashboard updates instantly when attacks are detected — not a static demo or mock data.", icon:"ws" },
  { title:"Security + ML Combined", desc:"Extremely rare combination. Covers AI Security Engineer, MLOps Engineer, ML Engineer, NLP Engineer, Data Engineer, Full-Stack Engineer, and DevOps Engineer in one project.", icon:"shield" },
  { title:"Full CI/CD Pipeline", desc:"GitHub Actions automatically tests, lints, runs security scans and deploys on every push. Industry-standard DevSecMLOps workflow with 5 stages.", icon:"cicd" },
  { title:"End-to-End Deployed", desc:"Not localhost only. Live backend on Render, live frontend on Vercel, containerised with Docker. Recruiters can visit the URL right now without running anything locally.", icon:"deploy" },
]

const stages = [
  { n:"01", title:"Data Pipeline", col:"#8b5cf6", items:["CIFAR-10 dataset (50k images downloaded)","Custom NLP security-domain sentiment dataset","Feature engineering and normalisation","Reference distributions for drift baseline"] },
  { n:"02", title:"Model Training", col:"#3b82f6", items:["ResNet-18 image classifier — 91.2% accuracy","DistilBERT sentiment model — 88.7% accuracy","IsolationForest anomaly detector — 94.1% accuracy","MLflow experiment tracking and versioning"] },
  { n:"03", title:"Security Engine", col:"#ef4444", items:["FGSM attack — Fast Gradient Sign Method","PGD attack — Projected Gradient Descent 40 steps","C&W attack — Carlini Wagner L2 optimization","Feature squeezing defence + threat scoring"] },
  { n:"04", title:"MLOps Pipeline", col:"#f59e0b", items:["PSI drift detection across 10 features","Jensen-Shannon divergence monitoring","Auto-retrain triggered on severe drift","MLflow logging for all events"] },
  { n:"05", title:"Backend API", col:"#22c55e", items:["FastAPI with 12+ async endpoints","WebSocket server for live alert broadcasting","SHAP explainability endpoint","A/B testing and auto-retrain endpoints"] },
  { n:"06", title:"Frontend Dashboard", col:"#14b8a6", items:["9-tab React 18 TypeScript dashboard","Live threat feed via WebSocket","Attack visualiser with heatmap","Dark and light mode toggle"] },
  { n:"07", title:"Deployment", col:"#6366f1", items:["Docker containerisation full stack","GitHub Actions 5-stage CI/CD pipeline","Backend deployed to Render","Frontend deployed to Vercel edge network"] },
]

export default function Showcase() {
  const [activeStage, setActiveStage] = useState(0)

  return (
    <div style={{display:"flex",flexDirection:"column",gap:32}}>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#0f1629 0%,#1a0a2e 50%,#0a1628 100%)",padding:"48px 32px",borderRadius:16,textAlign:"center",border:"1px solid #1e2d4a"}}>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {["#8b5cf6","#3b82f6","#14b8a6","#ef4444"].map(c=>(
            <div key={c} style={{width:12,height:12,borderRadius:"50%",background:c}}/>
          ))}
        </div>
        <h1 style={{fontSize:42,fontWeight:700,margin:"0 0 12px",background:"linear-gradient(135deg,#8b5cf6,#3b82f6,#14b8a6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NeuralForge</h1>
        <p style={{fontSize:18,color:"#94a3b8",margin:"0 0 8px"}}>AI Security & MLOps Intelligence Platform</p>
        <p style={{fontSize:13,color:"#475569",maxWidth:600,margin:"0 auto 28px",lineHeight:1.6}}>An enterprise-grade platform combining adversarial ML security, real-time threat detection, and production MLOps — built to target the most in-demand roles of 2026.</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {["ML Engineer","AI Security Engineer","MLOps Engineer","NLP Engineer","Data Engineer","Full-Stack Engineer","DevOps Engineer"].map(r=>(
            <span key={r} style={{padding:"5px 14px",borderRadius:20,fontSize:12,background:"#1e2d4a",border:"1px solid #2d4a6a",color:"#93c5fd"}}>{r}</span>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {metrics.map(m=>(
          <div key={m.label} style={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:12,padding:20,textAlign:"center"}}>
            <p style={{fontSize:36,fontWeight:700,color:"#fff",margin:"0 0 4px",fontFamily:"monospace"}}>{m.value}</p>
            <p style={{fontSize:13,fontWeight:600,color:"#93c5fd",margin:"0 0 4px"}}>{m.label}</p>
            <p style={{fontSize:11,color:"#475569",margin:0}}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* All Features */}
      <div>
        <h2 style={{fontSize:22,fontWeight:600,color:"#fff",marginBottom:6}}>All Features</h2>
        <p style={{color:"#64748b",marginBottom:20,fontSize:13}}>9 production-ready features built across 7 build stages</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {features.map(f=>(
            <div key={f.n} style={{background:"#0f1629",border:`1px solid ${f.col}33`,borderRadius:12,padding:16,borderTop:`3px solid ${f.col}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:22,fontWeight:800,color:f.col,fontFamily:"monospace",opacity:0.5}}>{f.n}</span>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:f.col+"22",color:f.col}}>{f.tag}</span>
              </div>
              <p style={{fontSize:13,fontWeight:600,color:"#fff",margin:"0 0 6px"}}>{f.title}</p>
              <p style={{fontSize:11,color:"#64748b",margin:0,lineHeight:1.5}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Build stages */}
      <div>
        <h2 style={{fontSize:22,fontWeight:600,color:"#fff",marginBottom:6}}>Build Stages</h2>
        <p style={{color:"#64748b",marginBottom:20,fontSize:13}}>How NeuralForge was built — 7 stages from raw data to live deployment</p>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {stages.map((s,i)=>(
            <button key={i} onClick={()=>setActiveStage(i)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${activeStage===i?s.col:"#1e2d4a"}`,background:activeStage===i?s.col+"22":"none",color:activeStage===i?s.col:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>
              {s.n} {s.title}
            </button>
          ))}
        </div>
        <div style={{background:"#0f1629",border:`1px solid ${stages[activeStage].col}44`,borderRadius:12,padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <span style={{fontSize:36,fontWeight:800,color:stages[activeStage].col,fontFamily:"monospace",opacity:0.4}}>{stages[activeStage].n}</span>
            <h3 style={{fontSize:18,fontWeight:600,color:"#fff",margin:0}}>{stages[activeStage].title}</h3>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {stages[activeStage].items.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"10px 14px",borderRadius:8,background:"#0a0e1a"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:stages[activeStage].col,flexShrink:0,marginTop:5}}/>
                <span style={{fontSize:13,color:"#cbd5e1"}}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why it stands out */}
      <div>
        <h2 style={{fontSize:22,fontWeight:600,color:"#fff",marginBottom:6}}>Why NeuralForge Stands Out</h2>
        <p style={{color:"#64748b",marginBottom:20,fontSize:13}}>What makes this different from every other ML portfolio project</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
          {differences.map((d,i)=>(
            <div key={i} style={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:12,padding:20}}>
              <h3 style={{fontSize:14,fontWeight:600,color:"#fff",margin:"0 0 8px"}}>{d.title}</h3>
              <p style={{fontSize:12,color:"#94a3b8",margin:0,lineHeight:1.6}}>{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 style={{fontSize:22,fontWeight:600,color:"#fff",marginBottom:6}}>Tech Stack</h2>
        <p style={{color:"#64748b",marginBottom:20,fontSize:13}}>Every technology used and why</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {tech.map(t=>(
            <div key={t.name} style={{background:"#0f1629",border:"1px solid #1e2d4a",borderRadius:10,padding:14,display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:t.col,flexShrink:0,marginTop:4}}/>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{t.name}</span>
                  <span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:t.col+"22",color:t.col}}>{t.cat}</span>
                </div>
                <p style={{fontSize:11,color:"#64748b",margin:0}}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2026 importance */}
      <div style={{background:"linear-gradient(135deg,#1a0a2e,#0a1628)",border:"1px solid #2d1f4a",borderRadius:16,padding:32,textAlign:"center"}}>
        <h2 style={{fontSize:22,fontWeight:600,color:"#fff",marginBottom:24}}>Why This Matters in 2026</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24,marginBottom:24}}>
          {[
            {stat:"143%",label:"YoY growth in AI Engineer job postings",col:"#3b82f6"},
            {stat:"$170K+",label:"Average AI/ML Engineer salary in 2026",col:"#22c55e"},
            {stat:"88%",label:"Enterprises now use AI in production",col:"#8b5cf6"},
          ].map(s=>(
            <div key={s.stat}>
              <p style={{fontSize:38,fontWeight:700,color:s.col,margin:"0 0 6px",fontFamily:"monospace"}}>{s.stat}</p>
              <p style={{fontSize:12,color:"#94a3b8",margin:0}}>{s.label}</p>
            </div>
          ))}
        </div>
        <p style={{fontSize:13,color:"#94a3b8",maxWidth:650,margin:"0 auto",lineHeight:1.7}}>
          Companies are no longer hiring general AI enthusiasts. They want engineers who can build, secure, and operate ML systems in production. NeuralForge demonstrates exactly that — adversarial robustness, drift monitoring, MLOps pipelines, explainability, A/B testing, and real deployment all in one project.
        </p>
      </div>

      {/* Links */}
      <div style={{textAlign:"center",paddingBottom:20}}>
        <h2 style={{fontSize:20,fontWeight:600,color:"#fff",marginBottom:20}}>Live Links</h2>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          {[
            {label:"Live Dashboard", url:"https://neuralforge-ten.vercel.app", col:"#3b82f6"},
            {label:"GitHub Repo", url:"https://github.com/praneethcheturi-143/neuralforge", col:"#6366f1"},
            {label:"Backend API Docs", url:"https://neuralforge-e6ci.onrender.com/docs", col:"#22c55e"},
          ].map(l=>(
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{padding:"10px 24px",borderRadius:8,border:`1px solid ${l.col}`,color:l.col,textDecoration:"none",fontSize:13,fontWeight:600,background:l.col+"11"}}>
              {l.label} →
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}