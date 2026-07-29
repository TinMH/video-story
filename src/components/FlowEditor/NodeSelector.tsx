import React from 'react';

interface NodeSelectorProps {
  onAddNode: (type: string) => void;
}

interface NodeDefinition {
  type: string;
  title: string;
  description: string;
  category: 'Input' | 'Generation' | 'Compilation';
  icon: React.ReactNode;
}

const NODES_LIST: NodeDefinition[] = [
  {
    type: 'scriptNode',
    title: 'AI Script Generator',
    description: 'Generates scripts, hooks, and narratives based on prompts.',
    category: 'Input',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    type: 'voiceNode',
    title: 'Voiceover Synthesis',
    description: 'Converts generated scripts to high-quality spoken audio.',
    category: 'Generation',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    type: 'imageNode',
    title: 'AI Image Generator',
    description: 'Creates photorealistic frames or art assets from descriptions.',
    category: 'Generation',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    type: 'videoNode',
    title: 'AI Video Renderer',
    description: 'Animates visual frames into smooth camera-panning clips.',
    category: 'Generation',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    type: 'compilerNode',
    title: 'Video Compiler',
    description: 'Combines video b-rolls, speech tracks, and dynamic captions.',
    category: 'Compilation',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    ),
  },
];

export const NodeSelector: React.FC<NodeSelectorProps> = ({ onAddNode }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = ['Input', 'Generation', 'Compilation'] as const;

  return (
    <aside className="node-selector-panel">
      <div className="panel-header">
        <h3>Node Library</h3>
        <p>Drag nodes to canvas or click to add directly.</p>
      </div>

      <div className="node-selector-scroll">
        {categories.map((category) => (
          <div key={category} className="node-category-group">
            <h4 className="category-title">{category}</h4>
            <div className="nodes-buttons-list">
              {NODES_LIST.filter((n) => n.category === category).map((node) => (
                <div
                  key={node.type}
                  className="draggable-node-card"
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  onClick={() => onAddNode(node.type)}
                  title="Drag this node into canvas"
                >
                  <div className={`node-card-icon ${node.type}`}>
                    {node.icon}
                  </div>
                  <div className="node-card-info">
                    <span className="node-card-title">{node.title}</span>
                    <span className="node-card-description">{node.description}</span>
                  </div>
                  <div className="add-node-plus-btn" title="Add directly">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="panel-footer-tip">
        <div className="tip-badge">TIP</div>
        <p>Connect source nodes (right dot) to destination inputs (left dot) to establish your workflow sequence.</p>
      </div>
    </aside>
  );
};
