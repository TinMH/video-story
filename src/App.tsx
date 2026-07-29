import { useState, useEffect, useCallback } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  Connection,
} from '@xyflow/react';

import { Sidebar } from './components/Sidebar';
import { FlowDashboard } from './components/FlowDashboard';
import { FlowHeader } from './components/FlowEditor/FlowHeader';
import { NodeSelector } from './components/FlowEditor/NodeSelector';
import { FlowCanvas } from './components/FlowEditor/FlowCanvas';
import { NodeDetailPanel } from './components/FlowEditor/NodeDetailPanel';
import type { Flow } from './data/mockFlows';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('flows');
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [flows, setFlows] = useState<Flow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  // Load workflows from database on component mount
  useEffect(() => {
    fetch('/api/flows')
      .then((res) => res.json())
      .then((data) => setFlows(data))
      .catch((err) => console.error('Error fetching workflows from database:', err));
  }, []);

  // xyflow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Undo/Redo states history
  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const takeSnapshotOfState = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setPast((prev) => {
      const snapshot = {
        nodes: currentNodes.map(({ data, ...n }) => {
          const { onDataChange, ...restData } = data as any;
          return { ...n, data: restData };
        }),
        edges: currentEdges.map((e) => ({ ...e })),
      };
      const newPast = [...prev, snapshot];
      if (newPast.length > 50) {
        newPast.shift();
      }
      return newPast;
    });
    setFuture([]);
  }, []);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState('');
  const [simulationTimers, setSimulationTimers] = useState<any[]>([]);

  // Apply dark mode class to root
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDarkMode]);


  // Synchronize canvas node selections
  const handleSelectNode = (node: Node | null) => {
    setSelectedNode(node);
  };

  // Select flow and load into canvas
  const handleSelectFlow = (id: string) => {
    const flow = flows.find((f) => f.id === id);
    if (flow) {
      setActiveFlowId(id);
      setPast([]);
      setFuture([]);
      
      // Inject onDataChange callback to each node data structure
      const hydratedNodes = flow.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: 'idle', // Reset statuses on load
          onDataChange: handleNodeDataChange,
        },
      }));

      setNodes(hydratedNodes);
      setEdges(flow.edges.map(edge => ({ ...edge, animated: false })));
      setSelectedNode(null);
      setCurrentView('editor');
    }
  };

  // Handle data updates from within custom nodes or inspector panel
  const handleNodeDataChange = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeId) {
          const updatedNode = {
            ...n,
            data: {
              ...n.data,
              [key]: value,
            },
          };
          // Sync selected node inspector in real-time
          setSelectedNode((currSelected) => 
            currSelected && currSelected.id === nodeId ? updatedNode : currSelected
          );
          return updatedNode;
        }
        return n;
      })
    );
  }, [setNodes]);

  // Undo/Redo logic
  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previous = prevPast[prevPast.length - 1];
      const remainingPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [
        ...prevFuture,
        {
          nodes: nodes.map(({ data, ...n }) => {
            const { onDataChange, ...restData } = data as any;
            return { ...n, data: restData };
          }),
          edges: edges.map((e) => ({ ...e })),
        },
      ]);

      const restoredNodes = previous.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDataChange: handleNodeDataChange,
        },
      }));

      setNodes(restoredNodes);
      setEdges(previous.edges);

      return remainingPast;
    });
  }, [nodes, edges, handleNodeDataChange, setNodes, setEdges]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const next = prevFuture[prevFuture.length - 1];
      const remainingFuture = prevFuture.slice(0, prevFuture.length - 1);

      setPast((prevPast) => [
        ...prevPast,
        {
          nodes: nodes.map(({ data, ...n }) => {
            const { onDataChange, ...restData } = data as any;
            return { ...n, data: restData };
          }),
          edges: edges.map((e) => ({ ...e })),
        },
      ]);

      const restoredNodes = next.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDataChange: handleNodeDataChange,
        },
      }));

      setNodes(restoredNodes);
      setEdges(next.edges);

      return remainingFuture;
    });
  }, [nodes, edges, handleNodeDataChange, setNodes, setEdges]);

  const handleNodeDragStop = useCallback(() => {
    takeSnapshotOfState(nodes, edges);
  }, [nodes, edges, takeSnapshotOfState]);

  const handleNodesDelete = useCallback(() => {
    takeSnapshotOfState(nodes, edges);
  }, [nodes, edges, takeSnapshotOfState]);

  const handleEdgesDelete = useCallback(() => {
    takeSnapshotOfState(nodes, edges);
  }, [nodes, edges, takeSnapshotOfState]);

  // Keyboard Shortcuts: Ctrl+A, Ctrl+C, Ctrl+V, Delete/Backspace, Ctrl+Z, Ctrl+Y
  useEffect(() => {
    if (currentView !== 'editor') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus element check (don't override input typing)
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as any).contentEditable === 'true')
      ) {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      // Ctrl + Z: Undo
      if (isCtrl && key === 'z') {
        event.preventDefault();
        undo();
      }

      // Ctrl + Y: Redo
      if (isCtrl && key === 'y') {
        event.preventDefault();
        redo();
      }

      // Ctrl + A: Select All Nodes
      if (isCtrl && key === 'a') {
        event.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
      }

      // Ctrl + C: Copy Selected Nodes
      if (isCtrl && key === 'c') {
        const selected = nodes.filter((n) => n.selected);
        if (selected.length > 0) {
          event.preventDefault();
          localStorage.setItem(
            'videostory_copied_nodes',
            JSON.stringify(
              selected.map(({ id, selected: _, ...rest }) => rest)
            )
          );
        }
      }

      // Ctrl + V: Paste Copied Nodes
      if (isCtrl && key === 'v') {
        const copiedStr = localStorage.getItem('videostory_copied_nodes');
        if (copiedStr) {
          event.preventDefault();
          try {
            takeSnapshotOfState(nodes, edges);
            const copied: any[] = JSON.parse(copiedStr);
            const newNodes = copied.map((node, index) => {
              const newId = `node-${Date.now()}-${index}`;
              return {
                ...node,
                id: newId,
                selected: true,
                position: {
                  x: node.position.x + 50,
                  y: node.position.y + 50,
                },
                data: {
                  ...node.data,
                  status: 'idle',
                  onDataChange: handleNodeDataChange,
                },
              };
            });

            // Deselect existing, select new ones
            setNodes((nds) =>
              nds
                .map((n) => ({ ...n, selected: false }))
                .concat(newNodes)
            );
          } catch (err) {
            console.error('Failed to paste nodes:', err);
          }
        }
      }

      // Delete or Backspace: Remove Selected Nodes & Edges
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
        const selectedEdgeIds = edges.filter((e) => e.selected).map((e) => e.id);

        if (selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) {
          event.preventDefault();
          takeSnapshotOfState(nodes, edges);
          setNodes((nds) => nds.filter((n) => !selectedNodeIds.includes(n.id)));
          setEdges((eds) =>
            eds.filter(
              (e) =>
                !selectedEdgeIds.includes(e.id) &&
                !selectedNodeIds.includes(e.source) &&
                !selectedNodeIds.includes(e.target)
            )
          );
          setSelectedNode(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, nodes, edges, setNodes, setEdges, handleNodeDataChange, undo, redo, takeSnapshotOfState]);

  // Connect two nodes
  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshotOfState(nodes, edges);
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: false,
            style: { stroke: 'var(--accent)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: 'var(--accent)',
            },
          },
          eds
        )
      );
    },
    [setEdges, nodes, edges, takeSnapshotOfState]
  );

  // Drop or click to add a new node
  const handleAddNode = (type: string, position?: { x: number; y: number }) => {
    takeSnapshotOfState(nodes, edges);
    const defaultPos = position || { x: 250, y: 150 };
    
    let defaultData: any = {
      title: '',
      status: 'idle',
      onDataChange: handleNodeDataChange,
    };

    switch (type) {
      case 'scriptNode':
        defaultData = {
          ...defaultData,
          title: 'AI Script Generator',
          prompt: 'Write a compelling script about...',
          temperature: 0.7,
          maxLength: 120,
        };
        break;
      case 'voiceNode':
        defaultData = {
          ...defaultData,
          title: 'Voiceover Synthesis',
          voiceId: 'adam-us',
          voiceName: 'Adam (US - Confident)',
          speed: 1.0,
          pitch: 1.0,
        };
        break;
      case 'imageNode':
        defaultData = {
          ...defaultData,
          title: 'AI Image Generator',
          style: 'cinematic-studio',
          aspectRatio: '16:9',
          promptTemplate: 'Cinematic photograph of...',
        };
        break;
      case 'videoNode':
        defaultData = {
          ...defaultData,
          title: 'AI Video Renderer',
          motionIntensity: 5,
          cameraMovement: 'zoom-in-slow',
          fps: 30,
        };
        break;
      case 'compilerNode':
        defaultData = {
          ...defaultData,
          title: 'Video Compiler',
          resolution: '1080p',
          subtitleStyle: 'impact-yellow',
          musicVolume: 0.15,
        };
        break;
    }

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: defaultPos,
      data: defaultData,
    };

    setNodes((nds) => nds.concat(newNode));
  };

  // Remove a node
  const handleDeleteNode = (nodeId: string) => {
    takeSnapshotOfState(nodes, edges);
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  // Create a new flow from template
  const handleCreateFlow = (templateId: string, name: string) => {
    const newId = `flow-${Date.now()}`;
    let initialNodes: Node[] = [];
    let initialEdges: Edge[] = [];

    // Find templates
    if (templateId === 'tpl-1') {
      // AI Video Promo Template
      const baseFlow = flows.find(f => f.id === 'flow-1');
      if (baseFlow) {
        initialNodes = JSON.parse(JSON.stringify(baseFlow.nodes));
        initialEdges = JSON.parse(JSON.stringify(baseFlow.edges));
      }
    } else if (templateId === 'tpl-2') {
      // Reels Template
      const baseFlow = flows.find(f => f.id === 'flow-2');
      if (baseFlow) {
        initialNodes = JSON.parse(JSON.stringify(baseFlow.nodes));
        initialEdges = JSON.parse(JSON.stringify(baseFlow.edges));
      }
    } else if (templateId === 'tpl-3') {
      // Audio Only
      const baseFlow = flows.find(f => f.id === 'flow-3');
      if (baseFlow) {
        initialNodes = JSON.parse(JSON.stringify(baseFlow.nodes));
        initialEdges = JSON.parse(JSON.stringify(baseFlow.edges));
      }
    }

    const newFlow: Flow = {
      id: newId,
      name,
      description: `Generates engaging videos using your connected pipeline tools. Created from template.`,
      status: 'draft',
      runs: 0,
      successRate: 0.0,
      lastUpdated: 'Just now',
      nodes: initialNodes,
      edges: initialEdges,
    };

    fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFlow),
    })
      .then((res) => res.json())
      .then(() => {
        setFlows((prev) => [newFlow, ...prev]);
        handleSelectFlow(newId);
      })
      .catch((err) => console.error('Error saving new flow to database:', err));
  };

  // Delete a flow from the dashboard
  const handleDeleteFlow = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      fetch(`/api/flows/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => {
          setFlows((prev) => prev.filter((f) => f.id !== id));
        })
        .catch((err) => console.error('Error deleting flow from database:', err));
    }
  };

  // Toggle active/draft status
  const handleToggleStatus = (id: string) => {
    const flow = flows.find((f) => f.id === id);
    if (!flow) return;
    const updatedFlow = {
      ...flow,
      status: (flow.status === 'active' ? 'draft' : 'active') as 'active' | 'draft',
    };

    fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFlow),
    })
      .then((res) => res.json())
      .then(() => {
        setFlows((prev) => prev.map((f) => (f.id === id ? updatedFlow : f)));
      })
      .catch((err) => console.error('Error updating status in database:', err));
  };

  // Rename a flow
  const handleRenameFlow = (newName: string) => {
    if (activeFlowId) {
      const flow = flows.find((f) => f.id === activeFlowId);
      if (!flow) return;
      const updatedFlow = {
        ...flow,
        name: newName,
      };

      fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFlow),
      })
        .then((res) => res.json())
        .then(() => {
          setFlows((prev) => prev.map((f) => (f.id === activeFlowId ? updatedFlow : f)));
        })
        .catch((err) => console.error('Error renaming flow in database:', err));
    }
  };

  // Save changes
  const handleSavePipeline = () => {
    if (activeFlowId) {
      const flow = flows.find((f) => f.id === activeFlowId);
      if (!flow) return;

      const cleanedNodes = nodes.map(({ data, ...n }) => {
        // Strip the onDataChange function when saving to database
        const { onDataChange, ...restData } = data as any;
        return { ...n, data: restData };
      });

      const updatedFlow = {
        ...flow,
        nodes: cleanedNodes,
        edges: edges,
        lastUpdated: 'Just now',
      };

      fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFlow),
      })
        .then((res) => res.json())
        .then(() => {
          setFlows((prev) => prev.map((f) => (f.id === activeFlowId ? updatedFlow : f)));
          alert('Pipeline workflow saved successfully!');
        })
        .catch((err) => console.error('Error saving pipeline to database:', err));
    }
  };

  // Run/Execute flow simulation
  const handleRunSimulation = () => {
    if (nodes.length === 0) return;
    setIsSimulating(true);
    setSelectedNode(null);

    // Clear any leftover timers
    simulationTimers.forEach(clearTimeout);
    const timers: any[] = [];

    // Reset status of all nodes to 'idle', clear edges animations
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));

    // Helper functions to change status
    const setNodeStatus = (type: string, status: 'idle' | 'running' | 'success') => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.type === type) {
            return { ...n, data: { ...n.data, status } };
          }
          return n;
        })
      );
    };

    // Helper to animate connections originating from nodes of type
    const animateOutgoingEdges = (nodeType: string) => {
      setNodes((currNodes) => {
        const matchingNodeIds = currNodes.filter((n) => n.type === nodeType).map((n) => n.id);
        setEdges((eds) =>
          eds.map((edge) => {
            if (matchingNodeIds.includes(edge.source)) {
              return { ...edge, animated: true };
            }
            return edge;
          })
        );
        return currNodes;
      });
    };

    // Begin Pipeline simulation
    // Stage 1: Script Node
    setSimulationStep('Step 1: Outlining visual narrative with AI Scriptwriter...');
    setNodeStatus('scriptNode', 'running');

    // Stage 2: Audio Synthesis & Image Generation
    const t1 = setTimeout(() => {
      setNodeStatus('scriptNode', 'success');
      animateOutgoingEdges('scriptNode');
      
      setSimulationStep('Step 2: Rendering voice narration and AI frames concurrently...');
      setNodeStatus('voiceNode', 'running');
      setNodeStatus('imageNode', 'running');
    }, 2000);
    timers.push(t1);

    // Stage 3: Video Animation Renderer
    const t2 = setTimeout(() => {
      setNodeStatus('voiceNode', 'success');
      setNodeStatus('imageNode', 'success');
      animateOutgoingEdges('voiceNode');
      animateOutgoingEdges('imageNode');

      setSimulationStep('Step 3: Generating motion patterns on graphic assets...');
      setNodeStatus('videoNode', 'running');
    }, 4500);
    timers.push(t2);

    // Stage 4: Compiler Node
    const t3 = setTimeout(() => {
      setNodeStatus('videoNode', 'success');
      animateOutgoingEdges('videoNode');

      setSimulationStep('Step 4: Composing subtitle tracks and audio mixes into MP4 stream...');
      setNodeStatus('compilerNode', 'running');
    }, 7000);
    timers.push(t3);

    // Stage 5: Done
    const t4 = setTimeout(() => {
      setNodeStatus('compilerNode', 'success');
      setSimulationStep('Workflow Pipeline Executed successfully!');
      
      // Update executions tally in dashboard state and database
      if (activeFlowId) {
        setFlows((prev) => {
          const currentFlow = prev.find((f) => f.id === activeFlowId);
          if (currentFlow) {
            const updatedFlow = {
              ...currentFlow,
              runs: currentFlow.runs + 1,
              successRate: 99.2,
            };
            
            fetch('/api/flows', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedFlow),
            }).catch((err) => console.error('Error updating simulation run count in database:', err));

            return prev.map((f) => (f.id === activeFlowId ? updatedFlow : f));
          }
          return prev;
        });
      }
    }, 9500);
    timers.push(t4);

    const t5 = setTimeout(() => {
      setIsSimulating(false);
    }, 11000);
    timers.push(t5);

    setSimulationTimers(timers);
  };

  // Stop Simulation early
  const handleStopSimulation = () => {
    simulationTimers.forEach(clearTimeout);
    setSimulationTimers([]);
    setIsSimulating(false);
    setSimulationStep('');
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false })));
  };

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      simulationTimers.forEach(clearTimeout);
    };
  }, [simulationTimers]);

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Sidebar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          setCurrentView('dashboard');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="app-main-content">
        {currentTab === 'flows' ? (
          currentView === 'dashboard' ? (
            <FlowDashboard
              flows={flows}
              onSelectFlow={handleSelectFlow}
              onCreateFlow={handleCreateFlow}
              onDeleteFlow={handleDeleteFlow}
              onToggleStatus={handleToggleStatus}
            />
          ) : (
            <div className="flow-editor-view">
              <FlowHeader
                name={flows.find((f) => f.id === activeFlowId)?.name || 'Workflow Editor'}
                onRename={handleRenameFlow}
                onSave={handleSavePipeline}
                onRunSimulation={handleRunSimulation}
                onStopSimulation={handleStopSimulation}
                isSimulating={isSimulating}
                simulationStep={simulationStep}
                onBack={() => {
                  handleStopSimulation();
                  setCurrentView('dashboard');
                }}
                canUndo={past.length > 0}
                canRedo={future.length > 0}
                onUndo={undo}
                onRedo={redo}
              />
              <div className="flow-editor-workspace">
                <NodeSelector onAddNode={(type) => handleAddNode(type)} />
                
                <FlowCanvas
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onSelectNode={handleSelectNode}
                  onDropNode={(type, pos) => handleAddNode(type, pos)}
                  isSimulating={isSimulating}
                  onNodeDragStop={handleNodeDragStop}
                  onNodesDelete={handleNodesDelete}
                  onEdgesDelete={handleEdgesDelete}
                />

                <NodeDetailPanel
                  selectedNode={selectedNode}
                  onDataChange={handleNodeDataChange}
                  onDeleteNode={handleDeleteNode}
                />
              </div>
            </div>
          )
        ) : (
          /* Placeholder screens for other tabs */
          <div className="dashboard-placeholder-screen">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                {currentTab === 'storyboards' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                  </svg>
                )}
                {currentTab === 'assets' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                )}
                {currentTab === 'voices' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  </svg>
                )}
                {currentTab === 'settings' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83M12 2v20" />
                  </svg>
                )}
              </div>
              <h2>
                {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Workspace
              </h2>
              <p>
                This module is integrated into the studio project space. Check out the{' '}
                <button className="text-btn" onClick={() => setCurrentTab('flows')}>
                  AI Flows
                </button>{' '}
                tab to access the active drag-and-drop workflow builder.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
