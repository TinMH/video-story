import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface VideoNodeProps {
  id: string;
  data: {
    title: string;
    motionIntensity: number;
    cameraMovement: string;
    fps: number;
    status: 'idle' | 'running' | 'success' | 'error';
    onDataChange?: (id: string, key: string, value: any) => void;
  };
  selected?: boolean;
}

const MOVEMENTS = [
  { id: 'zoom-in-slow', name: 'Slow Zoom In' },
  { id: 'zoom-out-slow', name: 'Slow Zoom Out' },
  { id: 'pan-left-slow', name: 'Slow Pan Left' },
  { id: 'pan-right-fast', name: 'Fast Pan Right' },
  { id: 'orbit-circular', name: 'Circular Orbit' },
];

export const VideoNode: React.FC<VideoNodeProps> = ({ id, data, selected }) => {
  const handleMovementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onDataChange?.(id, 'cameraMovement', e.target.value);
  };

  const handleMotionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onDataChange?.(id, 'motionIntensity', parseInt(e.target.value, 10));
  };

  const handleFpsChange = (fps: number) => {
    data.onDataChange?.(id, 'fps', fps);
  };

  return (
    <div className={`custom-flow-node video-node ${selected ? 'node-selected' : ''} status-${data.status}`}>
      {/* Target Handle from Image */}
      <Handle type="target" position={Position.Left} id="input-image" className="node-handle target-handle" />

      {/* Node Header */}
      <div className="node-header">
        <div className="node-header-title">
          <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span>{data.title || 'AI Video Renderer'}</span>
        </div>
        <div className={`node-status-glow ${data.status}`}></div>
      </div>

      {/* Node Body */}
      <div className="node-body nodrag">
        <div className="input-group">
          <label>Camera Animation</label>
          <select value={data.cameraMovement} onChange={handleMovementChange}>
            {MOVEMENTS.map((mov) => (
              <option key={mov.id} value={mov.id}>
                {mov.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="label-row-val">
            <label>Motion Intensity</label>
            <span className="node-val-display">{data.motionIntensity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={data.motionIntensity}
            onChange={handleMotionChange}
          />
        </div>

        <div className="input-group">
          <label>Export Frame Rate</label>
          <div className="aspect-ratio-selector">
            {[24, 30, 60].map((fps) => (
              <button
                key={fps}
                type="button"
                className={`ratio-btn ${data.fps === fps ? 'active' : ''}`}
                onClick={() => handleFpsChange(fps)}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </div>

        {/* Video Animation Status */}
        {data.status === 'running' && (
          <div className="node-preview-loading">
            <div className="loading-shimmer"></div>
            <div className="loading-spinner"></div>
            <span>Rendering video layers...</span>
          </div>
        )}

        {data.status === 'success' && (
          <div className="node-preview-video">
            <div className="video-animation-box">
              {/* Simulate camera panning with standard CSS zooms */}
              <div className={`simulated-video-preview ${data.cameraMovement}`}></div>
              <div className="play-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
            <div className="preview-label">MP4 Segment ready</div>
          </div>
        )}
      </div>

      {/* Source Handle to Compiler */}
      <Handle type="source" position={Position.Right} id="output" className="node-handle source-handle" />
    </div>
  );
};
