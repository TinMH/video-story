import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface VoiceNodeProps {
  id: string;
  data: {
    title: string;
    voiceId: string;
    voiceName: string;
    speed: number;
    pitch: number;
    status: 'idle' | 'running' | 'success' | 'error';
    onDataChange?: (id: string, key: string, value: any) => void;
  };
  selected?: boolean;
}

const VOICES = [
  { id: 'adam-us', name: 'Adam (US - Confident)' },
  { id: 'bella-cyber', name: 'Bella (UK - Cyberpunk)' },
  { id: 'serena-edu', name: 'Serena (US - Friendly)' },
  { id: 'rachel-energetic', name: 'Rachel (US - Energetic)' },
  { id: 'marcus-deep', name: 'Marcus (US - Deep)' },
];

export const VoiceNode: React.FC<VoiceNodeProps> = ({ id, data, selected }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = VOICES.find(v => v.id === e.target.value);
    if (selectedVoice) {
      data.onDataChange?.(id, 'voiceId', selectedVoice.id);
      data.onDataChange?.(id, 'voiceName', selectedVoice.name);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onDataChange?.(id, 'speed', parseFloat(e.target.value));
  };

  return (
    <div className={`custom-flow-node voice-node ${selected ? 'node-selected' : ''} status-${data.status}`}>
      {/* Target Handle from Script */}
      <Handle type="target" position={Position.Left} id="input-script" className="node-handle target-handle" />

      {/* Node Header */}
      <div className="node-header">
        <div className="node-header-title">
          <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
          </svg>
          <span>{data.title || 'Voice Synthesis'}</span>
        </div>
        <div className={`node-status-glow ${data.status}`}></div>
      </div>

      {/* Node Body */}
      <div className="node-body nodrag">
        <div className="input-group">
          <label>AI Speaker Profile</label>
          <select value={data.voiceId} onChange={handleVoiceChange}>
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="label-row-val">
            <label>Speech Speed</label>
            <span className="node-val-display">{data.speed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={data.speed}
            onChange={handleSpeedChange}
          />
        </div>

        {/* Audio Player Simulation if Success */}
        {data.status === 'success' && (
          <div className="audio-wave-player">
            <button className="audio-play-btn" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="4" height="16" rx="1" />
                  <rect x="16" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <div className={`mini-audio-wave ${isPlaying ? 'playing' : ''}`}>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
            <span className="audio-duration">0:15</span>
          </div>
        )}
      </div>

      {/* Source Handle to Compiler */}
      <Handle type="source" position={Position.Right} id="output" className="node-handle source-handle" />
    </div>
  );
};
