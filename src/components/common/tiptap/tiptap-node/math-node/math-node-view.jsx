'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './math-node.scss';

export function MathNodeView({ node, updateAttributes, deleteNode, selected }) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [latex, setLatex] = useState(node.attrs.latex || '');
  const renderRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!editing && renderRef.current && latex.trim()) {
      try {
        katex.render(latex, renderRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        renderRef.current.textContent = 'Invalid LaTeX';
      }
    }
  }, [editing, latex]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const handleConfirm = useCallback(() => {
    const trimmed = latex.trim();
    if (!trimmed) {
      deleteNode();
      return;
    }
    updateAttributes({ latex: trimmed });
    setEditing(false);
  }, [latex, updateAttributes, deleteNode]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleConfirm();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!node.attrs.latex) {
          deleteNode();
        } else {
          setLatex(node.attrs.latex);
          setEditing(false);
        }
      }
      e.stopPropagation();
    },
    [handleConfirm, deleteNode, node.attrs.latex],
  );

  return (
    <NodeViewWrapper
      className={`math-node-wrapper ${selected ? 'math-node-selected' : ''}`}
      data-type="math-block"
    >
      {editing ? (
        <div className="math-node-editor">
          <div className="math-node-editor-label">LaTeX</div>
          <textarea
            ref={textareaRef}
            className="math-node-textarea"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. \\frac{a}{b} = c^2"
            rows={3}
          />
          <div className="math-node-actions">
            <span className="math-node-hint">Ctrl+Enter to confirm, Esc to cancel</span>
            <button
              type="button"
              className="math-node-btn math-node-btn-confirm"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div
          className="math-node-render"
          ref={renderRef}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        />
      )}
    </NodeViewWrapper>
  );
}
