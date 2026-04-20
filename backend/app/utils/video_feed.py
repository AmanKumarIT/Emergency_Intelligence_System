"""
Video feed manager — supports:
  1. Uploaded video file playback
  2. Static crowd image with synthetic pan (default demo)
  3. Webcam capture (if available)
"""
import cv2
import numpy as np
import os
import threading

_CROWD_IMG_PATH = os.path.join(os.path.dirname(__file__), "crowd.jpg")


class VideoFeedManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._frame_count = 0
        self._source = "mock"       # "mock" | "file" | "webcam" | "image" | "rtsp"
        self._cap = None            # cv2.VideoCapture
        self._current_image = None  # Static image frame

        # Load crowd image for mock
        if os.path.isfile(_CROWD_IMG_PATH):
            self._crowd_img = cv2.imread(_CROWD_IMG_PATH)
        else:
            self._crowd_img = None

    # ── Source switching ──
    def set_video_file(self, path: str):
        with self._lock:
            self._release()
            self._cap = cv2.VideoCapture(path)
            if self._cap.isOpened():
                self._source = "file"
            else:
                self._cap = None
                self._source = "mock"

    def set_webcam(self, index: int = 0):
        with self._lock:
            self._release()
            self._cap = cv2.VideoCapture(index)
            if self._cap.isOpened():
                self._source = "webcam"
            else:
                self._cap = None
                self._source = "mock"

    def set_rtsp(self, url: str):
        """Connect to an RTSP or HTTP stream URL."""
        with self._lock:
            self._release()
            self._cap = cv2.VideoCapture(url)
            if self._cap.isOpened():
                self._source = "rtsp"
            else:
                self._cap = None
                self._source = "mock"

    def set_mock(self):
        with self._lock:
            self._release()
            self._source = "mock"

    def set_image(self, frame: np.ndarray):
        """Set a static image as the video source."""
        with self._lock:
            self._release()
            self._current_image = frame
            self._source = "image"

    def _release(self):
        if self._cap is not None:
            self._cap.release()
            self._cap = None

    @property
    def source_type(self) -> str:
        return self._source

    # ── Frame retrieval ──
    def get_frame(self) -> np.ndarray:
        with self._lock:
            self._frame_count += 1

            if self._source in ("file", "webcam", "rtsp") and self._cap is not None:
                ret, frame = self._cap.read()
                if ret:
                    return frame
                # Video file ended — loop (only for file source)
                if self._source == "file":
                    self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = self._cap.read()
                    if ret:
                        return frame
                # RTSP / webcam ended — fall through to mock
                self._release()
                self._source = "mock"

            if self._source == "image" and self._current_image is not None:
                return self._current_image.copy()

            return self._generate_mock_frame()

    def _generate_mock_frame(self) -> np.ndarray:
        if self._crowd_img is not None:
            return self._pan_crowd_image()
        return self._generate_synthetic()

    def _pan_crowd_image(self) -> np.ndarray:
        """Create a slow panning effect over the crowd photo."""
        h, w = self._crowd_img.shape[:2]
        pan_x = int(w * 0.08 * np.sin(self._frame_count / 40.0))
        pan_y = int(h * 0.06 * np.cos(self._frame_count / 50.0))

        cw, ch = int(w * 0.82), int(h * 0.82)
        cx, cy = w // 2 + pan_x, h // 2 + pan_y

        x1 = max(0, cx - cw // 2)
        y1 = max(0, cy - ch // 2)
        x2 = min(w, x1 + cw)
        y2 = min(h, y1 + ch)

        crop = self._crowd_img[y1:y2, x1:x2]
        frame = cv2.resize(crop, (w, h))

        cv2.putText(frame, f"CAM-01  |  Frame {self._frame_count}",
                    (12, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        return frame

    def _generate_synthetic(self) -> np.ndarray:
        """Last-resort: plain gray frame with timestamp."""
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 45
        cv2.putText(frame, "No video source — upload a video or add crowd.jpg",
                    (20, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (100, 100, 100), 1)
        cv2.putText(frame, f"Frame {self._frame_count}",
                    (20, 270), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (80, 80, 80), 1)
        return frame


video_feed = VideoFeedManager()
