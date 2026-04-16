'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileCode, Plus, Trash2 } from 'lucide-react';

export function FileListEditor({ files, onChange }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = files[Math.min(activeIdx, files.length - 1)];

  const updateFile = (idx, patch) => {
    const next = files.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    onChange(next);
  };

  const addFile = () => {
    const next = [...files, { id: crypto.randomUUID(), name: 'new_file.py', content: '' }];
    onChange(next);
    setActiveIdx(next.length - 1);
  };

  const removeFile = (idx) => {
    if (files.length === 1) return;
    const next = files.filter((_, i) => i !== idx);
    onChange(next);
    setActiveIdx(Math.max(0, activeIdx >= next.length ? next.length - 1 : activeIdx));
  };

  const activeIndex = Math.min(activeIdx, files.length - 1);

  return (
    <div className='rounded-xl border border-input/60 overflow-hidden'>
      {/* Tab bar */}
      <div className='flex items-center gap-0 bg-[#0e0e1a] border-b border-input/40 overflow-x-auto'>
        {files.map((f, idx) => (
          <button
            key={f.id}
            type='button'
            onClick={() => setActiveIdx(idx)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs border-r border-input/30 shrink-0 transition-colors ${
              idx === activeIndex
                ? 'bg-[#1a1a2e] text-white'
                : 'text-[#5a5a72] hover:text-[#9090a8] hover:bg-[#141424]'
            }`}
          >
            <FileCode size={11} className={idx === activeIndex ? 'text-violet-400' : ''} />
            <span className='max-w-[120px] truncate'>{f.name || 'untitled'}</span>
          </button>
        ))}
        <button
          type='button'
          onClick={addFile}
          className='flex items-center gap-1 px-3 py-2 text-[#5a5a72] hover:text-[#9090a8] hover:bg-[#141424] transition-colors shrink-0'
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Active file editor */}
      {active && (
        <div className='p-4 space-y-3 bg-card/20'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='filename (e.g. main.py)'
              value={active.name}
              onChange={(e) => updateFile(activeIndex, { name: e.target.value })}
              className='h-8 border-input/60 font-mono text-sm flex-1'
            />
            <button
              type='button'
              onClick={() => removeFile(activeIndex)}
              disabled={files.length === 1}
              className='p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors'
            >
              <Trash2 size={13} />
            </button>
          </div>
          <Textarea
            placeholder='// file content / starter code'
            value={active.content}
            onChange={(e) => updateFile(activeIndex, { content: e.target.value })}
            className='font-mono text-sm min-h-32 border-input/60'
          />
        </div>
      )}
    </div>
  );
}
