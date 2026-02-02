import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line,
} from "recharts";

const MODELS = {
  "ResNet-18": {
    name: "ResNet-18 (CIFAR-10)",
    version: "1.0.0",
    type: "Image Classification",
    framework: "PyTorch 2.x",
    params: "11.2M",
    size: "44.7 MB",
    trained: "2026-06-01",
    license: "MIT",
    description: "ResNet-18 trained on CIFAR-10 for image classification. Used as the primary target model for adversarial attack simulation in NeuralForge. Achieves 91.2% top-1 accuracy on the test set.",
    intendedUse: [
      "Adversarial robustness research and benchmarking",
      "Image classification on 10-class datasets",
      "Baseline model for security evaluation pipelines",
      "Educational demonstrations of deep learning concepts",
    ],
    outOfScope: [
      "Production deployment without adversarial defences",
      "Medical imaging or safety-critical applications",
      "High-resolution images (trained on 32×32 CIFAR-10)",
      "Classes outside the 10 CIFAR-10 categories",
    ],
    performance: {
      overall: { accuracy: 91.2, precision: 90.8, recall: 91.1, f1: 90.9, latency: 23 },
      byClass: [
        { cls: "Airplane",   acc: 93.1, samples: 1000 },
        { cls: "Automobile", acc: 95.2, samples: 1000 },
        { cls: "Bird",       acc: 87.4, samples: 1000 },
        { cls: "Cat",        acc: 82.1, samples: 1000 },
        { cls: "Deer",       acc: 91.8, samples: 1000 },
        { cls: "Dog",        acc: 84.3, samples: 1000 },
        { cls: "Frog",       acc: 94.7, samples: 1000 },
        { cls: "Horse",      acc: 93.5, samples: 1000 },
        { cls: "Ship",       acc: 95.8, samples: 1000 },
        { cls: "Truck",      acc: 94.1, samples: 1000 },
      ],
    },
    adversarial: [
      { attack: "FGSM (ε=0.03)",  acc_drop: 38.2, robust_acc: 52.8 },
      { attack: "PGD (40 steps)", acc_drop: 61.4, robust_acc: 29.8 },
      { attack: "C&W (L2)",       acc_drop: 74.1, robust_acc: 17.1 },
    ],
    biases: [
      "Performs 9-11% worse on animal classes (cat, dog, bird) vs vehicle classes — likely due to higher intra-class variation in animals.",
      "Sensitivity to image compression artefacts — accuracy drops ~4% on JPEG-compressed inputs.",
      "May underperform on out-of-distribution images outside CIFAR-10 style.",
    ],
    limitations: [
      "Not robust to adversarial perturbations without additional defences.",
      "Trained on balanced 50k dataset — may not reflect real-world class distributions.",
      "Fixed input size 32×32 — requires resizing for other image sizes.",
    ],
    training: {
      dataset: "CIFAR-10 (50k train, 10k test)",
      epochs: 50,
      optimizer: "SGD (momentum=0.9, weight_decay=5e-4)",
      lr: "0.1 with cosine annealing",
      augmentation: "Random crop, horizontal flip, normalisation",
      hardware: "Single GPU (A100)",
      time: "~2 hours",
    },
  },
  "DistilBERT": {
    name: "DistilBERT (Sentiment)",
    version: "1.0.0",
    type: "Text Classification (NLP)",
    framework: "Transformers 4.x + PyTorch",
    params: "66M",
    size: "255 MB",
    trained: "2026-06-02",
    license: "Apache 2.0",
    description: "DistilBERT fine-tuned on security-domain text for 3-class sentiment analysis (positive/neutral/negative). Used in NeuralForge to classify threat descriptions, model outputs, and security alerts.",
    intendedUse: [
      "Classifying ML security alert sentiment",
      "Analysing adversarial attack report tone",
      "NLP component of AI security pipelines",
      "Research on NLP robustness in security contexts",
    ],
    outOfScope: [
      "General-purpose sentiment analysis outside security domain",
      "Non-English text (trained on English only)",
      "Sequences longer than 512 tokens",
      "Real-time production without further fine-tuning",
    ],
    performance: {
      overall: { accuracy: 88.7, precision: 88.2, recall: 88.9, f1: 88.5, latency: 44 },
      byClass: [
        { cls: "Positive", acc: 91.2, samples: 800 },
        { cls: "Neutral",  acc: 84.1, samples: 900 },
        { cls: "Negative", acc: 90.8, samples: 800 },
      ],
    },
    adversarial: [
      { attack: "TextFooler",     acc_drop: 22.1, robust_acc: 66.6 },
      { attack: "BERT-Attack",    acc_drop: 31.4, robust_acc: 57.3 },
      { attack: "Word substitution", acc_drop: 15.8, robust_acc: 72.9 },
    ],
    biases: [
      "Neutral class performs 6-7% worse than positive/negative — boundary cases are harder to classify.",
      "Security jargon not in pre-training vocabulary may reduce accuracy.",
      "May reflect biases present in the DistilBERT base model pre-training data.",
    ],
    limitations: [
      "Fine-tuned on synthetic security dataset — may not generalise to all real-world security text.",
      "Max sequence length 512 tokens — long reports need truncation.",
      "No adversarial text defences applied by default.",
    ],
    training: {
      dataset: "Custom security sentiment dataset (2,500 examples)",
      epochs: 5,
      optimizer: "AdamW (lr=2e-5, weight_decay=0.01)",
      lr: "Linear warmup + decay",
      augmentation: "Back-translation, synonym replacement",
      hardware: "Single GPU (A100)",
      time: "~30 minutes",
    },
  },
};

const METRIC_COLOR = "#6366f1";
const DANGER_COLOR = "#ef4444";
const SUCCESS_COLOR = "#10b981";

export default function ModelCard() {
  const [model, setModel] = useState<keyof typeof MODELS>("ResNet-18");
  const m = MODELS[model];

  const radarData = [
    { metric: "Accuracy",   value: m.performance.overall.accuracy },
    { metric: "Precision",  value: m.performance.overall.precision },
    { metric: "Recall",     value: m.performance.overall.recall },
    { metric: "F1 Score",   value: m.performance.overall.f1 },
    { metric: "Robustness", value: 100 - m.adversarial[0].acc_drop },
  ];

  return (
    <div style={{ padding: 24, color: "inherit" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Model cards</h2>
          <p style={{ fontSize:13, color:"#6b7280", margin:"4px 0 0" }}>
            Google/HuggingFace standard model documentation
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {Object.keys(MODELS).map(k => (
            <button key={k} onClick={() => setModel(k as keyof typeof MODELS)}
              style={{
                padding:"7px 16px", borderRadius:8, border:"1px solid",
                borderColor: model===k ? METRIC_COLOR : "#e5e7eb",
                background: model===k ? METRIC_COLOR+"22" : "transparent",
                color: model===k ? METRIC_COLOR : "#6b7280",
                cursor:"pointer", fontWeight:600, fontSize:13,
              }}>{k}</button>
          ))}
        </div>
      </div>

      {/* Identity card */}
      <div style={{ background:"#f8f9fb", border:"1px solid #e5e7eb", borderRadius:12, padding:20, marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, flexWrap:"wrap" }}>
          {[
            { label:"Model name",  value:m.name },
            { label:"Version",     value:m.version },
            { label:"Type",        value:m.type },
            { label:"Framework",   value:m.framework },
            { label:"Parameters",  value:m.params },
            { label:"Model size",  value:m.size },
            { label:"Trained",     value:m.trained },
            { label:"License",     value:m.license },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px", color:"#9ca3af", marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:14, fontWeight:600, color:"#1a1a2e" }}>{item.value}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop:16, fontSize:13, color:"#6b7280", lineHeight:1.6 }}>{m.description}</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Intended use */}
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#166534", marginBottom:12 }}>✅ Intended use</h3>
          {m.intendedUse.map((u,i) => (
            <div key={i} style={{ fontSize:13, color:"#166534", padding:"4px 0", borderBottom:"1px solid #dcfce7" }}>• {u}</div>
          ))}
        </div>
        {/* Out of scope */}
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#991b1b", marginBottom:12 }}>⚠️ Out of scope</h3>
          {m.outOfScope.map((u,i) => (
            <div key={i} style={{ fontSize:13, color:"#991b1b", padding:"4px 0", borderBottom:"1px solid #fee2e2" }}>• {u}</div>
          ))}
        </div>
      </div>

      {/* Performance */}
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, marginBottom:20 }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Performance metrics</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:20 }}>
          {[
            { label:"Accuracy",  value:`${m.performance.overall.accuracy}%` },
            { label:"Precision", value:`${m.performance.overall.precision}%` },
            { label:"Recall",    value:`${m.performance.overall.recall}%` },
            { label:"F1 Score",  value:`${m.performance.overall.f1}%` },
            { label:"Latency",   value:`${m.performance.overall.latency}ms` },
          ].map(s => (
            <div key={s.label} style={{ background:"#f8f9fb", border:"1px solid #e5e7eb", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:METRIC_COLOR }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            <h4 style={{ fontSize:13, fontWeight:600, marginBottom:12, color:"#374151" }}>Performance by class</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={m.performance.byClass} layout="vertical" margin={{ left:60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[70,100]} tickFormatter={v=>`${v}%`} tick={{ fontSize:10 }} />
                <YAxis dataKey="cls" type="category" tick={{ fontSize:11 }} width={55} />
                <Tooltip formatter={(v:number) => `${v}%`} />
                <Bar dataKey="acc" name="Accuracy" fill={METRIC_COLOR} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 style={{ fontSize:13, fontWeight:600, marginBottom:12, color:"#374151" }}>Overall performance radar</h4>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize:11 }} />
                <PolarRadiusAxis domain={[0,100]} tick={false} />
                <Radar dataKey="value" stroke={METRIC_COLOR} fill={METRIC_COLOR} fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(v:number) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Adversarial robustness */}
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, marginBottom:20 }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Adversarial robustness</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              {["Attack","Accuracy drop","Robust accuracy","Risk level"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", borderBottom:"2px solid #e5e7eb", color:"#9ca3af", fontSize:11, textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.adversarial.map((row, i) => (
              <tr key={i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"10px 12px", fontWeight:600 }}>{row.attack}</td>
                <td style={{ padding:"10px 12px", color:DANGER_COLOR, fontWeight:700 }}>-{row.acc_drop}%</td>
                <td style={{ padding:"10px 12px", color: row.robust_acc > 50 ? SUCCESS_COLOR : DANGER_COLOR, fontWeight:700 }}>{row.robust_acc}%</td>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{
                    padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                    background: row.acc_drop > 60 ? "#ef444422" : row.acc_drop > 30 ? "#f59e0b22" : "#10b98122",
                    color: row.acc_drop > 60 ? "#ef4444" : row.acc_drop > 30 ? "#f59e0b" : "#10b981",
                  }}>
                    {row.acc_drop > 60 ? "Critical" : row.acc_drop > 30 ? "High" : "Medium"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Biases + Limitations */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#92400e", marginBottom:12 }}>⚡ Known biases</h3>
          {m.biases.map((b,i) => (
            <div key={i} style={{ fontSize:13, color:"#92400e", padding:"6px 0", borderBottom:"1px solid #fef3c7", lineHeight:1.5 }}>• {b}</div>
          ))}
        </div>
        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#1e40af", marginBottom:12 }}>⚠️ Limitations</h3>
          {m.limitations.map((l,i) => (
            <div key={i} style={{ fontSize:13, color:"#1e40af", padding:"6px 0", borderBottom:"1px solid #dbeafe", lineHeight:1.5 }}>• {l}</div>
          ))}
        </div>
      </div>

      {/* Training details */}
      <div style={{ background:"#f8f9fb", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Training details</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {Object.entries(m.training).map(([k,v]) => (
            <div key={k} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px", color:"#9ca3af", marginBottom:4 }}>{k.replace(/_/g," ")}</div>
              <div style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{String(v)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
