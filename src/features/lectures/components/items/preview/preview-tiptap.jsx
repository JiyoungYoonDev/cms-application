'use client';

import { useEffect, useRef } from 'react';
import { generateHTML, Node } from '@tiptap/core';
import DOMPurify from 'dompurify';
import katex from 'katex';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';

// Lightweight stub nodes for generateHTML (no React view needed)
const MathBlockStub = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  addAttributes() { return { latex: { default: '' } }; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'math-preview' }, HTMLAttributes.latex || ''];
  },
});
const GraphBlockStub = Node.create({
  name: 'graphBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      expression: { default: '' },
      xMin: { default: -10 }, xMax: { default: 10 },
      yMin: { default: -10 }, yMax: { default: 10 },
      width: { default: 600 }, height: { default: 400 },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'graph-preview' }, `f(x) = ${HTMLAttributes.expression}`];
  },
});

const EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
  MathBlockStub,
  GraphBlockStub,
];

// ─── KaTeX ────────────────────────────────────────────────────────────────────

function decodeMathEntities(expr) {
  return expr
    .replace(/\t/g, '\\t').replace(/\x08/g, '\\b').replace(/\f/g, '\\f').replace(/\r/g, '\\r')
    .replace(/\n/g, ' ')
    .replace(/&amp;gt;/g, '>').replace(/&amp;lt;/g, '<').replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"');
}

function applyMathToHtml(html) {
  if (!html) return html;
  // Allow < > in math (comparisons like $x > 3$); skip matches containing HTML tags
  let result = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$$${expr}$$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: true, throwOnError: false }); }
    catch { return `$$${expr}$$`; }
  });
  result = result.replace(/\$([^$]+?)\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$${expr}$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: false, throwOnError: false }); }
    catch { return `$${expr}$`; }
  });
  return result;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMath(text) {
  if (!text) return '';
  // Escape HTML first so literal < > in math (e.g. $x > 3$) are safe
  let result = escapeHtml(text);
  // Backtick inline code → <code> tags (before math processing to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, (_, code) =>
    `<code style="padding:1px 6px;border-radius:4px;background:#2a2a44;color:#c4b5fd;font-size:0.8em;font-family:monospace">${code}</code>`
  );
  result = result.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$$${expr}$$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: true, throwOnError: false }); }
    catch { return expr; }
  });
  result = result.replace(/\$([^$]+?)\$/g, (_, expr) => {
    if (/<\/?[a-z][\w-]*[\s>\/]/i.test(expr)) return `$${expr}$`;
    try { return katex.renderToString(decodeMathEntities(expr).trim(), { displayMode: false, throwOnError: false }); }
    catch { return expr; }
  });
  return result;
}

export function MathText({ text, className = '' }) {
  if (!text) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderMath(text) }} />;
}

// ─── Tiptap dark renderer ─────────────────────────────────────────────────────

export function TiptapDark({ doc }) {
  if (!doc?.content?.length) return null;
  try {
    const raw = generateHTML(doc, EXTENSIONS);
    const sanitized = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true }, ADD_ATTR: ['class'] });
    const safe = applyMathToHtml(sanitized);
    return (
      <div
        className='text-[#c9d1d9] text-sm leading-relaxed
          [&_p]:my-1.5
          [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
          [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5
          [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mt-2
          [&_strong]:text-white [&_em]:italic
          [&_code]:bg-[#2a2a44] [&_code]:text-violet-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
          [&_pre]:bg-[#0d1117] [&_pre]:border [&_pre]:border-[#2a2a3e] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-0.5
          [&_li]:text-[#c9d1d9]
          [&_blockquote]:border-l-2 [&_blockquote]:border-[#4a4a5e] [&_blockquote]:pl-4 [&_blockquote]:text-[#9090a8] [&_blockquote]:my-2
          [&_a]:text-violet-400 [&_a]:underline
          [&_hr]:border-[#2a2a3e]
          [&_.math-preview]:bg-[#1a1a2e] [&_.math-preview]:border [&_.math-preview]:border-[#2a2a3e] [&_.math-preview]:rounded-lg [&_.math-preview]:p-4 [&_.math-preview]:my-3 [&_.math-preview]:font-mono [&_.math-preview]:text-violet-300
          [&_.graph-preview]:bg-[#1a1a2e] [&_.graph-preview]:border [&_.graph-preview]:border-[#2a2a3e] [&_.graph-preview]:rounded-lg [&_.graph-preview]:p-4 [&_.graph-preview]:my-3 [&_.graph-preview]:font-mono [&_.graph-preview]:text-teal-300'
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  } catch (err) {
    console.error('TiptapDark render error:', err);
    return <p className='text-sm text-[#5a5a72] italic'>Unable to render content</p>;
  }
}

// ─── Graph ────────────────────────────────────────────────────────────────────

export function GraphDisplay({ fn1, fn2, label1, label2, xDomain, yDomain }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !fn1) return;
    let cancelled = false;
    import('function-plot').then(({ default: functionPlot }) => {
      if (cancelled || !containerRef.current) return;
      const width = containerRef.current.offsetWidth || 420;
      const height = Math.round(width * 0.6);
      const data = [{ fn: fn1, color: '#2dd4bf', graphType: 'polyline' }];
      if (fn2) data.push({ fn: fn2, color: '#818cf8', graphType: 'polyline' });
      try {
        containerRef.current.innerHTML = '';
        functionPlot({
          target: containerRef.current,
          width, height,
          xAxis: { domain: xDomain ?? [-10, 10], label: 'x' },
          yAxis: { domain: yDomain ?? [-10, 10], label: 'y' },
          grid: true, data,
        });
      } catch (e) { console.error(e); }
    });
    return () => { cancelled = true; };
  }, [fn1, fn2, xDomain, yDomain]);

  if (!fn1) return null;
  return (
    <div className='my-4 rounded-xl overflow-hidden border border-[#2a2a3e] bg-[#0d1117]'>
      <div className='px-3 pt-2 flex gap-4 text-xs font-mono'>
        {label1 && <span className='text-teal-400'>— {label1}</span>}
        {label2 && fn2 && <span className='text-violet-400'>— {label2}</span>}
      </div>
      <div ref={containerRef} className='w-full [&_svg]:w-full' />
    </div>
  );
}
