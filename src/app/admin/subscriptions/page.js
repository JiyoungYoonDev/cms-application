'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Crown, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptions, useGrantSubscription, useCancelSubscription } from '@/features/subscriptions/hooks/use-subscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUSES = ['ACTIVE', 'CANCELLED', 'EXPIRED'];
const PLANS = ['BASIC', 'PRO'];

const STATUS_STYLE = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  EXPIRED:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const PLAN_STYLE = {
  BASIC: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  PRO:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

function GrantModal({ onClose, onGrant, isPending }) {
  const [form, setForm] = useState({ userId: '', plan: 'PRO', expiresAt: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.userId || !form.expiresAt) return;
    onGrant({
      userId: Number(form.userId),
      plan: form.plan,
      expiresAt: new Date(form.expiresAt).toISOString(),
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-card rounded-2xl border shadow-xl p-6 w-full max-w-sm space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='font-bold text-base'>Grant Subscription</h2>
          <button onClick={onClose} className='text-muted-foreground hover:text-foreground'>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-3'>
          <div>
            <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>User ID</label>
            <Input
              type='number'
              placeholder='e.g. 42'
              value={form.userId}
              onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
              className='mt-1 h-9'
              required
            />
          </div>
          <div>
            <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Plan</label>
            <select
              value={form.plan}
              onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
              className='mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm'
            >
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Expires At</label>
            <Input
              type='datetime-local'
              value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              className='mt-1 h-9'
              required
            />
          </div>
          <div className='flex gap-2 pt-1'>
            <Button type='button' variant='outline' size='sm' className='flex-1' onClick={onClose}>Cancel</Button>
            <Button type='submit' size='sm' className='flex-1' disabled={isPending}>
              {isPending ? 'Granting...' : 'Grant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showGrant, setShowGrant] = useState(false);

  const { data, isLoading } = useSubscriptions({ status: statusFilter, page });
  const { mutate: grant, isPending: isGranting } = useGrantSubscription();
  const { mutate: cancel, isPending: isCancelling } = useCancelSubscription();

  const pageData = data?.data ?? null;
  const subs = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  const handleGrant = (payload) => {
    grant(payload, { onSuccess: () => setShowGrant(false) });
  };

  return (
    <div className='max-w-7xl mx-auto py-8 px-4 space-y-6'>
      {showGrant && (
        <GrantModal
          onClose={() => setShowGrant(false)}
          onGrant={handleGrant}
          isPending={isGranting}
        />
      )}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>Subscriptions</h1>
          <p className='text-sm text-muted-foreground mt-0.5'>{totalElements} total</p>
        </div>
        <Button size='sm' onClick={() => setShowGrant(true)}>
          <Crown size={14} className='mr-1.5' />
          Grant Subscription
        </Button>
      </div>

      {/* Status filter */}
      <div className='flex items-center gap-2'>
        <button
          onClick={() => { setStatusFilter(''); setPage(0); }}
          className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
            !statusFilter ? 'bg-foreground text-background border-transparent' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
              statusFilter === s
                ? STATUS_STYLE[s] + ' border-transparent'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='rounded-2xl border bg-card shadow-sm overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>User</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Plan</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Status</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Started</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Expires</th>
              <th className='text-right px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className='border-b border-border/50'>
                  <td className='px-4 py-3'><div className='space-y-1.5'><Skeleton className='h-3.5 w-32' /><Skeleton className='h-3 w-44' /></div></td>
                  {[...Array(5)].map((_, j) => <td key={j} className='px-4 py-3'><Skeleton className='h-5 w-16 rounded-full' /></td>)}
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr><td colSpan={6} className='px-4 py-16 text-center text-sm text-muted-foreground'>No subscriptions found.</td></tr>
            ) : (
              subs.map((sub) => (
                <tr key={sub.id} className='border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors'>
                  <td className='px-4 py-3'>
                    <p className='font-medium'>{sub.userName ?? '—'}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>{sub.userEmail}</p>
                  </td>
                  <td className='px-4 py-3'>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${PLAN_STYLE[sub.plan] ?? 'bg-muted text-muted-foreground'}`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[sub.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>
                    {sub.startedAt ? new Date(sub.startedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>
                    {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {sub.status === 'ACTIVE' && (
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={isCancelling}
                        onClick={() => cancel(sub.id)}
                        className='text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-3'>
          <Button size='icon' variant='outline' disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </Button>
          <span className='text-sm text-muted-foreground'>Page {page + 1} / {totalPages}</span>
          <Button size='icon' variant='outline' disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
