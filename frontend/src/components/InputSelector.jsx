import { useState } from 'react';
import {
  detectImage,
  uploadVideoAsStream,
  processVideo,
  connectStream,
  setSource,
} from '../services/api';

const MODES = [
  { id: 'image', label: '🖼️ Image', desc: 'Upload & analyze a single frame' },
  { id: 'video', label: '🎬 Video', desc: 'Upload video for frame-by-frame analysis' },
  { id: 'stream', label: '📡 Live Stream', desc: 'RTSP / HTTP camera feed' },
];

export default function InputSelector({ onResult, onModeChange }) {
  const [mode, setMode] = useState('stream');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [videoProgress, setVideoProgress] = useState(null);

  const switchMode = (m) => {
    setMode(m);
    setFeedback('');
    setImageResult(null);
    setVideoProgress(null);
    if (onModeChange) onModeChange(m);
  };

  // ── Image Upload ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setFeedback('Analyzing image…');
    setImageResult(null);
    try {
      const result = await detectImage(file);
      if (result.error) {
        setFeedback(`Error: ${result.error}`);
      } else {
        setFeedback(`Detected ${result.total_people} people`);
        setImageResult(result);
        if (onResult) onResult(result);
      }
    } catch (err) {
      setFeedback('Upload failed — is the backend running?');
    }
    setLoading(false);
    e.target.value = '';
  };

  // ── Video Upload (frame-by-frame processing) ──
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setFeedback(`Processing ${file.name}…`);
    setVideoProgress({ frame: 0, total_frames: 0, people: 0 });
    try {
      const result = await processVideo(file);
      if (result.error) {
        setFeedback(`Error: ${result.error}`);
      } else {
        setFeedback(
          `Done — ${result.frames_processed} frames, avg ${result.average_people} people, ${result.total_alerts} alerts`
        );
        if (onResult) onResult(result);
      }
    } catch (err) {
      setFeedback('Processing failed');
    }
    setVideoProgress(null);
    setLoading(false);
    e.target.value = '';
  };

  // ── Video as live stream source ──
  const handleVideoAsStream = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setFeedback(`Uploading ${file.name} as stream source…`);
    try {
      const result = await uploadVideoAsStream(file);
      setFeedback(result.message || result.error || 'Done');
    } catch (err) {
      setFeedback('Upload failed');
    }
    setLoading(false);
    e.target.value = '';
  };

  // ── RTSP Connect ──
  const handleStreamConnect = async () => {
    if (!rtspUrl.trim()) {
      setFeedback('Enter a stream URL');
      return;
    }
    setLoading(true);
    setFeedback(`Connecting to ${rtspUrl}…`);
    try {
      const result = await connectStream(rtspUrl);
      setFeedback(result.message || result.error || 'Connected');
    } catch (err) {
      setFeedback('Connection failed');
    }
    setLoading(false);
  };

  // ── Webcam ──
  const handleWebcam = async () => {
    setLoading(true);
    setFeedback('Starting webcam…');
    try {
      const result = await setSource('webcam');
      setFeedback(result.message || result.error || 'Done');
    } catch (err) {
      setFeedback('Failed to start webcam');
    }
    setLoading(false);
  };

  // ── Reset to mock ──
  const handleMock = async () => {
    setLoading(true);
    try {
      const result = await setSource('mock');
      setFeedback(result.message || 'Reset to mock');
    } catch (err) {
      setFeedback('Failed');
    }
    setLoading(false);
  };

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon orange">📥</div>
          <span className="card-title">Input Source</span>
        </div>
      </div>
      <div className="card-body">
        {/* Mode Tabs */}
        <div className="input-mode-tabs">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`input-mode-tab ${mode === m.id ? 'active' : ''}`}
              onClick={() => switchMode(m.id)}
            >
              <span className="input-mode-tab-label">{m.label}</span>
              <span className="input-mode-tab-desc">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Mode-Specific Controls */}
        <div className="input-mode-content">

          {/* ── IMAGE MODE ── */}
          {mode === 'image' && (
            <div className="input-mode-panel">
              <label className={`control-btn primary input-file-btn ${loading ? 'activated' : ''}`}>
                {loading ? '⏳ Analyzing…' : '📤 Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={loading} />
              </label>
              {imageResult && imageResult.annotated_frame_b64 && (
                <div className="input-preview">
                  <img
                    src={`data:image/jpeg;base64,${imageResult.annotated_frame_b64}`}
                    alt="Detection result"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── VIDEO MODE ── */}
          {mode === 'video' && (
            <div className="input-mode-panel">
              <div style={{ display: 'flex', gap: '8px' }}>
                <label className={`control-btn primary input-file-btn ${loading ? 'activated' : ''}`} style={{ flex: 1 }}>
                  {loading ? '⏳ Processing…' : '🔬 Analyze Video'}
                  <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} disabled={loading} />
                </label>
                <label className={`control-btn success input-file-btn ${loading ? 'activated' : ''}`} style={{ flex: 1 }}>
                  {loading ? '⏳ Uploading…' : '▶️ Use as Stream'}
                  <input type="file" accept="video/*" onChange={handleVideoAsStream} style={{ display: 'none' }} disabled={loading} />
                </label>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <strong>Analyze:</strong> Processes all frames and returns summary.
                <strong> Stream:</strong> Sets video as live feed source.
              </div>
            </div>
          )}

          {/* ── LIVE STREAM MODE ── */}
          {mode === 'stream' && (
            <div className="input-mode-panel">
              <div className="input-url-row">
                <input
                  type="text"
                  className="input-url-field"
                  placeholder="rtsp://camera-ip:554/stream or http://..."
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStreamConnect()}
                  disabled={loading}
                />
                <button
                  className={`control-btn primary ${loading ? 'activated' : ''}`}
                  onClick={handleStreamConnect}
                  disabled={loading}
                >
                  {loading ? '⏳' : '🔗'} Connect
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="control-btn success" onClick={handleWebcam} disabled={loading} style={{ flex: 1 }}>
                  🎥 Start Webcam
                </button>
                <button className="control-btn warning" onClick={handleMock} disabled={loading} style={{ flex: 1 }}>
                  🔄 Reset to Mock
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="input-feedback">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
