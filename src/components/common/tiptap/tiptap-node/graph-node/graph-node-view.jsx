'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './graph-node.scss';

/**
 * Convert common math notations to function-plot compatible syntax.
 *  |x|       → abs(x)
 *  |x+1|     → abs(x+1)
 *  ln(x)     → log(x)      (function-plot uses log for natural log)
 *  √(x)      → sqrt(x)
 *  π         → PI
 */
function normalizeMathExpression(expr) {
  let result = expr;
  // |...| → abs(...)  — handles nested pipes like |x+1| or |sin(x)|
  result = result.replace(/\|([^|]+)\|/g, 'abs($1)');
  // ln(...) → log(...)
  result = result.replace(/\bln\s*\(/g, 'log(');
  // √(...) or √x → sqrt(...)
  result = result.replace(/√\(([^)]+)\)/g, 'sqrt($1)');
  result = result.replace(/√(\w+)/g, 'sqrt($1)');
  // π → PI
  result = result.replace(/π/g, 'PI');
  return result;
}

const MATH_SYMBOLS = [
  { label: 'π', insert: 'π', title: 'Pi' },
  { label: '√', insert: 'sqrt(', title: 'Square root' },
  { label: '|x|', insert: 'abs(', title: 'Absolute value' },
  { label: '^', insert: '^', title: 'Power' },
  { label: 'sin', insert: 'sin(', title: 'Sine' },
  { label: 'cos', insert: 'cos(', title: 'Cosine' },
  { label: 'tan', insert: 'tan(', title: 'Tangent' },
  { label: 'log', insert: 'log(', title: 'Natural log (ln)' },
  { label: 'exp', insert: 'exp(', title: 'Exponential (e^x)' },
  { label: 'x²', insert: 'x^2', title: 'x squared' },
  { label: 'x³', insert: 'x^3', title: 'x cubed' },
  { label: '1/x', insert: '1/x', title: 'Reciprocal' },
];

export function GraphNodeView({ node, updateAttributes, deleteNode, selected }) {
  const [editing, setEditing] = useState(false);
  const [expression, setExpression] = useState(node.attrs.expression || 'x^2');
  const [xMin, setXMin] = useState(node.attrs.xMin ?? -10);
  const [xMax, setXMax] = useState(node.attrs.xMax ?? 10);
  const [yMin, setYMin] = useState(node.attrs.yMin ?? -10);
  const [yMax, setYMax] = useState(node.attrs.yMax ?? 10);
  const [error, setError] = useState(null);
  const graphRef = useRef(null);
  const plotModuleRef = useRef(null);
  const inputRef = useRef(null);

  // Load function-plot module once
  useEffect(() => {
    import('function-plot').then((mod) => {
      plotModuleRef.current = mod.default;
    });
  }, []);

  const renderGraph = useCallback((fn, xDomain, yDomain) => {
    if (!graphRef.current || !plotModuleRef.current) return;
    setError(null);

    try {
      const normalized = normalizeMathExpression(fn);
      graphRef.current.innerHTML = '';
      plotModuleRef.current({
        target: graphRef.current,
        width: node.attrs.width || 600,
        height: node.attrs.height || 400,
        xAxis: { domain: [Number(xDomain[0]), Number(xDomain[1])] },
        yAxis: { domain: [Number(yDomain[0]), Number(yDomain[1])] },
        grid: true,
        data: [{ fn: normalized, sampler: 'builtIn', graphType: 'polyline' }],
      });
    } catch (err) {
      setError(err.message || 'Invalid function');
    }
  }, [node.attrs.width, node.attrs.height]);

  // Render on every input change (live preview)
  useEffect(() => {
    const timer = setTimeout(() => {
      renderGraph(expression, [xMin, xMax], [yMin, yMax]);
    }, 200);
    return () => clearTimeout(timer);
  }, [expression, xMin, xMax, yMin, yMax, renderGraph]);

  // Also render when module first loads
  useEffect(() => {
    if (!plotModuleRef.current) {
      import('function-plot').then((mod) => {
        plotModuleRef.current = mod.default;
        renderGraph(
          editing ? expression : node.attrs.expression,
          editing ? [xMin, xMax] : [node.attrs.xMin, node.attrs.xMax],
          editing ? [yMin, yMax] : [node.attrs.yMin, node.attrs.yMax],
        );
      });
    }
  }, []);

  const handleConfirm = useCallback(() => {
    updateAttributes({
      expression,
      xMin: Number(xMin),
      xMax: Number(xMax),
      yMin: Number(yMin),
      yMax: Number(yMax),
    });
    setEditing(false);
  }, [expression, xMin, xMax, yMin, yMax, updateAttributes]);

  const insertSymbol = useCallback((text) => {
    const input = inputRef.current;
    if (!input) {
      setExpression((prev) => prev + text);
      return;
    }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const before = expression.slice(0, start);
    const after = expression.slice(end);
    const newExpr = before + text + after;
    setExpression(newExpr);
    // Move cursor after inserted text
    requestAnimationFrame(() => {
      input.focus();
      const pos = start + text.length;
      input.setSelectionRange(pos, pos);
    });
  }, [expression]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleConfirm();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setExpression(node.attrs.expression);
        setXMin(node.attrs.xMin);
        setXMax(node.attrs.xMax);
        setYMin(node.attrs.yMin);
        setYMax(node.attrs.yMax);
        setEditing(false);
      }
      e.stopPropagation();
    },
    [handleConfirm, node.attrs],
  );

  return (
    <NodeViewWrapper
      className={`graph-node-wrapper ${selected ? 'graph-node-selected' : ''}`}
      data-type="graph-block"
    >
      {/* Graph always visible */}
      <div className="graph-node-render" onDoubleClick={() => !editing && setEditing(true)}>
        {error && <div className="graph-node-error">{error}</div>}
        <div ref={graphRef} />
      </div>

      {/* Controls panel */}
      {editing ? (
        <div className="graph-node-editor" onKeyDown={handleKeyDown}>
          <div className="graph-node-editor-label">Function Graph</div>
          <div className="graph-node-field">
            <label>f(x) =</label>
            <input
              ref={inputRef}
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. x^2, sin(x), log(x)"
              autoFocus
            />
          </div>
          <div className="graph-node-symbols">
            {MATH_SYMBOLS.map((sym) => (
              <button
                key={sym.label}
                type="button"
                className="graph-node-symbol-btn"
                title={sym.title}
                onClick={() => insertSymbol(sym.insert)}
              >
                {sym.label}
              </button>
            ))}
          </div>
          <div className="graph-node-grid">
            <div className="graph-node-field">
              <label>x min</label>
              <input type="number" value={xMin} onChange={(e) => setXMin(e.target.value)} />
            </div>
            <div className="graph-node-field">
              <label>x max</label>
              <input type="number" value={xMax} onChange={(e) => setXMax(e.target.value)} />
            </div>
            <div className="graph-node-field">
              <label>y min</label>
              <input type="number" value={yMin} onChange={(e) => setYMin(e.target.value)} />
            </div>
            <div className="graph-node-field">
              <label>y max</label>
              <input type="number" value={yMax} onChange={(e) => setYMax(e.target.value)} />
            </div>
          </div>
          <div className="graph-node-actions">
            <span className="graph-node-hint">Ctrl+Enter to confirm, Esc to cancel</span>
            <div className="graph-node-btn-group">
              <button type="button" className="graph-node-btn graph-node-btn-delete" onClick={deleteNode}>
                Delete
              </button>
              <button type="button" className="graph-node-btn graph-node-btn-confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="graph-node-edit-hint" onDoubleClick={() => setEditing(true)}>
          <span>f(x) = {node.attrs.expression}</span>
          <span className="graph-node-hint">Double-click to edit</span>
        </div>
      )}
    </NodeViewWrapper>
  );
}
