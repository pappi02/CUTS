import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiSlice } from '../services/apiSlice';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { addNotification } from '../store/slices/uiSlice';
import { selectUser } from '../store/slices/authSlice';

const useWebSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const ws = useRef(null);

  useEffect(() => {
    if (!user) {
      // No user, skip WS connection
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${wsHost}/ws/notifications/`;
    
    console.log('Connecting WS to:', wsUrl);
    
    ws.current = new ReconnectingWebSocket(wsUrl, [], {
      maxReconnectAttempts: 10,
      reconnectInterval: 3000,
    });

    ws.current.onopen = () => {
      console.log('WebSocket connected successfully');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(addNotification({
        id: Date.now(),
        title: data.title || data.message,
        message: data.message,
        ticket_id: data.ticket_id,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        type: data.type,
      }));
      
      // Refetch tickets on relevant notifications
      if (data.type === 'ticket_created' || data.type === 'ticket_updated' || data.type === 'new_comment') {
        dispatch(apiSlice.util.invalidateTags(['Ticket']));
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [dispatch, user]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  // Ping every 30s to keep alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000);
    return () => clearInterval(pingInterval);
  }, [sendMessage]);

  return { sendMessage };
};

export default useWebSocket;

