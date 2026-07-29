import React, { useState } from 'react';
import type { Flow } from '../data/mockFlows';
import { flowTemplates } from '../data/mockFlows';

interface FlowDashboardProps {
  flows: Flow[];
  onSelectFlow: (id: string) => void;
  onCreateFlow: (templateId: string, name: string) => void;
  onDeleteFlow: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const FlowDashboard: React.FC<FlowDashboardProps> = ({
  flows,
  onSelectFlow,
  onCreateFlow,
  onDeleteFlow,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newFlowName, setNewFlowName] = useState('');

  // Calculate statistics
  const totalFlows = flows.length;
  const activeFlows = flows.filter((f) => f.status === 'active').length;
  const totalRuns = flows.reduce((sum, f) => sum + f.runs, 0);
  const avgSuccessRate = flows.filter(f => f.runs > 0).length > 0
    ? (flows.reduce((sum, f) => sum + (f.runs > 0 ? f.successRate : 0), 0) / flows.filter(f => f.runs > 0).length).toFixed(1)
    : '100';

  // Filter flows
  const filteredFlows = flows.filter((flow) => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = (templateId: string) => {
    const template = flowTemplates.find(t => t.id === templateId);
    setSelectedTemplateId(templateId);
    setNewFlowName(`My ${template ? template.name.replace(' (Standard)', '').replace(' (Vertical)', '') : 'Custom'} Flow`);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFlowName.trim()) {
      onCreateFlow(selectedTemplateId, newFlowName);
      setShowCreateModal(false);
      setNewFlowName('');
    }
  };

  const getNodeBadgeIcon = (type: string) => {
    switch (type) {
      case 'scriptNode':
        return (
          <span className="node-pill-icon script" title="Script">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </span>
        );
      case 'voiceNode':
        return (
          <span className="node-pill-icon voice" title="Voiceover">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/></svg>
          </span>
        );
      case 'imageNode':
        return (
          <span className="node-pill-icon image" title="Image Gen">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          </span>
        );
      case 'videoNode':
        return (
          <span className="node-pill-icon video" title="Video Render">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </span>
        );
      case 'compilerNode':
        return (
          <span className="node-pill-icon compiler" title="Compiler">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flow-dashboard">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Automated Flows</h1>
          <p>Design, automate, and scale your video generation workflows.</p>
        </div>
        <button className="primary-btn flex-btn" onClick={() => handleOpenCreateModal('tpl-4')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create Blank Flow</span>
        </button>
      </header>

      {/* Metrics Row */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{totalFlows}</span>
            <span className="metric-label">Total Workflows</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{activeFlows}</span>
            <span className="metric-label">Active Flows</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{totalRuns.toLocaleString()}</span>
            <span className="metric-label">Total Executions</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{avgSuccessRate}%</span>
            <span className="metric-label">Success Rate</span>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="templates-section">
        <h2 className="section-title">Start from a Template</h2>
        <div className="templates-grid">
          {flowTemplates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${template.id === 'tpl-4' ? 'blank' : ''}`}
              onClick={() => handleOpenCreateModal(template.id)}
            >
              <div className="template-badge">{template.category}</div>
              <h3 className="template-name">{template.name}</h3>
              <p className="template-desc">{template.description}</p>
              <div className="template-footer">
                <span className="nodes-count">
                  {template.nodesCount > 0 ? `${template.nodesCount} connected nodes` : 'Empty canvas'}
                </span>
                <span className="use-template-link">
                  Use this →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflows Search, Filter, and Grid */}
      <section className="flows-list-section">
        <div className="filter-bar">
          <h2 className="section-title">My Pipelines</h2>
          
          <div className="filter-controls">
            {/* Search */}
            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter pills */}
            <div className="filter-pills">
              <button
                className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-pill-btn ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                className={`filter-pill-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                Drafts
              </button>
            </div>
          </div>
        </div>

        {/* Flows Grid */}
        {filteredFlows.length > 0 ? (
          <div className="flows-grid">
            {filteredFlows.map((flow) => (
              <div key={flow.id} className="flow-card">
                <div className="flow-card-header">
                  <div className="flow-title-wrapper" onClick={() => onSelectFlow(flow.id)}>
                    <h3 className="flow-name">{flow.name}</h3>
                    <span className={`status-badge ${flow.status}`}>
                      {flow.status}
                    </span>
                  </div>
                  {/* Status Toggle Switch */}
                  <div className="status-toggle">
                    <label className="switch" title={`Toggle status: ${flow.status}`}>
                      <input
                        type="checkbox"
                        checked={flow.status === 'active'}
                        onChange={() => onToggleStatus(flow.id)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <p className="flow-description" onClick={() => onSelectFlow(flow.id)}>
                  {flow.description}
                </p>

                {/* Node visual representation pipeline */}
                <div className="flow-pipeline-preview" onClick={() => onSelectFlow(flow.id)}>
                  {flow.nodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      {getNodeBadgeIcon(node.type || '')}
                      {index < flow.nodes.length - 1 && (
                        <span className="pipeline-arrow">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                  {flow.nodes.length === 0 && (
                    <span className="empty-pipeline-text">No nodes configured</span>
                  )}
                </div>

                <div className="flow-card-footer">
                  <div className="flow-stats">
                    <span className="stat-item" title="Total times this workflow triggered">
                      <strong>{flow.runs}</strong> runs
                    </span>
                    {flow.runs > 0 && (
                      <span className="stat-item" title="Success percentage">
                        <strong>{flow.successRate}%</strong> success
                      </span>
                    )}
                  </div>
                  <div className="flow-actions">
                    <span className="last-updated">Updated {flow.lastUpdated}</span>
                    <button
                      className="delete-card-btn"
                      onClick={() => onDeleteFlow(flow.id)}
                      title="Delete workflow"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-flows-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <h3>No workflows found</h3>
            <p>Try searching for another keyword or create a new flow.</p>
          </div>
        )}
      </section>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New AI Workflow</h3>
              <button className="close-modal-btn" onClick={() => setShowCreateModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="flow-name-input">Workflow Name</label>
                <input
                  id="flow-name-input"
                  type="text"
                  required
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="e.g. YouTube Explainer Automation"
                />
              </div>
              <div className="form-group">
                <label>Template Type</label>
                <div className="template-preview-badge">
                  {flowTemplates.find((t) => t.id === selectedTemplateId)?.name || 'Custom Workflow'}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Create & Launch Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
