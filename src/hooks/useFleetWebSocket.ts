import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketBaseUrl } from '@/api/config';

export interface DriverLocationUpdate {
  driver_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed_kmh?: number;
}

export function useFleetWebSocket(clientId?: string) {
  const [drivers, setDrivers] = useState<Map<string, DriverLocationUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const id = clientId || `client_${Math.random().toString(36).substring(7)}`;
    const wsUrl = getWebSocketBaseUrl(id);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'DRIVER_LOCATION_UPDATE' && payload.data) {
            const update: DriverLocationUpdate = payload.data;
            setDrivers((prev) => {
              const next = new Map(prev);
              next.set(update.driver_id, update);
              return next;
            });
          }
        } catch (err) {
          console.error('Failed to parse WebSocket packet:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn('Fleet WebSocket Error:', err);
        ws.close();
      };
    } catch (err) {
      console.warn('Fleet WebSocket connection failed:', err);
      reconnectTimeoutRef.current = setTimeout(connect, 4000);
    }
  }, [clientId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    isConnected,
    drivers: Array.from(drivers.values()),
  };
}
