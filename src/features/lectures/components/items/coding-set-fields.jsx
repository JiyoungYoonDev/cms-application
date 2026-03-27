'use client';

import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Fields } from '@/components/ui/form/Fields';
import { AlignLeft, Code2, FileCode, Terminal } from 'lucide-react';

const LANGUAGES = [
  { value: 'python', label: 'Python', fileName: 'main.py' },
  { value: 'javascript', label: 'JavaScript', fileName: 'main.js' },
  { value: 'java', label: 'Java', fileName: 'Main.java' },
  { value: 'cpp', label: 'C++', fileName: 'main.cpp' },
  { value: 'c', label: 'C', fileName: 'main.c' },
];

const EMPTY_CODING_CONTENT = {
  description: { type: 'doc', content: [] },
  language: 'python',
  fileName: 'main.py',
  starterCode: '',
  expectedOutput: '',
  hints: [],
};

export function parseCodingContent(raw) {
  if (!raw) return EMPTY_CODING_CONTENT;
  // New wrapper format
  if (raw.description !== undefined || raw.starterCode !== undefined) {
    return {
      description: raw.description ?? { type: 'doc', content: [] },
      language: raw.language ?? 'python',
      fileName: raw.fileName ?? 'main.py',
      starterCode: raw.starterCode ?? '',
      expectedOutput: raw.expectedOutput ?? '',
      hints: raw.hints ?? [],
    };
  }
  // Legacy: bare Tiptap doc — migrate to new format
  if (raw.type === 'doc') {
    return { ...EMPTY_CODING_CONTENT, description: raw };
  }
  return EMPTY_CODING_CONTENT;
}

export function CodingSetFields({ value, onChange }) {
  const content = parseCodingContent(value);

  const update = (field, val) => {
    onChange({ ...content, [field]: val });
  };

  const handleLanguageChange = (lang) => {
    const preset = LANGUAGES.find((l) => l.value === lang);
    onChange({
      ...content,
      language: lang,
      fileName: preset?.fileName ?? content.fileName,
    });
  };

  return (
    <Fields
      items={[
        {
          key: 'description',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <AlignLeft size={11} /> Description
            </span>
          ),
          className: 'sm:col-span-2',
          child: (
            <div className='rounded-2xl border border-input/60 overflow-hidden'>
              <SimpleEditor
                initialData={content.description}
                onChange={(json) => update('description', json)}
              />
            </div>
          ),
        },
        {
          key: 'language',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <Code2 size={11} /> Language
            </span>
          ),
          child: (
            <Select value={content.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className='border-input/60'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        },
        {
          key: 'fileName',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <FileCode size={11} /> File Name
            </span>
          ),
          child: (
            <Input
              placeholder='e.g. main.py'
              value={content.fileName}
              onChange={(e) => update('fileName', e.target.value)}
              className='h-11 border-input/60 font-mono'
            />
          ),
        },
        {
          key: 'starterCode',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <Code2 size={11} /> Starter Code
            </span>
          ),
          className: 'sm:col-span-2',
          child: (
            <Textarea
              placeholder='# starter code shown in the editor'
              value={content.starterCode}
              onChange={(e) => update('starterCode', e.target.value)}
              className='font-mono text-sm min-h-32 border-input/60'
            />
          ),
        },
        {
          key: 'expectedOutput',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <Terminal size={11} /> Expected Output
            </span>
          ),
          className: 'sm:col-span-2',
          child: (
            <Textarea
              placeholder='Expected output for grading'
              value={content.expectedOutput}
              onChange={(e) => update('expectedOutput', e.target.value)}
              className='font-mono text-sm min-h-20 border-input/60'
            />
          ),
        },
      ]}
    />
  );
}
