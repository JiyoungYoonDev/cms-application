'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { getGenerationOutput } from '../services/generation-admin-service';
import { fmt, fmtMs } from '../utils/formatters';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
    >
      {copied ? <Check size={10} className='text-emerald-500' /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CollapsibleSection({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='rounded-lg border bg-card'>
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-left hover:bg-muted/30 transition-colors'
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
        {badge && <Badge variant='outline' className='text-[10px] ml-auto'>{badge}</Badge>}
      </button>
      {open && <div className='border-t px-4 py-3'>{children}</div>}
    </div>
  );
}

function JsonBlock({ value }) {
  let formatted;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    formatted = value;
  }
  return (
    <div className='relative'>
      <div className='absolute top-2 right-2'><CopyButton text={formatted} /></div>
      <pre className='text-xs font-mono bg-muted/30 rounded-lg p-4 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap break-all'>
        {formatted}
      </pre>
    </div>
  );
}

export default function OutputViewer({ outputId }) {
  const router = useRouter();
  const { data: res, isLoading, error } = useQuery({
    queryKey: ['generation', 'output', outputId],
    queryFn: () => getGenerationOutput(outputId),
    enabled: !!outputId,
  });

  const d = res?.data ?? {};

  return (
    <div className='space-y-6 max-w-5xl'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button onClick={() => router.back()} className='p-1.5 rounded-lg hover:bg-muted transition-colors'>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className='text-lg font-bold'>Generation Output #{outputId}</h2>
          <p className='text-xs text-muted-foreground'>
            {d.modelName} · {d.taskType} · {d.finishReason ?? 'unknown'}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className='space-y-3'>
          {[...Array(4)].map((_, i) => <div key={i} className='h-20 rounded-lg bg-muted animate-pulse' />)}
        </div>
      )}

      {error && (
        <div className='rounded-lg border border-red-300 dark:border-red-800 bg-red-500/5 p-4'>
          <p className='text-sm text-red-600'>Failed to load output: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && d.outputId && (
        <>
          {/* Metadata grid */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              { label: 'Model', value: d.modelName },
              { label: 'Task Type', value: d.taskType },
              { label: 'Parse Strategy', value: d.parseStrategy },
              { label: 'Finish Reason', value: d.finishReason, color: d.finishReason === 'MAX_TOKENS' ? 'text-red-600' : d.finishReason === 'STOP' ? 'text-emerald-600' : '' },
              { label: 'Prompt Tokens', value: fmt(d.promptTokens) },
              { label: 'Completion Tokens', value: fmt(d.candidatesTokens) },
              { label: 'Thinking Tokens', value: fmt(d.thinkingTokens) },
              { label: 'Latency', value: fmtMs(d.latencyMs) },
              { label: 'Cost', value: d.estimatedCostUsd != null ? '$' + Number(d.estimatedCostUsd).toFixed(4) : '-' },
              { label: 'Success', value: d.success ? 'Yes' : 'No', color: d.success ? 'text-emerald-600' : 'text-red-600' },
              { label: 'Created', value: d.createdAt ? new Date(d.createdAt).toLocaleString() : '-' },
            ].map((item) => (
              <div key={item.label} className='rounded border bg-card p-2.5'>
                <p className='text-[10px] text-muted-foreground'>{item.label}</p>
                <p className={`text-sm font-medium tabular-nums ${item.color ?? ''}`}>{item.value ?? '-'}</p>
              </div>
            ))}
          </div>

          {/* Error */}
          {d.errorMessage && (
            <div className='rounded-lg border border-red-300 dark:border-red-800 bg-red-500/5 px-4 py-3'>
              <p className='text-[10px] font-semibold text-red-600 mb-1'>Error Message</p>
              <p className='text-xs text-red-500 font-mono break-all'>{d.errorMessage}</p>
            </div>
          )}

          {/* System Prompt */}
          <CollapsibleSection title='System Prompt' badge={d.systemPrompt ? `${d.systemPrompt.length} chars` : null}>
            <div className='relative'>
              <div className='absolute top-2 right-2'><CopyButton text={d.systemPrompt} /></div>
              <pre className='text-xs font-mono bg-muted/30 rounded-lg p-4 overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap'>
                {d.systemPrompt ?? 'N/A'}
              </pre>
            </div>
          </CollapsibleSection>

          {/* User Prompt */}
          <CollapsibleSection title='User Prompt' badge={d.userPrompt ? `${d.userPrompt.length} chars` : null}>
            <div className='relative'>
              <div className='absolute top-2 right-2'><CopyButton text={d.userPrompt} /></div>
              <pre className='text-xs font-mono bg-muted/30 rounded-lg p-4 overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap'>
                {d.userPrompt ?? 'N/A'}
              </pre>
            </div>
          </CollapsibleSection>

          {/* Raw AI Response */}
          <CollapsibleSection title='Raw AI Response' badge={d.rawOutput ? `${d.rawOutput.length} chars` : null} defaultOpen>
            <JsonBlock value={d.rawOutput} />
          </CollapsibleSection>

          {/* Parsed Output */}
          <CollapsibleSection title='Parsed Output' badge={d.parsedOutput ? `${d.parsedOutput.length} chars` : null}>
            <JsonBlock value={d.parsedOutput} />
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}
