import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CompilerNodeProps {
  id: string;
  data: {
    title: string;
    resolution: string;
    subtitleStyle: string;
    musicVolume: number;
    status: 'idle' | 'running' | 'success' | 'error';
    onDataChange?: (id: string, key: string, value: any) => void;
  };
  selected?: boolean;
}

const SUBTITLE_STYLES = [
  { id: 'impact-yellow', name: 'Impact Yellow' },
  { id: 'neon-border', name: 'Neon Cyber Border' },
  { id: 'clean-white', name: 'Clean Sans White' },
  { id: 'minimalist-shadow', name: 'Minimalist Dark Shadow' },
];

export const CompilerNode: React.FC<CompilerNodeProps> = ({ id, data, selected }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onDataChange?.(id, 'resolution', e.target.value);
  };

  const handleSubStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onDataChange?.(id, 'subtitleStyle', e.target.value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onDataChange?.(id, 'musicVolume', parseFloat(e.target.value));
  };

  return (
    <div className={`custom-flow-node compiler-node ${selected ? 'node-selected' : ''} status-${data.status}`}>
      {/* Target handle 1: Audio/Voice (Top Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-voice"
        style={{ top: '35%' }}
        className="node-handle target-handle"
      />

      {/* Target handle 2: Video B-roll (Bottom Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-video"
        style={{ top: '65%' }}
        className="node-handle target-handle"
      />

      {/* Node Header */}
      <div className="node-header">
        <div className="node-header-title">
          <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
          <span>{data.title || 'Video Compiler'}</span>
        </div>
        <div className={`node-status-glow ${data.status}`}></div>
      </div>

      {/* Node Body */}
      <div className="node-body nodrag">
        <div className="node-row">
          <div className="input-group half">
            <label>Format</label>
            <select value={data.resolution} onChange={handleResolutionChange}>
              <option value="1080p">1080p HD</option>
              <option value="720p">720p SD</option>
              <option value="4k">4K UltraHD</option>
              <option value="9:16-vertical">9:16 vertical</option>
            </select>
          </div>

          <div className="input-group half">
            <label>Subtitle Style</label>
            <select value={data.subtitleStyle} onChange={handleSubStyleChange}>
              {SUBTITLE_STYLES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <div className="label-row-val">
            <label>Background Music Volume</label>
            <span className="node-val-display">{Math.round(data.musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={data.musicVolume}
            onChange={handleVolumeChange}
          />
        </div>

        {/* Compile Status & Preview */}
        {data.status === 'running' && (
          <div className="node-preview-loading">
            <div className="loading-shimmer"></div>
            <div className="loading-spinner"></div>
            <span>Stitching media tracks...</span>
          </div>
        )}

        {data.status === 'success' && (
          <div className="compiled-video-preview-card">
            <div className="compiled-video-box">
              {/* Looping visual scene */}
              <div className={`simulated-final-output ${isPlaying ? 'playing' : ''}`}>
                {/* Subtitle simulation */}
                <div className={`subtitle-overlay ${data.subtitleStyle}`}>
                  {isPlaying ? '“Experience premium sound with AuraSound headphones.”' : '“Experience premium sound...”'}
                </div>
              </div>
              
              <button className="final-play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="compiled-details-row">
              <span className="compiled-badge">MP4 OK</span>
              <a href="#" className="compiled-download-link" onClick={(e) => { e.preventDefault(); alert("Mock download started!"); }}>
                Download video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
