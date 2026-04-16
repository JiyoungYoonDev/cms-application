'use client';

import { useState } from 'react';
import {
  Activity, Zap, DollarSign, Clock, AlertTriangle,
  CheckCircle2, AlertCircle, RefreshCw, Target,
  ChevronRight, Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmt, fmtCost, fmtMs, fmtPct, fmtDate } from '../utils/formatters';
import { JOB_STATUS_STYLE, JOB_TYPE_STYLE } from '../utils/job-helpers';
import { useGenerationOverview, useGenerationJobs } from '../hooks/use-generation-overview';
import JobDetailPanel from './job-detail-panel';
import DrillDownPanel from './drill-down-panel';
import TokenBreakdownPanel from './token-breakdown-panel';
import CostBreakdownPanel from './cost-breakdown-panel';
import LatencyBreakdownPanel from './latency-breakdown-panel';
import { StatusDistribution, FailureAnalysis, DailyTrend } from './overview-charts';

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

// ── Component ──

export default function OverviewTab() {
  const { data: overviewRes, isLoading: loadingOverview } = useGenerationOverview();
  const { data: jobsRes, isLoading: loadingJobs } = useGenerationJobs();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drillDown, setDrillDown] = useState(null);
  const [showTokenBreakdown, setShowTokenBreakdown] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showLatencyBreakdown, setShowLatencyBreakdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);

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

            <StatusDistribution ov={ov} />

            {showTokenBreakdown && (
              <div className='mt-3'>
                <TokenBreakdownPanel data={ov} onClose={() => setShowTokenBreakdown(false)} />
              </div>
            )}
            {showCostBreakdown && (
              <div className='mt-3'>
                <CostBreakdownPanel data={ov} onClose={() => setShowCostBreakdown(false)} />
              </div>
            )}
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
              const jt = JOB_TYPE_STYLE[t];
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
                  const s = JOB_STATUS_STYLE[job.status] ?? JOB_STATUS_STYLE.PENDING;
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
                          const jt = JOB_TYPE_STYLE[job.jobType];
                          return jt
                            ? <Badge variant='outline' className={jt.color}>{jt.label}</Badge>
                            : <span className='text-xs text-muted-foreground'>-</span>;
                        })()}
                      </td>
                      <td className='px-4 py-3'>
                        <Badge variant='outline' className={`${s.bg} ${s.text}`}>{s.label}</Badge>
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
