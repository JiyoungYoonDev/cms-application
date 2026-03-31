'use client';

import { useState } from 'react';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlignLeft, Code2, Files, Plus, Trash2, ListChecks,
  Github, Globe, FileCode, Type, StickyNote, X, ToggleLeft, ToggleRight,
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'github_url',   label: 'GitHub URL',   icon: Github   },
  { value: 'demo_url',     label: 'Demo URL',     icon: Globe    },
  { value: 'code_snippet', label: 'Code Snippet', icon: FileCode },
  { value: 'text',         label: 'Short Text',   icon: Type     },
  { value: 'note',         label: 'Note',         icon: StickyNote },
];

function fieldIcon(type) {
  return FIELD_TYPES.find((f) => f.value === type)?.icon ?? Type;
}

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

function makeEmpty() {
  return {
    submissionType: 'EDITOR',
    description: { type: 'doc', content: [] },
    requirements: [],
    // EDITOR
    language: 'python',
    files: [makeEmptyFile('python')],
    // REPO: array of { id, type, label, required }
    fields: [
      { id: crypto.randomUUID(), type: 'github_url', label: 'GitHub Repository URL', required: true },
    ],
  };
}

function migrateOldFields(oldFields) {
  // Convert old boolean-flag object → new array format
  const result = [];
  if (oldFields.repoRequired !== false) {
    result.push({ id: crypto.randomUUID(), type: 'github_url', label: 'GitHub Repository URL', required: !!oldFields.repoRequired });
  }
  if (oldFields.demoRequired || oldFields.demoOptional) {
    result.push({ id: crypto.randomUUID(), type: 'demo_url', label: 'Live Demo URL', required: !!oldFields.demoRequired });
  }
  if (oldFields.snippetRequired) {
    result.push({ id: crypto.randomUUID(), type: 'code_snippet', label: 'Key Code Snippet', required: true });
  }
  if (oldFields.noteLabel) {
    result.push({ id: crypto.randomUUID(), type: 'note', label: oldFields.noteLabel, required: false });
  }
  return result.length > 0 ? result : makeEmpty().fields;
}

export function parseProjectContent(raw) {
  if (!raw || typeof raw !== 'object') return makeEmpty();
  if (raw.submissionType) {
    // Migrate old boolean-flag fields object → array
    if (raw.fields && !Array.isArray(raw.fields)) {
      return { ...raw, fields: migrateOldFields(raw.fields) };
    }
    return raw;
  }
  // Legacy: bare tiptap doc
  if (raw.type === 'doc') return { ...makeEmpty(), description: raw };
  return makeEmpty();
}

// ─── File list editor (simplified, single-level) ──────────────────────────────

function FileListEditor({ files, language, onChange }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const safeIdx = Math.min(activeIdx, files.length - 1);
  const active = files[safeIdx];

  const updateFile = (idx, patch) =>
    onChange(files.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const addFile = () => {
    const next = [...files, { id: crypto.randomUUID(), name: 'new_file.py', content: '' }];
    onChange(next);
    setActiveIdx(next.length - 1);
  };

  const removeFile = (idx) => {
    if (files.length === 1) return;
    onChange(files.filter((_, i) => i !== idx));
    setActiveIdx(Math.max(0, safeIdx >= files.length - 1 ? files.length - 2 : safeIdx));
  };

  return (
    <div className='rounded-xl border border-input/60 overflow-hidden'>
      <div className='flex items-center bg-[#0e0e1a] border-b border-input/40 overflow-x-auto'>
        {files.map((f, idx) => (
          <button key={f.id} type='button' onClick={() => setActiveIdx(idx)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs border-r border-input/30 shrink-0 transition-colors ${
              idx === safeIdx ? 'bg-[#1a1a2e] text-white' : 'text-[#5a5a72] hover:text-[#9090a8]'
            }`}
          >
            <FileCode size={11} className={idx === safeIdx ? 'text-violet-400' : ''} />
            {f.name || 'untitled'}
          </button>
        ))}
        <button type='button' onClick={addFile}
          className='px-3 py-2 text-[#5a5a72] hover:text-[#9090a8] transition-colors shrink-0'
        >
          <Plus size={11} />
        </button>
      </div>
      {active && (
        <div className='p-4 space-y-3 bg-card/20'>
          <div className='flex gap-2 items-center'>
            <Input placeholder='filename' value={active.name}
              onChange={(e) => updateFile(safeIdx, { name: e.target.value })}
              className='h-8 border-input/60 font-mono text-sm flex-1' />
            <button type='button' onClick={() => removeFile(safeIdx)}
              disabled={files.length === 1}
              className='p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors'
            >
              <Trash2 size={13} />
            </button>
          </div>
          <Textarea placeholder='// starter code' value={active.content}
            onChange={(e) => updateFile(safeIdx, { content: e.target.value })}
            className='font-mono text-sm min-h-28 border-input/60' />
        </div>
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function ProjectFields({ value, onChange }) {
  const parsed = parseProjectContent(value);

  const upd = (field, val) => onChange({ ...parsed, [field]: val });

  // REPO fields array operations
  const addField = () => upd('fields', [
    ...(parsed.fields ?? []),
    { id: crypto.randomUUID(), type: 'github_url', label: '', required: false },
  ]);
  const updateField = (i, patch) => upd('fields', (parsed.fields ?? []).map((f, idx) => idx === i ? { ...f, ...patch } : f));
  const removeField = (i) => upd('fields', (parsed.fields ?? []).filter((_, idx) => idx !== i));

  const addReq = () => upd('requirements', [...(parsed.requirements ?? []), '']);
  const updateReq = (i, val) => {
    const next = [...(parsed.requirements ?? [])];
    next[i] = val;
    upd('requirements', next);
  };
  const removeReq = (i) => upd('requirements', (parsed.requirements ?? []).filter((_, idx) => idx !== i));

  const isEditor = parsed.submissionType === 'EDITOR';

  return (
    <div className='space-y-5'>

      {/* Submission type toggle */}
      <div className='flex items-center gap-4 p-4 rounded-xl border border-input/60 bg-card/30'>
        <div className='flex-1'>
          <p className='text-xs font-black uppercase tracking-widest opacity-50 mb-1'>Submission Type</p>
          <p className='text-sm text-muted-foreground'>
            {isEditor
              ? 'Students write & submit code directly in the editor'
              : 'Students submit a GitHub repo URL and/or other links'}
          </p>
        </div>
        <div className='flex rounded-lg overflow-hidden border border-input/60 shrink-0'>
          {['EDITOR', 'REPO'].map((type) => (
            <button key={type} type='button' onClick={() => upd('submissionType', type)}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                parsed.submissionType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {type === 'EDITOR' ? '💻 Editor' : '🔗 Repo / URL'}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className='space-y-1.5'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5'>
          <AlignLeft size={10} /> Project Description
        </label>
        <div className='rounded-xl border border-input/60 overflow-hidden'>
          <SimpleEditor initialData={parsed.description} onChange={(json) => upd('description', json)} />
        </div>
      </div>

      {/* Requirements */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5'>
            <ListChecks size={10} /> Requirements (optional)
          </label>
          <Button type='button' variant='ghost' size='sm' onClick={addReq} className='h-6 text-xs gap-1 px-2'>
            <Plus size={11} /> Add
          </Button>
        </div>
        {(parsed.requirements ?? []).map((req, i) => (
          <div key={i} className='flex gap-2 items-center'>
            <Input placeholder={`Requirement ${i + 1}`} value={req}
              onChange={(e) => updateReq(i, e.target.value)}
              className='h-8 border-input/60 text-sm flex-1' />
            <button type='button' onClick={() => removeReq(i)}
              className='text-muted-foreground hover:text-destructive transition-colors'
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* EDITOR mode: language + files */}
      {isEditor && (
        <>
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
              <Code2 size={10} /> Language
            </label>
            <Select value={parsed.language} onValueChange={(lang) => upd('language', lang)}>
              <SelectTrigger className='border-input/60'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
              <Files size={10} /> Starter Files
            </label>
            <FileListEditor
              files={parsed.files ?? [makeEmptyFile(parsed.language)]}
              language={parsed.language}
              onChange={(nextFiles) => upd('files', nextFiles)}
            />
          </div>
        </>
      )}

      {/* REPO mode: dynamic field list */}
      {!isEditor && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <label className='text-[10px] font-black uppercase tracking-widest opacity-40'>
              Submission Fields
            </label>
            <Button type='button' variant='ghost' size='sm' onClick={addField} className='h-6 text-xs gap-1 px-2'>
              <Plus size={11} /> Add Field
            </Button>
          </div>
          {(parsed.fields ?? []).length === 0 && (
            <p className='text-xs text-muted-foreground italic'>No fields yet. Add one above.</p>
          )}
          <div className='space-y-2'>
            {(parsed.fields ?? []).map((field, i) => {
              const FieldIcon = fieldIcon(field.type);
              return (
                <div key={field.id} className='flex items-center gap-2 rounded-xl border border-input/60 px-3 py-2.5'>
                  <FieldIcon size={14} className='text-muted-foreground shrink-0' />
                  <Select value={field.type} onValueChange={(val) => updateField(i, { type: val })}>
                    <SelectTrigger className='h-7 w-36 border-input/60 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((ft) => (
                        <SelectItem key={ft.value} value={ft.value} className='text-xs'>{ft.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder='Field label'
                    value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    className='h-7 border-input/60 text-xs flex-1'
                  />
                  <button
                    type='button'
                    onClick={() => updateField(i, { required: !field.required })}
                    className={`transition-colors shrink-0 ${field.required ? 'text-violet-500' : 'text-muted-foreground/40'}`}
                    title={field.required ? 'Required' : 'Optional'}
                  >
                    {field.required ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    type='button'
                    onClick={() => removeField(i)}
                    className='text-muted-foreground hover:text-destructive transition-colors shrink-0'
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
