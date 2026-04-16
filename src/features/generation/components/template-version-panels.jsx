'use client';

import { useState, useCallback } from 'react';
import {
  Eye, X, Pencil, Save, GitCompare,
  CheckCircle2, XCircle, Clock, Zap, DollarSign,
  TrendingUp, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmt, fmtPct, fmtMs, fmtCost, fmtDate } from '../utils/formatters';
import { JOB_STATUS_STYLE } from '../utils/job-helpers';
import {
  useVersionDetail,
  useVersionMetrics,
  useCompareVersions,
  useCreateVersion,
} from '../hooks/use-prompt-templates';

// ── Shared mini stat ──

function MiniStat({ icon: Icon, label, value, sub, color, alert }) {
  return (
    <div className={`rounded-lg border p-2.5 ${alert ? 'border-red-300 dark:border-red-800 bg-red-500/5' : 'bg-card'}`}>
      <div className='flex items-center gap-1.5 mb-0.5'>
        {Icon && <Icon size={11} className='text-muted-foreground' />}
        <p className='text-[10px] text-muted-foreground'>{label}</p>
      </div>
      <p className={`text-sm font-bold tabular-nums ${color ?? ''} ${alert ? 'text-red-600' : ''}`}>{value}</p>
      {sub && <p className='text-[10px] text-muted-foreground truncate'>{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════
// CONTENT VIEWER — read-only prompt display
// ══════════════════════════════════════════

export function ContentViewer({ versionId, onClose }) {
  const { data: res, isLoading } = useVersionDetail(versionId);
  const v = res?.data ?? {};

  return (
    <div className='rounded-xl border bg-card overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-2.5 border-b bg-muted/30'>
        <div className='flex items-center gap-2'>
          <Eye size={14} className='text-muted-foreground' />
          <span className='text-xs font-semibold'>
            v{v.versionNumber ?? '?'} Content
          </span>
          {v.isActive && <Badge className='text-[9px] bg-emerald-500 text-white px-1.5 py-0'>ACTIVE</Badge>}
          <span className='text-[10px] text-muted-foreground'>{v.contentLength ?? 0} chars</span>
        </div>
        <button onClick={onClose} className='p-1 rounded hover:bg-muted transition-colors'>
          <X size={14} className='text-muted-foreground' />
        </button>
      </div>
      {isLoading ? (
        <div className='h-40 bg-muted animate-pulse' />
      ) : (
        <pre className='text-[11px] leading-relaxed p-4 overflow-auto max-h-[500px] whitespace-pre-wrap font-mono text-foreground/90'>
          {v.content ?? 'No content'}
        </pre>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// DRAFT EDITOR — create new version from content
// ══════════════════════════════════════════

export function DraftEditor({ templateId, sourceVersionId, sourceVersionNumber, onClose, onSaved }) {
  const { data: res, isLoading: loadingSource } = useVersionDetail(sourceVersionId);
  const sourceContent = res?.data?.content ?? '';

  const [content, setContent] = useState(null);
  const [changeNotes, setChangeNotes] = useState('');
  const createMutation = useCreateVersion();

  const editorContent = content ?? sourceContent;

  const handleSave = useCallback(() => {
    if (!editorContent.trim()) return;
    createMutation.mutate(
      { templateId, payload: { content: editorContent, changeNotes, createdBy: 'admin' } },
      { onSuccess: () => { onSaved?.(); onClose(); } },
    );
  }, [templateId, editorContent, changeNotes, createMutation, onSaved, onClose]);

  return (
    <div className='rounded-xl border bg-card overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-2.5 border-b bg-amber-500/5'>
        <div className='flex items-center gap-2'>
          <Pencil size={14} className='text-amber-600' />
          <span className='text-xs font-semibold'>New Draft</span>
          <span className='text-[10px] text-muted-foreground'>
            based on v{sourceVersionNumber}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleSave}
            disabled={createMutation.isPending || !editorContent.trim()}
            className='inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors'
          >
            <Save size={12} />
            {createMutation.isPending ? 'Saving...' : 'Save as New Version'}
          </button>
          <button onClick={onClose} className='p-1 rounded hover:bg-muted transition-colors'>
            <X size={14} className='text-muted-foreground' />
          </button>
        </div>
      </div>

      {loadingSource ? (
        <div className='h-60 bg-muted animate-pulse' />
      ) : (
        <div className='space-y-0'>
          <div className='px-4 py-2 border-b bg-muted/10'>
            <input
              type='text'
              placeholder='Change notes (e.g., "Improved algorithm overlay conciseness")'
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className='w-full text-xs bg-transparent border-none outline-none placeholder:text-muted-foreground/50'
            />
          </div>
          <textarea
            value={editorContent}
            onChange={(e) => setContent(e.target.value)}
            className='w-full min-h-[400px] p-4 text-[11px] leading-relaxed font-mono bg-transparent border-none outline-none resize-y text-foreground/90'
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// VERSION METRICS
// ══════════════════════════════════════════

export function VersionMetricsPanel({ versionId }) {
  const { data: res, isLoading } = useVersionMetrics(versionId);
  const m = res?.data ?? {};

  if (isLoading) return <div className='h-40 rounded-lg bg-muted animate-pulse' />;
  if (!m.totalGenerations && m.totalGenerations !== 0) return null;

  if (m.totalGenerations === 0) {
    return (
      <div className='rounded-lg border bg-muted/20 p-4 text-center'>
        <p className='text-xs text-muted-foreground'>No generations with this version yet.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-3 lg:grid-cols-7 gap-2'>
        <MiniStat icon={TrendingUp} label='Generations' value={m.totalGenerations} />
        <MiniStat icon={CheckCircle2} label='Success' value={m.successCount} color='text-emerald-600' />
        <MiniStat icon={XCircle} label='Failed' value={m.failCount} alert={m.failCount > 0} />
        <MiniStat label='Success Rate' value={fmtPct(m.successRate)}
          color={Number(m.successRate) >= 80 ? 'text-emerald-600' : 'text-red-600'} />
        <MiniStat icon={Clock} label='Avg Latency' value={fmtMs(m.avgLatencyMs)} />
        <MiniStat icon={Zap} label='Avg Tokens' value={fmt((m.avgPromptTokens ?? 0) + (m.avgCompletionTokens ?? 0))}
          sub={`${fmt(m.avgPromptTokens)} in / ${fmt(m.avgCompletionTokens)} out`} />
        <MiniStat icon={DollarSign} label='Total Cost' value={fmtCost(m.totalCostUsd)}
          sub={`avg ${fmtCost(m.avgCostUsd)}/gen`} />
      </div>

      {(m.recentJobs ?? []).length > 0 && (
        <div>
          <h5 className='text-[11px] font-semibold text-muted-foreground mb-1.5'>Recent Jobs Using This Version</h5>
          <div className='space-y-1'>
            {m.recentJobs.map((j) => {
              const s = JOB_STATUS_STYLE[j.status] ?? {};
              return (
                <div key={j.jobId} className='flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg border bg-card'>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${s.bg ?? 'bg-muted'} ${s.text ?? ''}`}>
                    {j.status}
                  </span>
                  <span className='font-medium truncate flex-1'>{j.courseTitle ?? `Job #${j.jobId}`}</span>
                  <span className='text-muted-foreground'>{fmtDate(j.createdAt)}</span>
                  <a href={`/admin/courses/${j.jobId}`}
                    className='text-primary hover:underline flex items-center gap-0.5'
                    onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={9} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(m.recentOutputs ?? []).length > 0 && (
        <div>
          <h5 className='text-[11px] font-semibold text-muted-foreground mb-1.5'>Recent Outputs (last 10)</h5>
          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-[11px]'>
              <thead>
                <tr className='bg-muted/30 border-b'>
                  <th className='text-left px-2 py-1 font-medium text-muted-foreground'>Result</th>
                  <th className='text-left px-2 py-1 font-medium text-muted-foreground'>Parse</th>
                  <th className='text-left px-2 py-1 font-medium text-muted-foreground'>Finish</th>
                  <th className='text-right px-2 py-1 font-medium text-muted-foreground'>Latency</th>
                  <th className='text-right px-2 py-1 font-medium text-muted-foreground'>Tokens</th>
                  <th className='text-right px-2 py-1 font-medium text-muted-foreground'>Date</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {m.recentOutputs.map((o) => (
                  <tr key={o.outputId} className='hover:bg-muted/20'>
                    <td className='px-2 py-1'>
                      {o.success
                        ? <CheckCircle2 size={11} className='text-emerald-500' />
                        : <XCircle size={11} className='text-red-500' />}
                    </td>
                    <td className='px-2 py-1'>
                      <span className={o.parseStrategy && o.parseStrategy !== 'STRUCTURED_SCHEMA' ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
                        {o.parseStrategy ?? '-'}
                      </span>
                    </td>
                    <td className='px-2 py-1'>
                      <span className={o.finishReason === 'MAX_TOKENS' ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                        {o.finishReason ?? '-'}
                      </span>
                    </td>
                    <td className='px-2 py-1 text-right tabular-nums text-muted-foreground'>{fmtMs(o.latencyMs)}</td>
                    <td className='px-2 py-1 text-right tabular-nums text-muted-foreground'>{fmt(o.promptTokens)}+{fmt(o.completionTokens)}</td>
                    <td className='px-2 py-1 text-right text-muted-foreground'>{fmtDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// INLINE DIFF VIEWER
// ══════════════════════════════════════════

export function DiffViewer({ versionA, versionB, onClose }) {
  const { data: res, isLoading } = useCompareVersions(versionA, versionB);
  const diff = res?.data ?? {};

  if (isLoading) return <div className='h-40 rounded-lg bg-muted animate-pulse' />;

  const linesA = (diff.contentA ?? '').split('\n');
  const linesB = (diff.contentB ?? '').split('\n');
  const maxLines = Math.max(linesA.length, linesB.length);

  const diffLines = [];
  for (let i = 0; i < maxLines; i++) {
    const a = i < linesA.length ? linesA[i] : null;
    const b = i < linesB.length ? linesB[i] : null;
    if (a === b) {
      diffLines.push({ type: 'same', line: a, num: i + 1 });
    } else {
      if (a != null) diffLines.push({ type: 'removed', line: a, num: i + 1 });
      if (b != null) diffLines.push({ type: 'added', line: b, num: i + 1 });
    }
  }

  return (
    <div className='rounded-xl border bg-card overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-2.5 border-b bg-muted/30'>
        <div className='flex items-center gap-2'>
          <GitCompare size={14} className='text-muted-foreground' />
          <span className='text-xs font-semibold'>
            v{diff.versionA?.versionNumber} vs v{diff.versionB?.versionNumber}
          </span>
          <div className='flex items-center gap-2 ml-3'>
            <span className='text-[10px] text-emerald-600'>+{diff.added ?? 0} added</span>
            <span className='text-[10px] text-red-600'>-{diff.removed ?? 0} removed</span>
            <span className='text-[10px] text-amber-600'>~{diff.changed ?? 0} changed</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className='p-1 rounded hover:bg-muted transition-colors'>
            <X size={14} className='text-muted-foreground' />
          </button>
        )}
      </div>
      <div className='overflow-auto max-h-[400px]'>
        <pre className='text-[10px] leading-[1.6] font-mono p-0 m-0'>
          {diffLines.map((d, i) => {
            let bg = '';
            let prefix = ' ';
            let textColor = 'text-foreground/80';
            if (d.type === 'added') { bg = 'bg-emerald-500/10'; prefix = '+'; textColor = 'text-emerald-600'; }
            if (d.type === 'removed') { bg = 'bg-red-500/10'; prefix = '-'; textColor = 'text-red-600'; }
            return (
              <div key={i} className={`px-4 py-0 ${bg} flex`}>
                <span className='text-muted-foreground/40 w-8 shrink-0 select-none text-right pr-2'>{d.num}</span>
                <span className={`${textColor} select-none w-3 shrink-0`}>{prefix}</span>
                <span className={textColor}>{d.line}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
