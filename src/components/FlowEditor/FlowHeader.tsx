import React, { useState } from 'react';

interface FlowHeaderProps {
  name: string;
  onRename: (newName: string) => void;
  onSave: () => void;
  onRunSimulation: () => void;
  onStopSimulation: () => void;
  isSimulating: boolean;
  simulationStep: string;
  onBack: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const FlowHeader: React.FC<FlowHeaderProps> = ({
  name,
  onRename,
  onSave,
  onRunSimulation,
  onStopSimulation,
  isSimulating,
  simulationStep,
  onBack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const handleSubmitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onRename(editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <header className="flow-editor-header">
      {/* Back button and title */}
      <div className="header-left">
        <button className="back-btn" onClick={onBack} aria-label="Go back to dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="flow-name-editor">
          {isEditing ? (
            <form onSubmit={handleSubmitRename} className="rename-form">
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSubmitRename}
              />
            </form>
          ) : (
            <div className="name-display-row" onClick={() => setIsEditing(true)}>
              <span className="flow-editor-name">{name}</span>
              <button className="rename-btn" title="Rename workflow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulation status display */}
      {isSimulating && (
        <div className="simulation-status-banner">
          <div className="pulsing-record-dot"></div>
          <span className="status-banner-text">{simulationStep}</span>
        </div>
      )}

      {/* Editor buttons */}
      <div className="header-actions">
        {isSimulating ? (
          <button className="danger-btn flex-btn" onClick={onStopSimulation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            <span>Stop Run</span>
          </button>
        ) : (
          <button className="play-btn flex-btn" onClick={onRunSimulation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Run Flow</span>
          </button>
        )}

        {/* Undo/Redo Buttons */}
        <div className="history-actions-group">
          <button
            className="history-action-btn"
            onClick={onUndo}
            disabled={!canUndo || isSimulating}
            title="Undo (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button
            className="history-action-btn"
            onClick={onRedo}
            disabled={!canRedo || isSimulating}
            title="Redo (Ctrl+Y)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        <button className="secondary-btn flex-btn" onClick={onSave} disabled={isSimulating}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save Pipeline</span>
        </button>
      </div>
    </header>
  );
};
