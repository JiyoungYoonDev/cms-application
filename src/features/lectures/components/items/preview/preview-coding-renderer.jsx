'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MathText, TiptapDark } from './preview-tiptap';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  { ssr: false, loading: () => <div className='h-full bg-[#1e1e1e] animate-pulse' /> },
);

function getMonacoLanguage(language) {
  const map = { javascript: 'javascript', java: 'java', cpp: 'cpp', c: 'c', python: 'python' };
  return map[language] ?? 'plaintext';
}

function SingleCodingProblem({ problem }) {
  const [activeFile, setActiveFile] = useState(0);
  const files = Array.isArray(problem.files) && problem.files.length > 0
    ? problem.files
    : problem.fileName ? [{ name: problem.fileName, content: problem.starterCode ?? '' }] : [];
  const currentFile = files[activeFile] ?? files[0];
  const lineCount = (currentFile?.content ?? '').split('\n').length;
  const editorHeight = Math.max(120, Math.min(lineCount * 19 + 24, 400));

  return (
    <div className='space-y-4'>
      {problem.description && <TiptapDark doc={problem.description} />}

      {problem.language && (
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72]'>Language</span>
          <span className='text-xs font-mono bg-[#1a1a2e] border border-[#2a2a3e] text-[#9090a8] px-2 py-0.5 rounded'>{problem.language}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className='rounded-lg overflow-hidden border border-[#2a2a3e]'>
          {/* File tabs */}
          <div className='flex items-center bg-[#0e0e1a] border-b border-[#2a2a3e] overflow-x-auto'>
            {files.map((f, idx) => (
              <button key={f.id ?? idx} type='button' onClick={() => setActiveFile(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs border-r border-[#2a2a3e] shrink-0 transition-colors ${
                  idx === activeFile ? 'bg-[#1e1e1e] text-white' : 'text-[#5a5a72] hover:text-[#9090a8] hover:bg-[#141424]'
                }`}
              >
                <span>{f.name || 'untitled'}</span>
              </button>
            ))}
          </div>
          {/* Monaco read-only editor */}
          <div style={{ height: editorHeight }}>
            <MonacoEditor
              key={`${activeFile}-${currentFile?.name}`}
              height={editorHeight}
              language={getMonacoLanguage(problem.language)}
              theme='vs-dark'
              value={currentFile?.content ?? ''}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: 'on',
                folding: false,
                contextmenu: false,
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                overviewRulerLanes: 0,
              }}
            />
          </div>
        </div>
      )}

      {Array.isArray(problem.testCases) && problem.testCases.length > 0 && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>
            Test Cases ({problem.testCases.length})
            {problem.functionName && (
              <span className='ml-2 text-violet-400 normal-case tracking-normal font-mono'>fn: {problem.functionName}()</span>
            )}
            {problem.evaluationStyle && (
              <span className='ml-2 text-[10px] bg-[#1a1a2e] border border-[#2a2a3e] px-1.5 py-0.5 rounded normal-case tracking-normal text-[#9090a8]'>
                {problem.evaluationStyle}
              </span>
            )}
          </p>
          <div className='space-y-2'>
            {problem.testCases.map((tc, ti) => {
              const isFn = Array.isArray(tc.args);
              return (
                <div key={ti} className='rounded-lg border border-[#2a2a3e] bg-[#0d1117] p-3 space-y-1'>
                  <span className='text-xs font-bold text-[#5a5a72]'>Test {ti + 1}</span>
                  <div className='grid grid-cols-2 gap-3 text-xs font-mono'>
                    <div>
                      <span className='text-[#5a5a72] font-sans font-bold'>{isFn ? 'Args' : 'Input'}</span>
                      <pre className='mt-1 bg-[#1a1a2e] rounded px-2 py-1.5 text-[#c9d1d9] whitespace-pre-wrap min-h-[28px]'>
                        {isFn ? JSON.stringify(tc.args) : (tc.input || '(no stdin)')}
                      </pre>
                    </div>
                    <div>
                      <span className='text-[#5a5a72] font-sans font-bold'>{isFn ? 'Expected Return' : 'Expected Output'}</span>
                      <pre className='mt-1 bg-[#1a1a2e] rounded px-2 py-1.5 text-[#c9d1d9] whitespace-pre-wrap min-h-[28px]'>
                        {isFn ? JSON.stringify(tc.expected) : tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {problem.expectedOutput && !problem.testCases?.length && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>Expected Output</p>
          <pre className='bg-[#0d1117] border border-[#2a2a3e] rounded-lg p-4 text-sm font-mono text-[#c9d1d9] whitespace-pre-wrap'>{problem.expectedOutput}</pre>
        </div>
      )}

      {(problem.hints ?? []).length > 0 && (
        <div className='space-y-2'>
          {problem.hints.map((h, i) => (
            <div key={i} className='bg-[#1e1e32] border-l-2 border-amber-400/60 rounded-lg px-4 py-2.5 text-sm text-[#b0b0c8]'>💡 <MathText text={h} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CodingSetRenderer({ contentJson }) {
  const parsed = contentJson ?? {};
  const [problemIndex, setProblemIndex] = useState(0);

  // Normalise to problems[]
  const problems = Array.isArray(parsed.problems) && parsed.problems.length > 0
    ? parsed.problems
    : [parsed];

  const totalProblems = problems.length;
  const currentProblem = problems[problemIndex] ?? problems[0];

  return (
    <div className='space-y-5'>
      {/* Problem navigation */}
      {totalProblems > 1 && (
        <div className='flex items-center gap-3'>
          <button type='button' onClick={() => setProblemIndex((i) => Math.max(0, i - 1))}
            disabled={problemIndex === 0}
            className='p-1.5 rounded-md bg-[#1e1e32] text-[#9090a8] hover:text-white disabled:opacity-30 transition-colors'
          >‹</button>
          <span className='text-sm text-[#9090a8]'>
            Problem <span className='text-white font-semibold'>{problemIndex + 1}</span> / {totalProblems}
            {currentProblem?.title && <span className='ml-2 text-[#5a5a72]'>— {currentProblem.title}</span>}
          </span>
          <button type='button' onClick={() => setProblemIndex((i) => Math.min(totalProblems - 1, i + 1))}
            disabled={problemIndex === totalProblems - 1}
            className='p-1.5 rounded-md bg-[#1e1e32] text-[#9090a8] hover:text-white disabled:opacity-30 transition-colors'
          >›</button>
        </div>
      )}

      <SingleCodingProblem key={problemIndex} problem={currentProblem} />
    </div>
  );
}
