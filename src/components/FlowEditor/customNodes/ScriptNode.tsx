import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface ScriptNodeProps {
  id: string;
  data: {
    title: string;
    prompt: string;
    temperature: number;
    maxLength: number;
    status: 'idle' | 'running' | 'success' | 'error';
    onDataChange?: (id: string, key: string, value: any) => void;
  };
  selected?: boolean;
}

export const ScriptNode: React.FC<ScriptNodeProps> = ({ id, data, selected }) => {
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.onDataChange?.(id, 'prompt', e.target.value);
  };

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onDataChange?.(id, 'temperature', parseFloat(e.target.value));
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onDataChange?.(id, 'maxLength', parseInt(e.target.value, 10));
  };

  return (
    <div className={`custom-flow-node script-node ${selected ? 'node-selected' : ''} status-${data.status}`}>
      {/* Node Header */}
      <div className="node-header">
        <div className="node-header-title">
          <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>{data.title || 'AI Script'}</span>
        </div>
        <div className={`node-status-glow ${data.status}`}></div>
      </div>

      {/* Node Body */}
      <div className="node-body nodrag">
        <div className="input-group">
          <label>AI Prompt / Script Idea</label>
          <textarea
            value={data.prompt}
            onChange={handlePromptChange}
            placeholder="Describe your video script idea here..."
            rows={3}
          />
        </div>

        <div className="node-row">
          <div className="input-group half">
            <label>Creativity ({data.temperature})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={data.temperature}
              onChange={handleTempChange}
            />
          </div>
          <div className="input-group half">
            <label>Max Words</label>
            <input
              type="number"
              min="10"
              max="1000"
              value={data.maxLength}
              onChange={handleLengthChange}
            />
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle type="source" position={Position.Right} id="output" className="node-handle source-handle" />
    </div>
  );
};
