import axios from "axios"
const BASE = "http://localhost:8000"
export const api = axios.create({ baseURL: BASE, timeout: 30000 })
export const runAttack = (p: any) => api.post("/api/v1/security/attack", p).then(r => r.data)
export const runDrift = () => api.post("/api/v1/pipeline/drift").then(r => r.data)
export const getStats = () => api.get("/api/v1/dashboard/stats").then(r => r.data)
export const analyseText = (text: string) => api.post("/api/v1/inference/nlp", { text }).then(r => r.data)
