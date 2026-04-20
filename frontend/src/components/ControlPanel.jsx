import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ControlPanel({ onSimulate }) {
  const [loading, setLoading] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const simulate = async (scenario) => {
    setLoading(scenario);
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      if (onSimulate) onSimulate(data);
    } catch (e) {
      console.error('Simulate error:', e);
    }
    setLoading(null);
  };

  const simulateAlert = async (zone, level) => {
    setLoading(`alert-${level}`);
    try {
      await fetch(`${API_BASE}/simulate-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone, level }),
      });
    } catch (e) {
      console.error('Alert sim error:', e);
    }
    setLoading(null);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/upload-video`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || 'Uploaded');
    } catch (err) {
      setUploadStatus('Upload failed');
    }
  };

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon purple">🎛</div>
          <span className="card-title">Command Center</span>
        </div>
      </div>
      <div className="card-body">
        {/* Scenario Triggers */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Simulate Scenario
          </div>
          <div className="controls-grid">
            <button
              className="control-btn success"
              onClick={() => simulate('normal')}
              disabled={loading !== null}
            >
              {loading === 'normal' ? '⏳' : '✅'} Normal
            </button>
            <button
              className="control-btn warning"
              onClick={() => simulate('crowded')}
              disabled={loading !== null}
            >
              {loading === 'crowded' ? '⏳' : '👥'} Crowded
            </button>
            <button
              className="control-btn danger"
              onClick={() => simulate('panic')}
              disabled={loading !== null}
            >
              {loading === 'panic' ? '⏳' : '🚨'} Panic
            </button>
            <button
              className="control-btn primary"
              onClick={() => simulateAlert('Zone_1_1', 'critical')}
              disabled={loading !== null}
            >
              {loading === 'alert-critical' ? '⏳' : '⚡'} Alert
            </button>
          </div>
        </div>

        {/* Manual Override */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Manual Override
          </div>
          <div className="controls-grid">
            <button className="control-btn success" onClick={() => alert('Gate A opened')}>
              🚪 Open Gate A
            </button>
            <button className="control-btn danger" onClick={() => alert('PA alert triggered')}>
              📢 Trigger PA
            </button>
            <button className="control-btn warning" onClick={() => alert('Staff notified')}>
              👮 Notify Staff
            </button>
            <button className="control-btn primary" onClick={() => alert('Rerouting crowd')}>
              🔀 Reroute
            </button>
          </div>
        </div>

        {/* Upload Video */}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Upload Video Feed
          </div>
          <label className="control-btn primary" style={{ cursor: 'pointer', justifyContent: 'center' }}>
            📁 Choose Video File
            <input
              type="file"
              accept="video/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </label>
          {uploadStatus && (
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '6px', textAlign: 'center' }}>
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
