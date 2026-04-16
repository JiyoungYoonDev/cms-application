'use client';

import { useState } from 'react';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlignLeft, Code2, Terminal, Plus, Trash2, ChevronUp, ChevronDown, Hash, Files, FlaskConical,
} from 'lucide-react';
import { FileListEditor } from './coding-set-file-editor';
import { TestCasesEditor } from './coding-set-test-cases';

const LANGUAGES = [
  { value: 'python',     label: 'Python',     fileName: 'main.py' },
  { value: 'javascript', label: 'JavaScript', fileName: 'main.js' },
  { value: 'java',       label: 'Java',       fileName: 'Main.java' },
  { value: 'cpp',        label: 'C++',        fileName: 'main.cpp' },
  { value: 'c',          label: 'C',          fileName: 'main.c' },
];

function makeEmptyFile(language = 'python') {
  const preset = LANGUAGES.find((l) => l.value === language);
  return { id: crypto.randomUUID(), name: preset?.fileName ?? 'main.py', content: '' };
}

function makeEmptyProblem() {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: { type: 'doc', content: [] },
    language: 'python',
    files: [makeEmptyFile('python')],
    expectedOutput: '',
    hints: [],
    points: 0,
    evaluationStyle: 'console',
    functionName: '',
    testCases: [],
  };
}

// ─── Migration helpers ──────────────────────────────────────────────────────────

function normaliseProblem(p) {
  // Already has files[]
  if (Array.isArray(p.files) && p.files.length > 0) return p;
  // Legacy: single fileName + starterCode
  return {
    ...p,
    files: [{
      id: crypto.randomUUID(),
      name: p.fileName ?? 'main.py',
      content: p.starterCode ?? '',
    }],
  };
}

export function parseCodingContent(raw) {
  if (!raw) return { problems: [makeEmptyProblem()] };

  // New multi-problem format
  if (Array.isArray(raw.problems)) {
    const problems = raw.problems.length > 0
      ? raw.problems.map(normaliseProblem)
      : [makeEmptyProblem()];
    return { problems };
  }

  // Old single format: { description, language, fileName, starterCode, expectedOutput, hints }
  if (raw.description !== undefined || raw.starterCode !== undefined || raw.language !== undefined) {
    return {
      problems: [normaliseProblem({
        id: crypto.randomUUID(),
        title: '',
        description: raw.description ?? { type: 'doc', content: [] },
        language: raw.language ?? 'python',
        fileName: raw.fileName ?? 'main.py',
        starterCode: raw.starterCode ?? '',
        expectedOutput: raw.expectedOutput ?? '',
        hints: raw.hints ?? [],
        points: 0,
      })],
    };
  }

  // Legacy bare Tiptap doc
  if (raw.type === 'doc') {
    return { problems: [{ ...makeEmptyProblem(), description: raw }] };
  }

  return { problems: [makeEmptyProblem()] };
}

// ─── Single problem form ───────────────────────────────────────────────────────

function SingleProblemFields({ problem, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(true);

  const upd = (field, val) => onChange({ ...problem, [field]: val });

  const handleLanguageChange = (lang) => {
    onChange({ ...problem, language: lang });
  };

  const handleAddHint    = () => upd('hints', [...(problem.hints ?? []), '']);
  const handleHintChange = (i, val) => { const n = [...(problem.hints ?? [])]; n[i] = val; upd('hints', n); };
  const handleRemoveHint = (i) => upd('hints', (problem.hints ?? []).filter((_, idx) => idx !== i));

  const files = problem.files ?? [makeEmptyFile(problem.language)];

  return (
    <div className='rounded-xl border bg-card/30 overflow-hidden'>
      {/* Problem header */}
      <div className='flex items-center gap-2 px-4 py-3 bg-card/60 border-b border-input/40'>
        <button type='button' onClick={() => setExpanded((v) => !v)} className='flex-1 flex items-center gap-2 text-left min-w-0'>
          <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0'>
            Problem {index + 1}
          </span>
          {problem.title && (
            <span className='text-sm truncate text-muted-foreground'>{problem.title}</span>
          )}
          <span className='ml-auto text-muted-foreground opacity-40'>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>
        <div className='flex items-center gap-1 shrink-0'>
          <button type='button' onClick={onMoveUp} disabled={index === 0} className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30'>
            <ChevronUp size={13} />
          </button>
          <button type='button' onClick={onMoveDown} disabled={index === total - 1} className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30'>
            <ChevronDown size={13} />
          </button>
          <button type='button' onClick={onRemove} disabled={total === 1} className='p-1 text-muted-foreground hover:text-destructive disabled:opacity-30'>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className='p-5 space-y-5'>
          {/* Title + Points */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Problem Title</label>
              <Input
                placeholder='e.g. Step 1: Print Hello World'
                value={problem.title}
                onChange={(e) => upd('title', e.target.value)}
                className='h-9 border-input/60'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
                <Hash size={10} /> Points
              </label>
              <Input
                type='number'
                value={problem.points ?? 0}
                onChange={(e) => upd('points', Number(e.target.value))}
                className='h-9 border-input/60 font-mono'
              />
            </div>
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5'>
              <AlignLeft size={10} /> Description
            </label>
            <div className='rounded-xl border border-input/60 overflow-hidden'>
              <SimpleEditor
                initialData={problem.description}
                onChange={(json) => upd('description', json)}
              />
            </div>
          </div>

          {/* Language */}
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
              <Code2 size={10} /> Language
            </label>
            <Select value={problem.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className='border-input/60'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Files */}
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
              <Files size={10} /> Files
            </label>
            <FileListEditor
              files={files}
              onChange={(nextFiles) => upd('files', nextFiles)}
            />
          </div>

          {/* Expected Output (legacy / fallback when no test cases) */}
          {!(problem.testCases?.length > 0) && (
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
                <Terminal size={10} /> Expected Output (simple)
              </label>
              <Textarea
                placeholder='Expected output for grading (used when no test cases)'
                value={problem.expectedOutput}
                onChange={(e) => upd('expectedOutput', e.target.value)}
                className='font-mono text-sm min-h-16 border-input/60'
              />
            </div>
          )}

          {/* Test Cases */}
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
              <FlaskConical size={10} /> Test Cases
            </label>
            <TestCasesEditor problem={problem} onChange={(updated) => onChange(updated)} />
          </div>

          {/* Hints */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>Hints (optional)</label>
              <Button type='button' variant='ghost' size='sm' onClick={handleAddHint} className='h-6 text-xs gap-1 px-2'>
                <Plus size={11} /> Add Hint
              </Button>
            </div>
            {(problem.hints ?? []).map((hint, i) => (
              <div key={i} className='flex gap-2 items-center'>
                <Input placeholder={`Hint ${i + 1}`} value={hint} onChange={(e) => handleHintChange(i, e.target.value)} className='h-8 border-input/60 text-sm flex-1' />
                <button type='button' onClick={() => handleRemoveHint(i)} className='text-muted-foreground hover:text-destructive transition-colors'>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function CodingSetFields({ value, onChange }) {
  const { problems } = parseCodingContent(value);

  const updateProblem = (index, updated) => {
    const next = [...problems];
    next[index] = updated;
    onChange({ problems: next });
  };

  const removeProblem = (index) => {
    if (problems.length === 1) return;
    onChange({ problems: problems.filter((_, i) => i !== index) });
  };

  const addProblem = () => {
    onChange({ problems: [...problems, makeEmptyProblem()] });
  };

  const moveProblem = (index, direction) => {
    const next = [...problems];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ problems: next });
  };

  return (
    <div className='space-y-3'>
      {problems.map((problem, index) => (
        <SingleProblemFields
          key={problem.id}
          problem={problem}
          index={index}
          total={problems.length}
          onChange={(updated) => updateProblem(index, updated)}
          onRemove={() => removeProblem(index)}
          onMoveUp={() => moveProblem(index, -1)}
          onMoveDown={() => moveProblem(index, 1)}
        />
      ))}
      <Button type='button' variant='outline' size='sm' onClick={addProblem} className='gap-1.5 text-xs'>
        <Plus size={13} /> Add Problem
      </Button>
    </div>
  );
}
