'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Shield, User, Ban, CheckCircle, MinusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '@/features/users/hooks/use-users';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ROLES = ['USER', 'ADMIN'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'BANNED'];

const ROLE_STYLE = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  USER:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const STATUS_STYLE = {
  ACTIVE:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  INACTIVE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  BANNED:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STATUS_ICON = {
  ACTIVE:   CheckCircle,
  INACTIVE: MinusCircle,
  BANNED:   Ban,
};

const PROVIDER_STYLE = {
  LOCAL:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  GOOGLE: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

const PLAN_STYLE = {
  BASIC: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  PRO:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

function Badge({ text, className }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${className}`}>
      {text}
    </span>
  );
}

function RoleDropdown({ userId, current, onUpdate, disabled }) {
  return (
    <select
      value={current}
      disabled={disabled}
      onChange={(e) => onUpdate({ userId, role: e.target.value })}
      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border-0 cursor-pointer outline-none ${ROLE_STYLE[current]}`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}

function StatusDropdown({ userId, current, onUpdate, disabled }) {
  const Icon = STATUS_ICON[current] ?? CheckCircle;
  return (
    <select
      value={current}
      disabled={disabled}
      onChange={(e) => onUpdate({ userId, status: e.target.value })}
      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border-0 cursor-pointer outline-none ${STATUS_STYLE[current]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useUsers({
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    page,
  });

  const { mutate: updateRole, isPending: isRolePending } = useUpdateUserRole();
  const { mutate: updateStatus, isPending: isStatusPending } = useUpdateUserStatus();

  const pageData = data?.data ?? null;
  const users = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(0);
    }, 300);
  };

  const handleRoleFilter = (r) => {
    setRoleFilter(prev => prev === r ? '' : r);
    setPage(0);
  };

  const handleStatusFilter = (s) => {
    setStatusFilter(prev => prev === s ? '' : s);
    setPage(0);
  };

  return (
    <div className='max-w-7xl mx-auto py-8 px-4 space-y-6'>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>Users</h1>
          <p className='text-sm text-muted-foreground mt-0.5'>{totalElements} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 min-w-[200px] max-w-sm'>
          <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by name or email...'
            value={search}
            onChange={handleSearchChange}
            className='pl-8 h-9 text-sm'
          />
        </div>

        {/* Role filter */}
        <div className='flex items-center gap-1'>
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => handleRoleFilter(r)}
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border transition-colors ${
                roleFilter === r
                  ? ROLE_STYLE[r] + ' border-transparent'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className='flex items-center gap-1'>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border transition-colors ${
                statusFilter === s
                  ? STATUS_STYLE[s] + ' border-transparent'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className='rounded-2xl border bg-card shadow-sm overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>User</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Role</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Status</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Provider</th>
              <th className='text-right px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Courses</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Subscription</th>
              <th className='text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest opacity-50'>Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className='border-b border-border/50'>
                  <td className='px-4 py-3'>
                    <div className='space-y-1.5'>
                      <Skeleton className='h-3.5 w-32' />
                      <Skeleton className='h-3 w-48' />
                    </div>
                  </td>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className='px-4 py-3'>
                      <Skeleton className='h-5 w-16 rounded-full' />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className='px-4 py-16 text-center text-sm text-muted-foreground'>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className='border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors'>
                  <td className='px-4 py-3'>
                    <p className='font-medium text-sm'>{user.name ?? '—'}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>{user.email}</p>
                  </td>
                  <td className='px-4 py-3'>
                    <RoleDropdown
                      userId={user.id}
                      current={user.role}
                      onUpdate={updateRole}
                      disabled={isRolePending}
                    />
                  </td>
                  <td className='px-4 py-3'>
                    <StatusDropdown
                      userId={user.id}
                      current={user.status}
                      onUpdate={updateStatus}
                      disabled={isStatusPending}
                    />
                  </td>
                  <td className='px-4 py-3'>
                    <Badge text={user.provider} className={PROVIDER_STYLE[user.provider] ?? 'bg-muted text-muted-foreground'} />
                  </td>
                  <td className='px-4 py-3 text-right font-mono text-sm font-medium'>
                    {user.enrollmentCount}
                  </td>
                  <td className='px-4 py-3'>
                    {user.subscribed ? (
                      <div className='space-y-0.5'>
                        <Badge text={user.subscriptionPlan} className={PLAN_STYLE[user.subscriptionPlan] ?? 'bg-muted text-muted-foreground'} />
                        {user.subscriptionExpiresAt && (
                          <p className='text-[10px] text-muted-foreground'>
                            until {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground'>—</span>
                    )}
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-3'>
          <Button
            size='icon'
            variant='outline'
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className='text-sm text-muted-foreground'>
            Page {page + 1} / {totalPages}
          </span>
          <Button
            size='icon'
            variant='outline'
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
