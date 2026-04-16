'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FlaskConical, Play } from 'lucide-react';

export function TestCasesEditor({ problem, onChange }) {
  const style = problem.evaluationStyle ?? 'console';
  const testCases = problem.testCases ?? [];
  const isFn = style === 'function';

  const setStyle = (val) => {
    onChange({ ...problem, evaluationStyle: val, testCases: [] });
  };

  const setFnName = (val) => onChange({ ...problem, functionName: val });

  const addCase = () => {
    const tc = isFn
      ? { args: [], expected: '' }
      : { input: '', expectedOutput: '' };
    onChange({ ...problem, testCases: [...testCases, tc] });
  };

  const updateCase = (i, patch) => {
    const next = testCases.map((tc, idx) => (idx === i ? { ...tc, ...patch } : tc));
    onChange({ ...problem, testCases: next });
  };

  const removeCase = (i) => {
    onChange({ ...problem, testCases: testCases.filter((_, idx) => idx !== i) });
  };

  return (
    <div className='space-y-3'>
      {/* Evaluation style toggle */}
      <div className='flex items-center gap-3'>
        <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
          <FlaskConical size={10} /> Evaluation Style
        </label>
        <div className='flex rounded-lg border border-input/60 overflow-hidden'>
          {['console', 'function'].map((s) => (
            <button
              key={s}
              type='button'
              onClick={() => setStyle(s)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                style === s
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
              }`}
            >
              {s === 'console' ? 'Console (stdin/stdout)' : 'Function (args/return)'}
            </button>
          ))}
        </div>
      </div>

      {/* Function name (only in function mode) */}
      {isFn && (
        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1'>
            <Play size={10} /> Function Name
          </label>
          <Input
            placeholder='e.g. add, fibonacci, solve'
            value={problem.functionName ?? ''}
            onChange={(e) => setFnName(e.target.value)}
            className='h-8 border-input/60 font-mono text-sm max-w-xs'
          />
        </div>
      )}

      {/* Test case list */}
      {testCases.map((tc, i) => (
        <div key={i} className='rounded-lg border border-input/40 bg-card/20 p-3 space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-black uppercase tracking-widest opacity-50'>Test Case {i + 1}</span>
            <button type='button' onClick={() => removeCase(i)} className='p-1 text-muted-foreground hover:text-destructive transition-colors'>
              <Trash2 size={12} />
            </button>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            {isFn ? (
              <>
                <div className='space-y-1'>
                  <label className='text-[10px] font-medium opacity-50'>Args (JSON array)</label>
                  <Input
                    placeholder='e.g. [1, 2] or ["hello"]'
                    value={typeof tc.args === 'string' ? tc.args : JSON.stringify(tc.args ?? [])}
                    onChange={(e) => {
                      try { updateCase(i, { args: JSON.parse(e.target.value) }); }
                      catch { updateCase(i, { args: e.target.value }); }
                    }}
                    className='h-8 border-input/60 font-mono text-sm'
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-medium opacity-50'>Expected Return (JSON)</label>
                  <Input
                    placeholder='e.g. 3 or "world" or [1,2]'
                    value={typeof tc.expected === 'string' && !tc.expected.startsWith('{') && !tc.expected.startsWith('[') ? tc.expected : JSON.stringify(tc.expected ?? '')}
                    onChange={(e) => {
                      try { updateCase(i, { expected: JSON.parse(e.target.value) }); }
                      catch { updateCase(i, { expected: e.target.value }); }
                    }}
                    className='h-8 border-input/60 font-mono text-sm'
                  />
                </div>
              </>
            ) : (
              <>
                <div className='space-y-1'>
                  <label className='text-[10px] font-medium opacity-50'>Input (stdin)</label>
                  <Textarea
                    placeholder='stdin input for the program'
                    value={tc.input ?? ''}
                    onChange={(e) => updateCase(i, { input: e.target.value })}
                    className='font-mono text-sm min-h-16 border-input/60'
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-medium opacity-50'>Expected Output (stdout)</label>
                  <Textarea
                    placeholder='expected stdout'
                    value={tc.expectedOutput ?? ''}
                    onChange={(e) => updateCase(i, { expectedOutput: e.target.value })}
                    className='font-mono text-sm min-h-16 border-input/60'
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      <Button type='button' variant='outline' size='sm' onClick={addCase} className='gap-1.5 text-xs'>
        <Plus size={11} /> Add Test Case
      </Button>
    </div>
  );
}
