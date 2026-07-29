import React, { useRef, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import type {
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ScriptNode } from './customNodes/ScriptNode';
import { VoiceNode } from './customNodes/VoiceNode';
import { ImageNode } from './customNodes/ImageNode';
import { VideoNode } from './customNodes/VideoNode';
import { CompilerNode } from './customNodes/CompilerNode';

interface MenuItem {
  type: string;
  title: string;
  desc: string;
  category: 'INPUTS' | 'GENERATION' | 'COMPILATION';
  icon: React.ReactNode;
}

const MENU_ITEMS: MenuItem[] = [
  {
    type: 'scriptNode',
    title: 'Text / Script',
    desc: 'Type a prompt / story script idea',
    category: 'INPUTS',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M17 3a2.82 2.82 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      </svg>
    )
  },
  {
    type: 'voiceNode',
    title: 'Audio Voiceover',
    desc: 'Synthesize speech from scripts',
    category: 'GENERATION',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      </svg>
    )
  },
  {
    type: 'imageNode',
    title: 'AI Image Generator',
    desc: 'Provide or generate an image asset',
    category: 'GENERATION',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    )
  },
  {
    type: 'videoNode',
    title: 'AI Video Renderer',
    desc: 'Generate camera motion video clips',
    category: 'GENERATION',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  },
  {
    type: 'compilerNode',
    title: 'Video Compiler',
    desc: 'Compile final video overlays & audios',
    category: 'COMPILATION',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    )
  }
];

// Map custom types to their components
const nodeTypes = {
  scriptNode: ScriptNode,
  voiceNode: VoiceNode,
  imageNode: ImageNode,
  videoNode: VideoNode,
  compilerNode: CompilerNode,
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onSelectNode: (node: Node | null) => void;
  onDropNode: (type: string, position: { x: number; y: number }) => void;
  isSimulating: boolean;
  onNodeDragStop?: () => void;
  onNodesDelete?: (nodes: Node[]) => void;
  onEdgesDelete?: (edges: Edge[]) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onDropNode,
  isSimulating,
  onNodeDragStop,
  onNodesDelete,
  onEdgesDelete,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    flowX: number;
    flowY: number;
  } | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    instance.fitView({ padding: 0.1 });
  }, []);

  // Handle selecting nodes
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onSelectNode(node);
    if (!isPinned) setContextMenu(null);
  }, [onSelectNode, isPinned]);

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
    if (!isPinned) setContextMenu(null);
  }, [onSelectNode, isPinned]);

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      
      let x = event.clientX - bounds.left;
      let y = event.clientY - bounds.top;

      // Adjust positioning to prevent overflow
      if (x + 280 > bounds.width) {
        x = bounds.width - 290;
      }
      if (y + 360 > bounds.height) {
        y = bounds.height - 370;
      }
      x = Math.max(10, x);
      y = Math.max(10, y);

      const flowPos = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setContextMenu({
        x,
        y,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
      setMenuSearchQuery('');
    },
    [reactFlowInstance]
  );

  const handleSelectMenuItem = (type: string) => {
    if (!contextMenu) return;
    onDropNode(type, { x: contextMenu.flowX, y: contextMenu.flowY });
    if (!isPinned) {
      setContextMenu(null);
    }
  };

  // Drag and drop event handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance.current) return;
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // calculate position relative to canvas
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onDropNode(type, position);
    },
    [onDropNode]
  );

  return (
    <div className="flow-canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        fitView
        selectNodesOnDrag={false}
        nodesConnectable={!isSimulating}
        nodesDraggable={!isSimulating}
        elementsSelectable={!isSimulating}
      >
        <Background
          id="1"
          gap={16}
          color="var(--border)"
          variant={BackgroundVariant.Dots}
          style={{ opacity: 0.7 }}
        />
        <Controls showInteractive={false} className="canvas-controls" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'scriptNode': return '#a855f7';
              case 'voiceNode': return '#3b82f6';
              case 'imageNode': return '#10b981';
              case 'videoNode': return '#f59e0b';
              case 'compilerNode': return '#ec4899';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(8, 7, 16, 0.6)"
          className="canvas-minimap"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        />
        
        {isSimulating && (
          <Panel position="top-center" className="simulating-panel-indicator">
            <span className="simulating-spinner"></span>
            <span>Workflow Simulation Mode Active</span>
          </Panel>
        )}
      </ReactFlow>

      {contextMenu && (
        <div
          className="canvas-context-menu"
          style={{
            position: 'absolute',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 1000,
          }}
        >
          <div className="menu-header">
            <div className="menu-search-wrapper">
              <input
                type="text"
                autoFocus
                placeholder="Search nodes..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
              />
            </div>
            <div className="menu-header-actions">
              <button
                className={`menu-pin-btn ${isPinned ? 'active' : ''}`}
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? 'Unpin menu' : 'Pin menu'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 21v-8M9 16h6" strokeLinecap="round" />
                  <path d="M21 12H3" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="3" />
                </svg>
              </button>
              <button
                className="menu-close-btn"
                onClick={() => setContextMenu(null)}
                title="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="menu-body-list">
            {(['INPUTS', 'GENERATION', 'COMPILATION'] as const).map((cat) => {
              const items = MENU_ITEMS.filter(
                (item) =>
                  item.category === cat &&
                  (item.title.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                    item.desc.toLowerCase().includes(menuSearchQuery.toLowerCase()))
              );

              if (items.length === 0) return null;

              return (
                <div key={cat} className="menu-cat-group">
                  <div className="menu-cat-title">{cat}</div>
                  {items.map((item) => (
                    <div
                      key={item.type}
                      className="menu-item-row"
                      onClick={() => handleSelectMenuItem(item.type)}
                    >
                      <div className={`menu-item-icon-box ${item.type}`}>
                        {item.icon}
                      </div>
                      <div className="menu-item-info">
                        <div className="menu-item-title">{item.title}</div>
                        <div className="menu-item-desc">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            
            {MENU_ITEMS.filter(
              (item) =>
                item.title.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                item.desc.toLowerCase().includes(menuSearchQuery.toLowerCase())
            ).length === 0 && (
              <div className="menu-empty-state">No matching nodes found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
