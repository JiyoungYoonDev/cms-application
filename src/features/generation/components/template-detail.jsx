'use client';

import { useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff, Copy,
  ChevronDown, ChevronRight, Play, GitCompare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmtDate } from '../utils/formatters';
import { useTemplateVersions, useActivateVersion } from '../hooks/use-prompt-templates';
import { ContentViewer, DraftEditor, DiffViewer, VersionMetricsPanel } from './template-version-panels';

// ══════════════════════════════════════════
// TEMPLATE DETAIL PAGE
// ══════════════════════════════════════════

export default function TemplateDetail({ templateId, templateName, templateDescription, templateTaskType, onBack }) {
  const { data: res, isLoading } = useTemplateVersions(templateId);
  const versions = res?.data ?? [];
  const activateMutation = useActivateVersion();

  const [viewingContent, setViewingContent] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [diffPair, setDiffPair] = useState(null);
  const [expandedMetrics, setExpandedMetrics] = useState(null);
  const [confirmActivate, setConfirmActivate] = useState(null);

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
                const prevVersion = versions[idx + 1];
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

// ══════════════════════════════════════════
// VERSION ROW
// ══════════════════════════════════════════

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
            <button onClick={onViewContent}
              className='p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
              title='View content'>
              <Eye size={13} />
            </button>
            <button onClick={onDuplicate}
              className='p-1.5 rounded hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors'
              title='Duplicate as draft'>
              <Copy size={13} />
            </button>
            {prevVersion && (
              <button onClick={() => onDiff(v.id, prevVersion.id)}
                className='p-1.5 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-colors'
                title={`Compare with v${prevVersion.versionNumber}`}>
                <GitCompare size={13} />
              </button>
            )}
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
