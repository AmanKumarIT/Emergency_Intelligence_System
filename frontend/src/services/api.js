const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const getVideoStreamUrl = () => `${API_BASE}/video-stream`;

export const fetchStatus = async () => {
  const res = await fetch(`${API_BASE}/status`);
  return res.json();
};

export const fetchAlerts = async () => {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
};

export const fetchHeatmap = async () => {
  const res = await fetch(`${API_BASE}/heatmap`);
  return res.json();
};

// ── Input Mode APIs ──

export const detectImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/detect`, { method: 'POST', body: formData });
  return res.json();
};

export const uploadVideoAsStream = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-video`, { method: 'POST', body: formData });
  return res.json();
};

export const processVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/process-video`, { method: 'POST', body: formData });
  return res.json();
};

export const connectStream = async (url) => {
  const res = await fetch(`${API_BASE}/connect-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
};

export const setSource = async (source) => {
  const res = await fetch(`${API_BASE}/set-source`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
  return res.json();
};

export const createWebSocket = (onMessage, onOpen, onClose) => {
  const ws = new WebSocket(`${WS_BASE}/ws/alerts`);

  ws.onopen = () => {
    console.log('[WS] Connected');
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (e) {
      console.error('[WS] Parse error:', e);
    }
  };

  ws.onclose = () => {
    console.log('[WS] Disconnected');
    if (onClose) onClose();
    // Auto-reconnect after 3 seconds
    setTimeout(() => {
      console.log('[WS] Reconnecting...');
      createWebSocket(onMessage, onOpen, onClose);
    }, 3000);
  };

  ws.onerror = (err) => {
    console.error('[WS] Error:', err);
    ws.close();
  };

  return ws;
};
