'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FlaskConical, Loader2 } from 'lucide-react';
import { useValidationOverview } from '../hooks/use-validation-overview';
import { runMathCheck } from '../services/generation-admin-service';
import { useQueryClient } from '@tanstack/react-query';

function fmtPct(n) {
  if (n == null) return '-';
  return Number(n).toFixed(1) + '%';
}

const RULE_META = {
  STRUCTURED_SCHEMA_VALID: { label: 'Structured Schema Valid', desc: 'AI returned parseable structured schema output', icon: ShieldCheck },
  NO_TRUNCATION:           { label: 'No Truncation', desc: 'Output not cut off by MAX_TOKENS', icon: AlertTriangle },
  PARSE_SUCCESS:           { label: 'Parse Success', desc: 'Clean parse without fallback repair', icon: CheckCircle2 },
  ITEM_COUNT_MATCH:        { label: 'Item Count Match', desc: 'All expected items were matched', icon: CheckCircle2 },
  ITEM_TITLE_MATCH_RATE:   { label: 'Title Match Rate', desc: 'Item titles matched at 80%+ accuracy', icon: CheckCircle2 },
  REQUIRED_ITEMS_PRESENT:  { label: 'Required Items Present', desc: 'All required item types have content', icon: ShieldCheck },
  CONTENT_NOT_EMPTY:       { label: 'Content Not Empty', desc: 'Generated content is not empty', icon: CheckCircle2 },
  CODING_SCHEMA_VALID:     { label: 'Coding Schema Valid', desc: 'problems, testCases, starterCode structure correct', icon: ShieldCheck },
  QUIZ_SCHEMA_VALID:       { label: 'Quiz Schema Valid', desc: 'quiz blocks, options, isCorrect, explanation present', icon: ShieldCheck },
  CHECKPOINT_SCHEMA_VALID: { label: 'Checkpoint Schema Valid', desc: 'checkpoint blocks with question + answer', icon: ShieldCheck },
  MIN_CONTENT_LENGTH:      { label: 'Min Content Length', desc: 'Content meets minimum character threshold', icon: CheckCircle2 },
  GRAPH_PRESENT_FOR_MATH:  { label: 'Graph Present (Math)', desc: 'Math RICH_TEXT contains graphBlock nodes', icon: CheckCircle2 },
  MATH_ACCURACY:           { label: 'Math Accuracy', desc: 'LLM cross-check verified question answers are correct', icon: FlaskConical },
};

function RuleCard({ ruleName, stats }) {
  const meta = RULE_META[ruleName] ?? { label: ruleName, desc: '', icon: CheckCircle2 };
  const Icon = meta.icon;
  const passRate = Number(stats.passRate ?? 0);
  const isPerfect = passRate === 100;
  const isGood = passRate >= 80;
  const isBad = passRate < 50;

  let rateColor = 'text-emerald-600';
  if (!isPerfect && isGood) rateColor = 'text-amber-600';
  if (!isGood) rateColor = 'text-red-600';
  if (isBad) rateColor = 'text-red-600 font-bold';

  return (
    <div className={`rounded-lg border p-4 ${isBad ? 'border-red-300 dark:border-red-800' : ''}`}>
      <div className='flex items-start justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <Icon size={15} className={isPerfect ? 'text-emerald-500' : isBad ? 'text-red-500' : 'text-amber-500'} />
          <span className='text-sm font-medium'>{meta.label}</span>
        </div>
        <span className={`text-lg font-bold tabular-nums ${rateColor}`}>{fmtPct(stats.passRate)}</span>
      </div>
      <p className='text-xs text-muted-foreground mb-3'>{meta.desc}</p>

      {/* Bar */}
      <div className='h-2 rounded-full bg-muted overflow-hidden'>
        <div
          className={`h-full transition-all rounded-full ${isPerfect ? 'bg-emerald-500' : isGood ? 'bg-amber-400' : 'bg-red-500'}`}
          style={{ width: `${passRate}%` }}
        />
      </div>

      <div className='flex items-center justify-between mt-2 text-[11px] text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <CheckCircle2 size={10} className='text-emerald-500' /> {stats.passed} passed
        </span>
        <span className='flex items-center gap-1'>
          <XCircle size={10} className='text-red-500' /> {stats.failed} failed
        </span>
        <span>{stats.total} total</span>
      </div>
    </div>
  );
}

export default function ValidationTab() {
  const queryClient = useQueryClient();
  const { data: res, isLoading } = useValidationOverview();
  const ov = res?.data ?? {};
  const rules = ov.ruleBreakdown ?? {};

  // Sort rules: worst pass rate first
  const sortedRules = Object.entries(rules).sort(([, a], [, b]) => Number(a.passRate) - Number(b.passRate));

  // Math check state
  const [mathJobId, setMathJobId] = useState('');
  const [mathRunning, setMathRunning] = useState(false);
  const [mathResult, setMathResult] = useState(null);

  async function handleMathCheck() {
    const id = Number(mathJobId);
    if (!id) return;
    setMathRunning(true);
    setMathResult(null);
    try {
      const res = await runMathCheck({ jobId: id });
      setMathResult(res?.data ?? res);
      queryClient.invalidateQueries({ queryKey: ['generation', 'validation', 'overview'] });
    } catch (e) {
      setMathResult({ error: e?.message ?? 'Failed' });
    } finally {
      setMathRunning(false);
    }
  }

  return (
    <div className='space-y-6'>
      {/* Summary */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <SumCard label='Total Outputs' value={ov.totalOutputs ?? 0} />
        <SumCard label='Total Checks' value={ov.totalChecks ?? 0} />
        <SumCard label='Passed' value={ov.passedChecks ?? 0} color='text-emerald-600' />
        <SumCard label='Overall Pass Rate' value={fmtPct(ov.overallPassRate)}
          color={Number(ov.overallPassRate) >= 80 ? 'text-emerald-600' : 'text-red-600'} />
      </div>

      {/* Math Accuracy Check */}
      <div className='rounded-lg border p-4 space-y-3'>
        <div className='flex items-center gap-2'>
          <FlaskConical size={15} className='text-violet-500' />
          <h3 className='text-sm font-semibold'>Math Accuracy Check</h3>
          <span className='text-xs text-muted-foreground'>(LLM-as-a-Judge)</span>
        </div>
        <div className='flex items-center gap-2'>
          <input
            type='number'
            placeholder='Job ID'
            value={mathJobId}
            onChange={(e) => setMathJobId(e.target.value)}
            className='w-32 px-3 py-1.5 text-sm rounded-lg border bg-background'
          />
          <button
            onClick={handleMathCheck}
            disabled={!mathJobId || mathRunning}
            className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                       bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 disabled:opacity-50 transition-colors'
          >
            {mathRunning ? <Loader2 size={12} className='animate-spin' /> : <FlaskConical size={12} />}
            {mathRunning ? 'Checking...' : 'Run Check'}
          </button>
        </div>

        {mathResult && (
          mathResult.error ? (
            <p className='text-xs text-red-500'>{mathResult.error}</p>
          ) : (
            <div className='text-xs space-y-1'>
              <p>
                Checked <strong>{mathResult.checked}</strong> problems:
                <span className='text-emerald-600 ml-2'>{mathResult.passed} passed</span>
                <span className='text-red-600 ml-2'>{mathResult.failed} failed</span>
              </p>
              {mathResult.details?.filter(d => !d.passed).map((d, i) => (
                <div key={i} className='flex items-start gap-2 p-2 rounded bg-red-500/5 border border-red-200 dark:border-red-800'>
                  <XCircle size={12} className='text-red-500 mt-0.5 shrink-0' />
                  <span className='text-red-600'>{d.message}</span>
                </div>
              ))}
              {mathResult.failed === 0 && mathResult.checked > 0 && (
                <p className='text-emerald-600 flex items-center gap-1'>
                  <CheckCircle2 size={12} /> All answers verified correct
                </p>
              )}
            </div>
          )
        )}
      </div>

      {/* Rules grid */}
      <div>
        <h3 className='text-sm font-semibold text-muted-foreground mb-3'>
          Validation Rules ({sortedRules.length})
          <span className='font-normal ml-2'>sorted by pass rate (worst first)</span>
        </h3>
        {isLoading ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            {[...Array(6)].map((_, i) => <div key={i} className='h-32 rounded-lg bg-muted animate-pulse' />)}
          </div>
        ) : sortedRules.length === 0 ? (
          <div className='text-sm text-muted-foreground p-6 text-center'>No validation data yet. Generate content to see validation results.</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            {sortedRules.map(([rule, stats]) => (
              <RuleCard key={rule} ruleName={rule} stats={stats} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SumCard({ label, value, color }) {
  return (
    <div className='rounded-lg border bg-card p-3'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className={`text-xl font-bold ${color ?? ''}`}>{value}</p>
    </div>
  );
}
