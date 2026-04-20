import { useState, useEffect } from 'react';
import { getVideoStreamUrl } from '../services/api';

export default function VideoStream() {
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState(false);
  const streamUrl = getVideoStreamUrl();

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon blue">📹</div>
          <span className="card-title">Live Camera Feed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {streamActive && <span className="card-badge live">● LIVE</span>}
        </div>
      </div>
      <div className="card-body" style={{ padding: '12px' }}>
        <div className="video-container">
          {!error ? (
            <>
              <img
                src={streamUrl}
                alt="Live Video Stream"
                onLoad={() => setStreamActive(true)}
                onError={() => {
                  setError(true);
                  setStreamActive(false);
                }}
              />
              {streamActive && <div className="scan-line"></div>}
              <div className="video-overlay">
                <span className="video-overlay-label">
                  <span className="rec-dot"></span>
                  CAM-01 &bull; Main Entrance
                </span>
                <span className="video-overlay-label" style={{ opacity: 0.7 }}>
                  640×480 &bull; 10 FPS
                </span>
              </div>
            </>
          ) : (
            <div className="video-placeholder">
              <div className="video-placeholder-icon">📡</div>
              <span>Stream Offline — Start Backend Server</span>
              <button
                className="control-btn primary"
                style={{ marginTop: '8px' }}
                onClick={() => {
                  setError(false);
                  setStreamActive(false);
                }}
              >
                ↻ Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
