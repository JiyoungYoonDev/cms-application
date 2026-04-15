'use client';

import { useState } from 'react';
import {
  Activity, Zap, DollarSign, Clock, AlertTriangle,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Target,
  ChevronRight, Layers, TrendingUp, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGenerationOverview, useGenerationJobs } from '../hooks/use-generation-overview';
import JobDetailPanel from './job-detail-panel';
import DrillDownPanel from './drill-down-panel';
import TokenBreakdownPanel from './token-breakdown-panel';
import CostBreakdownPanel from './cost-breakdown-panel';
import LatencyBreakdownPanel from './latency-breakdown-panel';

// ── Helpers ──

function fmt(n) {
  if (n == null) return '-';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtCost(n) {
  if (n == null) return '-';
  return '$' + Number(n).toFixed(4);
}

function fmtMs(ms) {
  if (ms == null) return '-';
  if (ms >= 60_000) return (ms / 60_000).toFixed(1) + 'm';
  if (ms >= 1_000) return (ms / 1_000).toFixed(1) + 's';
  return ms + 'ms';
}

function fmtPct(n) {
  if (n == null) return '-';
  return Number(n).toFixed(1) + '%';
}

function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const JOB_STATUS = {
  COMPLETED:             { color: 'bg-emerald-500/10 text-emerald-600', label: 'Completed' },
  FAILED:                { color: 'bg-red-500/10 text-red-600', label: 'Failed' },
  PARTIALLY_COMPLETED:   { color: 'bg-amber-500/10 text-amber-600', label: 'Partial' },
  IN_PROGRESS:           { color: 'bg-blue-500/10 text-blue-600', label: 'Running' },
  PENDING:               { color: 'bg-muted text-muted-foreground', label: 'Pending' },
};

const JOB_TYPE = {
  COURSE:  { color: 'bg-violet-500/10 text-violet-600 border-violet-200', label: 'Course' },
  SECTION: { color: 'bg-sky-500/10 text-sky-600 border-sky-200', label: 'Section' },
  LECTURE: { color: 'bg-teal-500/10 text-teal-600 border-teal-200', label: 'Lecture' },
  ITEM:    { color: 'bg-orange-500/10 text-orange-600 border-orange-200', label: 'Item' },
};

// ── Stat Card ──

function StatCard({ icon: Icon, label, value, sub, color = 'bg-primary/10 text-primary', alert, onClick, active }) {
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-card p-4 flex items-start gap-3 transition-all
        ${alert ? 'border-red-300 dark:border-red-800' : ''}
        ${active ? 'ring-2 ring-primary border-primary' : ''}
        ${clickable ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : ''}
      `}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={17} />
      </div>
      <div className='min-w-0'>
        <p className='text-xs text-muted-foreground font-medium'>{label}</p>
        <p className='text-xl font-bold mt-0.5'>{value}</p>
        {sub && <p className='text-xs text-muted-foreground mt-0.5'>{sub}</p>}
        {clickable && <p className='text-[10px] text-primary mt-0.5'>Click for details</p>}
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className='h-20 rounded-xl bg-muted animate-pulse' />;
}

// ── Job Status Distribution Bar ──

function StatusDistribution({ ov }) {
  const total = ov.totalJobs ?? 0;
  if (total === 0) return null;

  const segments = [
    { key: 'completed', count: ov.completedJobs ?? 0, color: 'bg-emerald-500', label: 'Completed' },
    { key: 'partial', count: ov.partialJobs ?? 0, color: 'bg-amber-400', label: 'Partial' },
    { key: 'failed', count: ov.failedJobs ?? 0, color: 'bg-red-500', label: 'Failed' },
    { key: 'running', count: ov.runningJobs ?? 0, color: 'bg-blue-400', label: 'Running' },
    { key: 'pending', count: ov.pendingJobs ?? 0, color: 'bg-muted-foreground/30', label: 'Pending' },
  ].filter(s => s.count > 0);

  return (
    <div>
      <div className='flex rounded-full overflow-hidden h-2.5 gap-0.5'>
        {segments.map(s => (
          <div key={s.key} className={`${s.color} transition-all`} style={{ width: `${(s.count / total) * 100}%` }} />
        ))}
      </div>
      <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap'>
        {segments.map(s => (
          <span key={s.key} className='flex items-center gap-1'>
            <span className={`w-2 h-2 rounded-full ${s.color} inline-block`} />
            {s.count} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Failure Analysis ──

function FailureAnalysis({ ov }) {
  const reasons = ov.topFailureReasons ?? [];
  const problemJobs = ov.problemJobs ?? [];

  if (reasons.length === 0 && problemJobs.length === 0) return null;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {/* Top failure reasons */}
      {reasons.length > 0 && (
        <div className='rounded-xl border bg-card p-4'>
          <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
            <AlertTriangle size={13} className='text-red-500' />
            Top Failure Reasons
          </h4>
          <div className='space-y-2'>
            {reasons.map((r, i) => {
              const maxCount = reasons[0]?.count ?? 1;
              return (
                <div key={i}>
                  <div className='flex items-center justify-between text-sm mb-0.5'>
                    <span className='truncate mr-2'>{r.reason}</span>
                    <span className='font-bold text-red-600 tabular-nums shrink-0'>{r.count}</span>
                  </div>
                  <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full bg-red-500/60 rounded-full' style={{ width: `${(r.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Problem jobs list */}
      {problemJobs.length > 0 && (
        <div className='rounded-xl border bg-card p-4'>
          <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
            <XCircle size={13} className='text-red-500' />
            Failed / Partial Jobs
          </h4>
          <div className='space-y-2'>
            {problemJobs.map((j) => {
              const isFailed = j.status === 'FAILED';
              return (
                <div key={j.jobId} className={`rounded-lg p-2.5 border-l-2 ${isFailed ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-400 bg-amber-500/5'}`}>
                  <div className='flex items-center justify-between mb-0.5'>
                    <span className='text-sm font-medium truncate mr-2'>{j.courseTitle ?? `Job #${j.jobId}`}</span>
                    <Badge variant='outline' className={`text-[10px] ${isFailed ? 'text-red-600 border-red-300' : 'text-amber-600 border-amber-300'}`}>
                      {j.status}
                    </Badge>
                  </div>
                  {j.totalLectures != null && (
                    <p className='text-xs text-muted-foreground'>
                      Lectures: {j.completedLectures ?? 0}/{j.totalLectures}
                      {(j.failedLectures ?? 0) > 0 && <span className='text-red-500'> ({j.failedLectures} failed)</span>}
                    </p>
                  )}
                  {j.errorMessage && (
                    <p className='text-xs text-red-500 truncate mt-0.5'>{j.errorMessage}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 7-Day Trend ──

function DailyTrend({ ov }) {
  const trend = ov.dailyTrend ?? [];
  if (trend.length === 0) return null;

  const maxDay = Math.max(...trend.map(d => (d.completed ?? 0) + (d.failed ?? 0) + (d.partial ?? 0)), 1);

  return (
    <div className='rounded-xl border bg-card p-4'>
      <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
        <TrendingUp size={13} />
        Last 7 Days
      </h4>
      <div className='flex items-end gap-1.5 h-20'>
        {trend.map((d) => {
          const c = d.completed ?? 0;
          const f = d.failed ?? 0;
          const p = d.partial ?? 0;
          const total = c + f + p;
          const height = total > 0 ? Math.max((total / maxDay) * 100, 8) : 4;
          const dayLabel = d.date?.slice(5); // "04-02"

          return (
            <div key={d.date} className='flex-1 flex flex-col items-center gap-1' title={`${d.date}: ${c}C ${f}F ${p}P`}>
              <div className='w-full flex flex-col-reverse gap-px rounded-sm overflow-hidden' style={{ height: `${height}%` }}>
                {c > 0 && <div className='bg-emerald-500 flex-grow' style={{ flex: c }} />}
                {p > 0 && <div className='bg-amber-400 flex-grow' style={{ flex: p }} />}
                {f > 0 && <div className='bg-red-500 flex-grow' style={{ flex: f }} />}
                {total === 0 && <div className='bg-muted w-full h-full' />}
              </div>
              <span className='text-[9px] text-muted-foreground'>{dayLabel}</span>
            </div>
          );
        })}
      </div>
      <div className='flex items-center gap-3 mt-2 text-[10px] text-muted-foreground'>
        <span className='flex items-center gap-1'><span className='w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block' />Completed</span>
        <span className='flex items-center gap-1'><span className='w-1.5 h-1.5 rounded-full bg-amber-400 inline-block' />Partial</span>
        <span className='flex items-center gap-1'><span className='w-1.5 h-1.5 rounded-full bg-red-500 inline-block' />Failed</span>
      </div>
    </div>
  );
}

// ── Component ──

export default function OverviewTab() {
  const { data: overviewRes, isLoading: loadingOverview } = useGenerationOverview();
  const { data: jobsRes, isLoading: loadingJobs } = useGenerationJobs();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drillDown, setDrillDown] = useState(null); // 'truncations' | 'partial' | 'parseRepair' | 'matchRate' | 'retries' | null
  const [showTokenBreakdown, setShowTokenBreakdown] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showLatencyBreakdown, setShowLatencyBreakdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null); // 'COURSE' | 'SECTION' | 'LECTURE' | 'ITEM' | null

  const ov = overviewRes?.data ?? {};
  const allJobs = jobsRes?.data ?? [];
  const jobs = typeFilter ? allJobs.filter(j => j.jobType === typeFilter) : allJobs;

  if (selectedJobId) {
    return <JobDetailPanel jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />;
  }

  return (
    <div className='space-y-6'>
      {/* Row 1: Job status + success rate */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground mb-3'>Generation Summary</h3>
        {loadingOverview ? (
          <div className='grid grid-cols-2 lg:grid-cols-5 gap-3'>
            {[...Array(5)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4'>
              <StatCard icon={Layers} label='Total Jobs' value={ov.totalJobs ?? 0}
                sub={`${ov.finishedJobs ?? 0} finished, ${ov.runningJobs ?? 0} running`}
                color='bg-primary/10 text-primary' />
              <StatCard icon={CheckCircle2} label='Success Rate'
                value={fmtPct(ov.successRate)}
                sub={`${ov.completedJobs ?? 0}/${ov.finishedJobs ?? 0} finished jobs`}
                color={Number(ov.successRate) >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}
                alert={Number(ov.successRate) < 50 && (ov.finishedJobs ?? 0) > 0} />
              <StatCard icon={Zap} label='Total Tokens' value={fmt(ov.totalTokens)}
                sub={`${fmt(ov.totalPromptTokens)} in / ${fmt(ov.totalCompletionTokens)} out`}
                color='bg-violet-500/10 text-violet-600'
                onClick={() => setShowTokenBreakdown(v => !v)}
                active={showTokenBreakdown} />
              <StatCard icon={DollarSign} label='Total Cost' value={fmtCost(ov.totalCostUsd)}
                color='bg-amber-500/10 text-amber-600'
                onClick={() => setShowCostBreakdown(v => !v)}
                active={showCostBreakdown} />
              <StatCard icon={Clock} label='Avg Latency' value={fmtMs(ov.avgLatencyMs)}
                sub={`p50 ${fmtMs(ov.p50LatencyMs)} · p95 ${fmtMs(ov.p95LatencyMs)}`}
                color='bg-sky-500/10 text-sky-600'
                onClick={() => setShowLatencyBreakdown(v => !v)}
                active={showLatencyBreakdown} />
            </div>

            {/* Status distribution bar */}
            <StatusDistribution ov={ov} />

            {/* Token breakdown drill-down */}
            {showTokenBreakdown && (
              <div className='mt-3'>
                <TokenBreakdownPanel data={ov} onClose={() => setShowTokenBreakdown(false)} />
              </div>
            )}

            {/* Cost breakdown drill-down */}
            {showCostBreakdown && (
              <div className='mt-3'>
                <CostBreakdownPanel data={ov} onClose={() => setShowCostBreakdown(false)} />
              </div>
            )}

            {/* Latency breakdown drill-down */}
            {showLatencyBreakdown && (
              <div className='mt-3'>
                <LatencyBreakdownPanel data={ov} onClose={() => setShowLatencyBreakdown(false)} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Row 2: Batch quality */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground mb-3'>Batch Quality</h3>
        {loadingOverview ? (
          <div className='grid grid-cols-2 lg:grid-cols-5 gap-3'>
            {[...Array(5)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-5 gap-3'>
              <StatCard icon={AlertTriangle} label='Truncations' value={ov.truncationCount ?? 0}
                sub={`${ov.totalBatches ?? 0} total batches`}
                color={ov.truncationCount > 0 ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}
                alert={ov.truncationCount > 0}
                onClick={() => setDrillDown(drillDown === 'truncations' ? null : 'truncations')}
                active={drillDown === 'truncations'} />
              <StatCard icon={AlertCircle} label='Partial Rate' value={fmtPct(ov.partialRate)}
                sub='batches with unmatched items'
                color={Number(ov.partialRate) > 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}
                onClick={() => setDrillDown(drillDown === 'partial' ? null : 'partial')}
                active={drillDown === 'partial'} />
              <StatCard icon={Activity} label='Parse Repairs' value={ov.parseRepairCount ?? 0}
                sub='fallback parse used'
                color={ov.parseRepairCount > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}
                onClick={() => setDrillDown(drillDown === 'parseRepair' ? null : 'parseRepair')}
                active={drillDown === 'parseRepair'} />
              <StatCard icon={Target} label='Avg Match Rate' value={fmtPct(ov.avgMatchedRatio)}
                color={Number(ov.avgMatchedRatio) >= 90 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}
                onClick={() => setDrillDown(drillDown === 'matchRate' ? null : 'matchRate')}
                active={drillDown === 'matchRate'} />
              <StatCard icon={RefreshCw} label='Total Retries' value={ov.totalRetries ?? 0}
                color='bg-slate-500/10 text-slate-600'
                onClick={() => setDrillDown(drillDown === 'retries' ? null : 'retries')}
                active={drillDown === 'retries'} />
            </div>

            {/* Drill-down panel */}
            {drillDown && (
              <div className='mt-3'>
                <DrillDownPanel metricKey={drillDown} data={ov} onClose={() => setDrillDown(null)} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Row 3: Failure analysis + 7-day trend */}
      {!loadingOverview && (
        <div className='space-y-4'>
          <FailureAnalysis ov={ov} />
          <DailyTrend ov={ov} />
        </div>
      )}

      {/* Jobs table */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>
            Generation Jobs{typeFilter ? ` (${jobs.length} of ${allJobs.length})` : ` (${allJobs.length})`}
          </h3>
          <div className='flex items-center gap-1'>
            {['COURSE', 'SECTION', 'LECTURE', 'ITEM'].map((t) => {
              const jt = JOB_TYPE[t];
              const isActive = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(isActive ? null : t)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors
                    ${isActive ? jt.color + ' border-current' : 'text-muted-foreground border-transparent hover:border-muted-foreground/30'}
                  `}
                >
                  {jt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className='rounded-xl border bg-card overflow-hidden'>
          {loadingJobs ? (
            <div className='p-6 space-y-3'>
              {[...Array(4)].map((_, i) => <div key={i} className='h-12 rounded bg-muted animate-pulse' />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className='p-10 text-center text-sm text-muted-foreground'>No generation jobs yet.</div>
          ) : (
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-muted/30'>
                  <th className='text-left px-4 py-2.5 font-medium text-muted-foreground'>Course</th>
                  <th className='text-left px-4 py-2.5 font-medium text-muted-foreground'>Type</th>
                  <th className='text-left px-4 py-2.5 font-medium text-muted-foreground'>Status</th>
                  <th className='text-right px-4 py-2.5 font-medium text-muted-foreground'>Lectures</th>
                  <th className='text-right px-4 py-2.5 font-medium text-muted-foreground'>Tokens</th>
                  <th className='text-right px-4 py-2.5 font-medium text-muted-foreground'>Cost</th>
                  <th className='text-center px-4 py-2.5 font-medium text-muted-foreground'>Quality</th>
                  <th className='text-right px-4 py-2.5 font-medium text-muted-foreground'>Date</th>
                  <th className='w-8' />
                </tr>
              </thead>
              <tbody className='divide-y'>
                {jobs.map((job) => {
                  const s = JOB_STATUS[job.status] ?? JOB_STATUS.PENDING;
                  return (
                    <tr
                      key={job.jobId}
                      onClick={() => setSelectedJobId(job.jobId)}
                      className='hover:bg-muted/40 cursor-pointer transition-colors group'
                    >
                      <td className='px-4 py-3'>
                        <p className='font-medium truncate max-w-[240px]'>{job.courseTitle ?? '-'}</p>
                        {job.sectionTitle && (
                          <p className='text-xs text-muted-foreground truncate max-w-[240px]'>§ {job.sectionTitle}</p>
                        )}
                        {job.lectureTitle && (
                          <p className='text-xs text-muted-foreground truncate max-w-[240px]'>↳ {job.lectureTitle}</p>
                        )}
                        {!job.sectionTitle && !job.lectureTitle && (
                          <p className='text-xs text-muted-foreground'>{job.modelName}</p>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        {(() => {
                          const jt = JOB_TYPE[job.jobType];
                          return jt
                            ? <Badge variant='outline' className={jt.color}>{jt.label}</Badge>
                            : <span className='text-xs text-muted-foreground'>-</span>;
                        })()}
                      </td>
                      <td className='px-4 py-3'>
                        <Badge variant='outline' className={s.color}>{s.label}</Badge>
                      </td>
                      <td className='px-4 py-3 text-right tabular-nums'>
                        {job.totalLectures == null || job.totalLectures === 0 ? (
                          <span className='text-xs text-muted-foreground italic'>
                            {job.status === 'RUNNING' ? 'Generating structure…' :
                             job.status === 'PENDING' ? 'Pending' :
                             job.status === 'FAILED' && !job.completedLectures ? 'Structure failed' : '-'}
                          </span>
                        ) : (
                          <>
                            <span className='text-emerald-600'>{job.completedLectures ?? 0}</span>
                            {' / '}
                            {job.totalLectures}
                            {(job.failedLectures ?? 0) > 0 && (
                              <span className='text-red-500 ml-1'>({job.failedLectures}F)</span>
                            )}
                          </>
                        )}
                      </td>
                      <td className='px-4 py-3 text-right tabular-nums text-muted-foreground'>
                        {fmt((job.totalPromptTokens ?? 0) + (job.totalCompletionTokens ?? 0))}
                      </td>
                      <td className='px-4 py-3 text-right tabular-nums text-muted-foreground'>
                        {fmtCost(job.totalCostUsd)}
                      </td>
                      <td className='px-4 py-3'>
                        {job.totalBatches > 0 ? (
                          <div className='flex items-center justify-center gap-2 text-[11px]'>
                            <span className={job.matchRate >= 90 ? 'text-emerald-600 font-semibold' : job.matchRate >= 50 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {job.matchRate != null ? `${job.matchRate}%` : '-'}
                            </span>
                            {job.partialBatches > 0 && (
                              <span className='text-amber-600' title='Partial batches'>
                                {job.partialBatches}P
                              </span>
                            )}
                            {job.truncations > 0 && (
                              <span className='text-red-500' title='Truncated batches'>
                                {job.truncations}T
                              </span>
                            )}
                            {job.partialBatches === 0 && job.truncations === 0 && job.matchRate >= 90 && (
                              <span className='text-emerald-600' title='Clean'>Clean</span>
                            )}
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground text-center block'>-</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-right text-xs text-muted-foreground'>{fmtDate(job.createdAt)}</td>
                      <td className='px-2'>
                        <ChevronRight size={14} className='text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
