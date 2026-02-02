import { useEffect, useRef, useState, useCallback } from "react"
export interface Alert {
  id: string; type: string; message: string
  level: "low"|"medium"|"high"|"critical"; model: string; timestamp: number
}
export function useAlertStream(url: string) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket|null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws
      ws.onopen = () => { setConnected(true); clearTimeout(timer.current) }
      ws.onmessage = (e) => { try { setAlerts(p => [JSON.parse(e.data), ...p].slice(0,50)) } catch {} }
      ws.onclose = () => { setConnected(false); timer.current = setTimeout(connect, 3000) }
      ws.onerror = () => ws.close()
    } catch {}
  }, [url])
  useEffect(() => { connect(); return () => { clearTimeout(timer.current); wsRef.current?.close() } }, [connect])
  return { alerts, connected }
}
