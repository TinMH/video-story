import type { Node } from '@xyflow/react';

interface NodeDetailPanelProps {
  selectedNode: Node | null;
  onDataChange: (id: string, key: string, value: any) => void;
  onDeleteNode: (id: string) => void;
}

const VOICES = [
  { id: 'adam-us', name: 'Adam (US - Confident)' },
  { id: 'bella-cyber', name: 'Bella (UK - Cyberpunk)' },
  { id: 'serena-edu', name: 'Serena (US - Friendly)' },
  { id: 'rachel-energetic', name: 'Rachel (US - Energetic)' },
  { id: 'marcus-deep', name: 'Marcus (US - Deep)' },
];

const STYLES = [
  { id: 'cinematic-studio', name: 'Cinematic Studio' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon' },
  { id: '3d-product-render', name: '3D Product Render' },
  { id: 'anime-illustration', name: 'Anime Illustration' },
  { id: 'whiteboard-sketch', name: 'Whiteboard Sketch' },
];

const MOVEMENTS = [
  { id: 'zoom-in-slow', name: 'Slow Zoom In' },
  { id: 'zoom-out-slow', name: 'Slow Zoom Out' },
  { id: 'pan-left-slow', name: 'Slow Pan Left' },
  { id: 'pan-right-fast', name: 'Fast Pan Right' },
  { id: 'orbit-circular', name: 'Circular Orbit' },
];

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3'];

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  selectedNode,
  onDataChange,
  onDeleteNode,
}) => {
  if (!selectedNode) {
    return (
      <aside className="node-detail-panel empty">
        <div className="empty-panel-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 17v-5M12 17V9M15 17v-3" />
          </svg>
          <h4>No Node Selected</h4>
          <p>Click on any workflow node in the canvas to adjust its generative settings and parameters.</p>
        </div>
      </aside>
    );
  }

  const { id, type } = selectedNode;
  const data = selectedNode.data as any;

  const renderScriptControls = () => (
    <>
      <div className="form-group">
        <label htmlFor="prompt-input">AI Storyboard Prompt</label>
        <textarea
          id="prompt-input"
          value={data.prompt || ''}
          onChange={(e) => onDataChange(id, 'prompt', e.target.value)}
          placeholder="e.g. Generate an upbeat commercial..."
          rows={5}
        />
      </div>

      <div className="form-group">
        <div className="label-row-val">
          <label htmlFor="temp-input">Temperature (Creativity)</label>
          <span className="node-val-display">{data.temperature ?? 0.7}</span>
        </div>
        <input
          id="temp-input"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={data.temperature ?? 0.7}
          onChange={(e) => onDataChange(id, 'temperature', parseFloat(e.target.value))}
        />
        <div className="range-hints">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="max-length-input">Maximum Words</label>
        <input
          id="max-length-input"
          type="number"
          min="10"
          max="1000"
          value={data.maxLength ?? 100}
          onChange={(e) => onDataChange(id, 'maxLength', parseInt(e.target.value, 10))}
        />
      </div>
    </>
  );

  const renderVoiceControls = () => (
    <>
      <div className="form-group">
        <label htmlFor="voice-select">Speaker Voice</label>
        <select
          id="voice-select"
          value={data.voiceId || 'adam-us'}
          onChange={(e) => {
            const voice = VOICES.find((v) => v.id === e.target.value);
            if (voice) {
              onDataChange(id, 'voiceId', voice.id);
              onDataChange(id, 'voiceName', voice.name);
            }
          }}
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <div className="label-row-val">
          <label htmlFor="speed-input">Speaking Pace</label>
          <span className="node-val-display">{data.speed ?? 1.0}x</span>
        </div>
        <input
          id="speed-input"
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={data.speed ?? 1.0}
          onChange={(e) => onDataChange(id, 'speed', parseFloat(e.target.value))}
        />
      </div>
    </>
  );

  const renderImageControls = () => (
    <>
      <div className="form-group">
        <label htmlFor="image-style-select">Image Preset Style</label>
        <select
          id="image-style-select"
          value={data.style || 'cinematic-studio'}
          onChange={(e) => onDataChange(id, 'style', e.target.value)}
        >
          {STYLES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Aspect Ratio</label>
        <div className="aspect-ratio-selector">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio}
              type="button"
              className={`ratio-btn ${data.aspectRatio === ratio ? 'active' : ''}`}
              onClick={() => onDataChange(id, 'aspectRatio', ratio)}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="img-prompt-template">Visual Prompt Design</label>
        <textarea
          id="img-prompt-template"
          value={data.promptTemplate || ''}
          onChange={(e) => onDataChange(id, 'promptTemplate', e.target.value)}
          placeholder="Outline the elements: camera lens, details, mood..."
          rows={4}
        />
      </div>
    </>
  );

  const renderVideoControls = () => (
    <>
      <div className="form-group">
        <label htmlFor="camera-movement-select">Camera Movement</label>
        <select
          id="camera-movement-select"
          value={data.cameraMovement || 'zoom-in-slow'}
          onChange={(e) => onDataChange(id, 'cameraMovement', e.target.value)}
        >
          {MOVEMENTS.map((mov) => (
            <option key={mov.id} value={mov.id}>
              {mov.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <div className="label-row-val">
          <label htmlFor="motion-intensity-input">Motion Amplitude</label>
          <span className="node-val-display">{data.motionIntensity ?? 5}</span>
        </div>
        <input
          id="motion-intensity-input"
          type="range"
          min="1"
          max="10"
          step="1"
          value={data.motionIntensity ?? 5}
          onChange={(e) => onDataChange(id, 'motionIntensity', parseInt(e.target.value, 10))}
        />
        <div className="range-hints">
          <span>Subtle</span>
          <span>Dynamic</span>
        </div>
      </div>

      <div className="form-group">
        <label>Target Frame Rate</label>
        <div className="aspect-ratio-selector">
          {[24, 30, 60].map((fpsVal) => (
            <button
              key={fpsVal}
              type="button"
              className={`ratio-btn ${data.fps === fpsVal ? 'active' : ''}`}
              onClick={() => onDataChange(id, 'fps', fpsVal)}
            >
              {fpsVal} FPS
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderCompilerControls = () => (
    <>
      <div className="form-group">
        <label htmlFor="resolution-select">Output Format / Resolution</label>
        <select
          id="resolution-select"
          value={data.resolution || '1080p'}
          onChange={(e) => onDataChange(id, 'resolution', e.target.value)}
        >
          <option value="1080p">1080p HD (Landscape)</option>
          <option value="720p">720p SD</option>
          <option value="4k">4K UHD Cinematic</option>
          <option value="9:16-vertical">9:16 vertical (Shorts/Tiktok)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="subtitle-select">Subtitle Theme</label>
        <select
          id="subtitle-select"
          value={data.subtitleStyle || 'impact-yellow'}
          onChange={(e) => onDataChange(id, 'subtitleStyle', e.target.value)}
        >
          <option value="impact-yellow">Impact Yellow</option>
          <option value="neon-border">Neon Cyber Border</option>
          <option value="clean-white">Clean Sans White</option>
          <option value="minimalist-shadow">Minimalist Dark Shadow</option>
        </select>
      </div>

      <div className="form-group">
        <div className="label-row-val">
          <label htmlFor="music-vol-input">Music Volume Mixing</label>
          <span className="node-val-display">{Math.round((data.musicVolume ?? 0.15) * 100)}%</span>
        </div>
        <input
          id="music-vol-input"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={data.musicVolume ?? 0.15}
          onChange={(e) => onDataChange(id, 'musicVolume', parseFloat(e.target.value))}
        />
      </div>
    </>
  );

  const getNodeTypeName = () => {
    switch (type) {
      case 'scriptNode':
        return 'Script Generator';
      case 'voiceNode':
        return 'Voiceover Synth';
      case 'imageNode':
        return 'AI Image Generator';
      case 'videoNode':
        return 'AI Video Renderer';
      case 'compilerNode':
        return 'Video Compiler';
      default:
        return 'Custom Block';
    }
  };

  const getNodeColorClass = () => {
    switch (type) {
      case 'scriptNode': return 'script';
      case 'voiceNode': return 'voice';
      case 'imageNode': return 'image';
      case 'videoNode': return 'video';
      case 'compilerNode': return 'compiler';
      default: return '';
    }
  };

  return (
    <aside className="node-detail-panel active">
      <div className="panel-header">
        <div className="header-top-row">
          <span className={`node-type-indicator ${getNodeColorClass()}`}>
            {getNodeTypeName()}
          </span>
          <span className="node-id-tag">ID: {id.replace('node-', '')}</span>
        </div>
        <h3>Configuration</h3>
      </div>

      <div className="panel-body">
        {type === 'scriptNode' && renderScriptControls()}
        {type === 'voiceNode' && renderVoiceControls()}
        {type === 'imageNode' && renderImageControls()}
        {type === 'videoNode' && renderVideoControls()}
        {type === 'compilerNode' && renderCompilerControls()}
      </div>

      <div className="panel-footer">
        <button className="delete-node-btn" onClick={() => onDeleteNode(id)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  );
};
