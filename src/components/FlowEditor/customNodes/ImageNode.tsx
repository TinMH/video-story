import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface ImageNodeProps {
  id: string;
  data: {
    title: string;
    style: string;
    aspectRatio: string;
    promptTemplate: string;
    status: 'idle' | 'running' | 'success' | 'error';
    onDataChange?: (id: string, key: string, value: any) => void;
  };
  selected?: boolean;
}

const STYLES = [
  { id: 'cinematic-studio', name: 'Cinematic Studio' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon' },
  { id: '3d-product-render', name: '3D Product Render' },
  { id: 'anime-illustration', name: 'Anime Illustration' },
  { id: 'whiteboard-sketch', name: 'Whiteboard Sketch' },
];

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3'];

export const ImageNode: React.FC<ImageNodeProps> = ({ id, data, selected }) => {
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onDataChange?.(id, 'style', e.target.value);
  };

  const handleRatioChange = (ratio: string) => {
    data.onDataChange?.(id, 'aspectRatio', ratio);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.onDataChange?.(id, 'promptTemplate', e.target.value);
  };

  // Mock generated images based on selected style
  const getMockImage = () => {
    switch (data.style) {
      case 'cyberpunk-neon':
        return 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=400&auto=format&fit=crop&q=80';
      case '3d-product-render':
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
      case 'anime-illustration':
        return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80';
      case 'whiteboard-sketch':
        return 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&auto=format&fit=crop&q=80';
      case 'cinematic-studio':
      default:
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
    }
  };

  return (
    <div className={`custom-flow-node image-node ${selected ? 'node-selected' : ''} status-${data.status}`}>
      {/* Target Handle from Script */}
      <Handle type="target" position={Position.Left} id="input-script" className="node-handle target-handle" />

      {/* Node Header */}
      <div className="node-header">
        <div className="node-header-title">
          <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span>{data.title || 'AI Image Gen'}</span>
        </div>
        <div className={`node-status-glow ${data.status}`}></div>
      </div>

      {/* Node Body */}
      <div className="node-body nodrag">
        <div className="input-group">
          <label>Visual Style</label>
          <select value={data.style} onChange={handleStyleChange}>
            {STYLES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Aspect Ratio</label>
          <div className="aspect-ratio-selector">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                className={`ratio-btn ${data.aspectRatio === ratio ? 'active' : ''}`}
                onClick={() => handleRatioChange(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>Prompt Template</label>
          <textarea
            value={data.promptTemplate}
            onChange={handleTemplateChange}
            placeholder="Visual prompts. Use variables if needed..."
            rows={2}
          />
        </div>

        {/* Dynamic Image Generator Preview */}
        {data.status === 'running' && (
          <div className="node-preview-loading">
            <div className="loading-shimmer"></div>
            <div className="loading-spinner"></div>
            <span>Generating image...</span>
          </div>
        )}

        {data.status === 'success' && (
          <div className="node-preview-image">
            <img src={getMockImage()} alt="AI Generated Frame" />
            <div className="preview-label">Frame 1 Generated</div>
          </div>
        )}
      </div>

      {/* Source Handle to Video */}
      <Handle type="source" position={Position.Right} id="output" className="node-handle source-handle" />
    </div>
  );
};
