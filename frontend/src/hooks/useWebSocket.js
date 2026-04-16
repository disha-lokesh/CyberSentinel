import { useEffect, useRef, useCallback } from "react";
import { connectWS } from "../api/client";

/**
 * Hook that maintains a WebSocket connection and dispatches events.
 * @param {function} onEvent - (event, payload) => void
 */
export function useWebSocket(onEvent) {
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = connectWS(onEvent);
    return () => wsRef.current?.close();
  }, []);

  const send = useCallback((data) => {
    wsRef.current?.send(JSON.stringify(data));
  }, []);

  return { send };
}
