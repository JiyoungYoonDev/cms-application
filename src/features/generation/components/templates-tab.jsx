'use client';

import { useState, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Zap, DollarSign,
  ChevronDown, ChevronRight, Play, GitCompare, ArrowLeft,
  ExternalLink, TrendingUp, Copy, Save, Eye, EyeOff, Pencil,
  X, AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  useTemplates,
  useTemplateVersions,
  useVersionDetail,
  useVersionMetrics,
  useCompareVersions,
  useActivateVersion,
  useCreateVersion,
} from '../hooks/use-prompt-templates';

// ── Helpers ──

function fmt(n) {
  if (n == null) return '-';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtPct(n) {
  if (n == null) return '-';
  return Number(n).toFixed(1) + '%';
}

function fmtMs(ms) {
  if (ms == null) return '-';
  if (ms >= 1_000) return (ms / 1_000).toFixed(1) + 's';
  return ms + 'ms';
}

function fmtCost(n) {
  if (n == null) return '-';
  return '$' + Number(n).toFixed(4);
}

function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const JOB_STATUS = {
  COMPLETED:           { color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  FAILED:              { color: 'text-red-600', bg: 'bg-red-500/10' },
  PARTIALLY_COMPLETED: { color: 'text-amber-600', bg: 'bg-amber-500/10' },
  IN_PROGRESS:         { color: 'text-blue-600', bg: 'bg-blue-500/10' },
};

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

function ContentViewer({ versionId, onClose }) {
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

function DraftEditor({ templateId, sourceVersionId, sourceVersionNumber, onClose, onSaved }) {
  const { data: res, isLoading: loadingSource } = useVersionDetail(sourceVersionId);
  const sourceContent = res?.data?.content ?? '';

  const [content, setContent] = useState(null); // null = not yet initialized from source
  const [changeNotes, setChangeNotes] = useState('');
  const createMutation = useCreateVersion();

  // Initialize content from source once loaded
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
          {/* Change notes */}
          <div className='px-4 py-2 border-b bg-muted/10'>
            <input
              type='text'
              placeholder='Change notes (e.g., "Improved algorithm overlay conciseness")'
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className='w-full text-xs bg-transparent border-none outline-none placeholder:text-muted-foreground/50'
            />
          </div>
          {/* Content editor */}
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

function VersionMetricsPanel({ versionId }) {
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

      {/* Recent jobs */}
      {(m.recentJobs ?? []).length > 0 && (
        <div>
          <h5 className='text-[11px] font-semibold text-muted-foreground mb-1.5'>Recent Jobs Using This Version</h5>
          <div className='space-y-1'>
            {m.recentJobs.map((j) => {
              const s = JOB_STATUS[j.status] ?? {};
              return (
                <div key={j.jobId} className='flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg border bg-card'>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${s.bg ?? 'bg-muted'} ${s.color ?? ''}`}>
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

      {/* Recent outputs */}
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

function DiffViewer({ versionA, versionB, onClose }) {
  const { data: res, isLoading } = useCompareVersions(versionA, versionB);
  const diff = res?.data ?? {};

  if (isLoading) return <div className='h-40 rounded-lg bg-muted animate-pulse' />;

  const linesA = (diff.contentA ?? '').split('\n');
  const linesB = (diff.contentB ?? '').split('\n');
  const maxLines = Math.max(linesA.length, linesB.length);

  // Build simple line-by-line diff
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

// ══════════════════════════════════════════
// TEMPLATE DETAIL PAGE
// ══════════════════════════════════════════

function TemplateDetail({ templateId, templateName, templateDescription, templateTaskType, onBack }) {
  const { data: res, isLoading } = useTemplateVersions(templateId);
  const versions = res?.data ?? [];
  const activateMutation = useActivateVersion();

  const [viewingContent, setViewingContent] = useState(null);    // versionId
  const [editingDraft, setEditingDraft] = useState(null);        // { versionId, versionNumber }
  const [diffPair, setDiffPair] = useState(null);                // { a, b }
  const [expandedMetrics, setExpandedMetrics] = useState(null);  // versionId
  const [confirmActivate, setConfirmActivate] = useState(null);  // versionId

  const activeVersion = versions.find(v => v.isActive);

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[...Array(4)].map((_, i) => <div key={i} className='h-14 rounded-lg bg-muted animate-pulse' />)}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button onClick={onBack} className='p-1.5 rounded-lg hover:bg-muted transition-colors'>
          <ArrowLeft size={18} />
        </button>
        <div className='flex-1'>
          <h2 className='text-lg font-bold'>{templateName}</h2>
          <p className='text-xs text-muted-foreground'>
            {templateDescription}
            {' · '}
            <Badge variant='outline' className='text-[9px]'>{templateTaskType}</Badge>
            {' · '}
            {versions.length} versions · Active: {activeVersion ? `v${activeVersion.versionNumber}` : 'none'}
          </p>
        </div>
      </div>

      {/* Active version card */}
      {activeVersion && (
        <div className='rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-500/5 p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 size={16} className='text-emerald-600' />
              <span className='text-sm font-semibold'>Active: v{activeVersion.versionNumber}</span>
              <Badge className='text-[10px] bg-emerald-500 text-white'>ACTIVE</Badge>
              <span className='text-[10px] text-muted-foreground'>{activeVersion.contentLength} chars</span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setViewingContent(viewingContent === activeVersion.id ? null : activeVersion.id)}
                className='inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md border hover:bg-muted transition-colors'
              >
                {viewingContent === activeVersion.id ? <EyeOff size={12} /> : <Eye size={12} />}
                {viewingContent === activeVersion.id ? 'Hide' : 'View Content'}
              </button>
              <button
                onClick={() => {
                  setEditingDraft({ versionId: activeVersion.id, versionNumber: activeVersion.versionNumber });
                  setViewingContent(null);
                  setDiffPair(null);
                }}
                className='inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors'
              >
                <Copy size={12} />
                Duplicate as Draft
              </button>
            </div>
          </div>
          {activeVersion.changeNotes && (
            <p className='text-xs text-muted-foreground'>{activeVersion.changeNotes}</p>
          )}
          <p className='text-[10px] text-muted-foreground'>
            by {activeVersion.createdBy} · {fmtDate(activeVersion.createdAt)}
          </p>
          {/* Inline metrics */}
          <VersionMetricsPanel versionId={activeVersion.id} />
        </div>
      )}

      {/* Content viewer (lazy-loaded) */}
      {viewingContent && (
        <ContentViewer versionId={viewingContent} onClose={() => setViewingContent(null)} />
      )}

      {/* Draft editor */}
      {editingDraft && (
        <DraftEditor
          templateId={templateId}
          sourceVersionId={editingDraft.versionId}
          sourceVersionNumber={editingDraft.versionNumber}
          onClose={() => setEditingDraft(null)}
          onSaved={() => setEditingDraft(null)}
        />
      )}

      {/* Diff viewer */}
      {diffPair && (
        <DiffViewer versionA={diffPair.a} versionB={diffPair.b} onClose={() => setDiffPair(null)} />
      )}

      {/* Version history */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground mb-3'>Version History ({versions.length})</h3>
        <div className='rounded-xl border bg-card overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/30'>
                <th className='text-left px-4 py-2 font-medium text-muted-foreground'>Version</th>
                <th className='text-left px-2 py-2 font-medium text-muted-foreground'>Notes</th>
                <th className='text-right px-2 py-2 font-medium text-muted-foreground'>Size</th>
                <th className='text-right px-2 py-2 font-medium text-muted-foreground'>Created</th>
                <th className='text-center px-2 py-2 font-medium text-muted-foreground'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {versions.map((v, idx) => {
                const isActive = v.isActive;
                const prevVersion = versions[idx + 1]; // versions are desc, so idx+1 is the previous
                const isMetricsOpen = expandedMetrics === v.id;

                return (
                  <VersionRow
                    key={v.id}
                    v={v}
                    isActive={isActive}
                    prevVersion={prevVersion}
                    isMetricsOpen={isMetricsOpen}
                    confirmActivate={confirmActivate}
                    onViewContent={() => {
                      setViewingContent(viewingContent === v.id ? null : v.id);
                      setEditingDraft(null);
                      setDiffPair(null);
                    }}
                    onDuplicate={() => {
                      setEditingDraft({ versionId: v.id, versionNumber: v.versionNumber });
                      setViewingContent(null);
                      setDiffPair(null);
                    }}
                    onDiff={(a, b) => {
                      setDiffPair(diffPair?.a === a && diffPair?.b === b ? null : { a, b });
                      setViewingContent(null);
                      setEditingDraft(null);
                    }}
                    onActivate={(vId) => {
                      if (confirmActivate === vId) {
                        activateMutation.mutate(vId);
                        setConfirmActivate(null);
                      } else {
                        setConfirmActivate(vId);
                      }
                    }}
                    onCancelActivate={() => setConfirmActivate(null)}
                    activating={activateMutation.isPending}
                    onToggleMetrics={() => setExpandedMetrics(isMetricsOpen ? null : v.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational note */}
      <div className='rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-500/5 px-4 py-3'>
        <p className='text-[11px] text-blue-600 dark:text-blue-400 font-medium mb-1'>Prompt versioning workflow</p>
        <p className='text-[10px] text-muted-foreground leading-relaxed'>
          1. Read active version content
          {' → '}2. Duplicate as draft
          {' → '}3. Edit content
          {' → '}4. Save (creates new inactive version)
          {' → '}5. Compare with previous
          {' → '}6. Activate when ready.
          <br />
          Never edit the active version directly — always create a new version so you can rollback if needed.
        </p>
      </div>
    </div>
  );
}

function VersionRow({
  v, isActive, prevVersion, isMetricsOpen, confirmActivate,
  onViewContent, onDuplicate, onDiff, onActivate, onCancelActivate, activating, onToggleMetrics,
}) {
  return (
    <>
      <tr className={`hover:bg-muted/20 transition-colors ${isActive ? 'bg-emerald-500/[.03]' : ''}`}>
        <td className='px-4 py-2.5'>
          <button onClick={onToggleMetrics} className='flex items-center gap-2 text-left'>
            {isMetricsOpen
              ? <ChevronDown size={12} className='text-muted-foreground' />
              : <ChevronRight size={12} className='text-muted-foreground' />}
            <span className='font-semibold'>v{v.versionNumber}</span>
            {isActive && <Badge className='text-[9px] bg-emerald-500 text-white px-1.5 py-0'>ACTIVE</Badge>}
          </button>
        </td>
        <td className='px-2 py-2.5 text-xs text-muted-foreground truncate max-w-[250px]'>
          {v.changeNotes || '-'}
        </td>
        <td className='px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground'>{v.contentLength} chars</td>
        <td className='px-2 py-2.5 text-right text-xs text-muted-foreground'>
          <span>{fmtDate(v.createdAt)}</span>
          {v.createdBy && <span className='block text-[10px]'>by {v.createdBy}</span>}
        </td>
        <td className='px-2 py-2.5'>
          <div className='flex items-center justify-center gap-1'>
            {/* View content */}
            <button onClick={onViewContent}
              className='p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
              title='View content'>
              <Eye size={13} />
            </button>
            {/* Duplicate as draft */}
            <button onClick={onDuplicate}
              className='p-1.5 rounded hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors'
              title='Duplicate as draft'>
              <Copy size={13} />
            </button>
            {/* Compare with previous */}
            {prevVersion && (
              <button onClick={() => onDiff(v.id, prevVersion.id)}
                className='p-1.5 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-colors'
                title={`Compare with v${prevVersion.versionNumber}`}>
                <GitCompare size={13} />
              </button>
            )}
            {/* Activate */}
            {!isActive && (
              confirmActivate === v.id ? (
                <div className='flex items-center gap-1 ml-1'>
                  <button
                    onClick={() => onActivate(v.id)}
                    disabled={activating}
                    className='text-[10px] px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors'
                  >
                    {activating ? '...' : 'Confirm'}
                  </button>
                  <button
                    onClick={onCancelActivate}
                    className='text-[10px] px-2 py-1 rounded border hover:bg-muted transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => onActivate(v.id)}
                  className='p-1.5 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors'
                  title='Activate this version'>
                  <Play size={13} />
                </button>
              )
            )}
          </div>
        </td>
      </tr>

      {/* Expanded: metrics + usage */}
      {isMetricsOpen && (
        <tr>
          <td colSpan={5} className='px-4 py-4 bg-muted/5 border-t border-muted/30'>
            <VersionMetricsPanel versionId={v.id} />
          </td>
        </tr>
      )}
    </>
  );
}

// ══════════════════════════════════════════
// TEMPLATE LIST
// ══════════════════════════════════════════

export default function TemplatesTab() {
  const { data: res, isLoading } = useTemplates();
  const templates = res?.data ?? [];
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const selected = templates.find(t => t.id === selectedTemplate);

  if (selectedTemplate && selected) {
    return (
      <TemplateDetail
        templateId={selectedTemplate}
        templateName={selected.name}
        templateDescription={selected.description}
        templateTaskType={selected.taskType}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <h3 className='text-sm font-semibold text-muted-foreground'>Prompt Templates ({templates.length})</h3>

      {isLoading ? (
        <div className='space-y-2'>
          {[...Array(3)].map((_, i) => <div key={i} className='h-16 rounded-lg bg-muted animate-pulse' />)}
        </div>
      ) : templates.length === 0 ? (
        <div className='text-sm text-muted-foreground p-10 text-center rounded-xl border bg-card'>
          No prompt templates yet. Templates are created by the PromptTemplateSeeder on startup.
        </div>
      ) : (
        <div className='rounded-xl border bg-card overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/30'>
                <th className='text-left px-4 py-2.5 font-medium text-muted-foreground'>Template</th>
                <th className='text-left px-2 py-2.5 font-medium text-muted-foreground'>Type</th>
                <th className='text-center px-2 py-2.5 font-medium text-muted-foreground'>Status</th>
                <th className='w-8' />
              </tr>
            </thead>
            <tbody className='divide-y'>
              {templates.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className='cursor-pointer hover:bg-muted/40 transition-colors group'
                >
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <FileText size={15} className='text-muted-foreground shrink-0' />
                      <div>
                        <p className='font-medium'>{t.name}</p>
                        <p className='text-xs text-muted-foreground'>{t.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-2 py-3'>
                    <Badge variant='outline' className='text-[10px]'>{t.taskType}</Badge>
                  </td>
                  <td className='px-2 py-3 text-center'>
                    <Badge variant='outline' className={`text-[10px] ${t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}`}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className='px-2'>
                    <ChevronRight size={14} className='text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
