'use client';

import Link from 'next/link';
import {
  BookOpen, Users, GraduationCap, Tag,
  Layers, FileText, Code2, TrendingUp,
  Plus, ArrowRight, CheckCircle2, Clock, Archive,
  FileEdit, Eye, AlertCircle,
} from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_META = {
  PUBLISHED: { label: 'Published', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  DRAFT:     { label: 'Draft',     icon: Clock,         color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20'   },
  ARCHIVED:  { label: 'Archived',  icon: Archive,       color: 'text-muted-foreground',                bg: 'bg-muted'                            },
};

const DIFFICULTY_COLOR = {
  BEGINNER:     'text-sky-600 dark:text-sky-400',
  INTERMEDIATE: 'text-violet-600 dark:text-violet-400',
  ADVANCED:     'text-rose-600 dark:text-rose-400',
};

// ─── components ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'bg-primary/10 text-primary', loading }) {
  return (
    <div className='rounded-2xl border bg-card p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow'>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className='min-w-0'>
        <p className='text-sm text-muted-foreground font-medium'>{label}</p>
        {loading ? (
          <div className='mt-1 h-7 w-16 rounded-md bg-muted animate-pulse' />
        ) : (
          <p className='text-2xl font-bold tracking-tight mt-0.5'>{fmt(value)}</p>
        )}
        {sub && !loading && (
          <p className='text-xs text-muted-foreground mt-0.5'>{sub}</p>
        )}
      </div>
    </div>
  );
}

function CourseStatusBar({ published, draft, archived, total }) {
  if (!total) return null;
  const pPct = Math.round((published / total) * 100);
  const dPct = Math.round((draft / total) * 100);
  const aPct = 100 - pPct - dPct;
  return (
    <div className='mt-3'>
      <div className='flex rounded-full overflow-hidden h-2 gap-0.5'>
        <div className='bg-emerald-500 transition-all' style={{ width: `${pPct}%` }} />
        <div className='bg-amber-400 transition-all' style={{ width: `${dPct}%` }} />
        <div className='bg-muted transition-all' style={{ width: `${aPct}%` }} />
      </div>
      <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />{published} published</span>
        <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-amber-400 inline-block' />{draft} draft</span>
        {archived > 0 && <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-muted-foreground inline-block' />{archived} archived</span>}
      </div>
    </div>
  );
}

function RecentCourseRow({ course }) {
  const s = STATUS_META[course.status] ?? STATUS_META.DRAFT;
  const StatusIcon = s.icon;
  return (
    <Link
      href={`/admin/courses/${course.id}`}
      className='flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors group'
    >
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate group-hover:text-primary transition-colors'>
          {course.title}
        </p>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {course.category ?? 'No category'} · {formatDate(course.createdAt)}
        </p>
      </div>
      <div className='flex items-center gap-3 shrink-0'>
        {course.difficulty && (
          <span className={`text-xs font-medium capitalize ${DIFFICULTY_COLOR[course.difficulty] ?? 'text-muted-foreground'}`}>
            {course.difficulty.toLowerCase()}
          </span>
        )}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
          <StatusIcon size={11} />
          {s.label}
        </span>
        <ArrowRight size={14} className='text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
      </div>
    </Link>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  const stats = data?.data ?? null;

  return (
    <div className='max-w-7xl mx-auto py-8 px-4 space-y-8'>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <p className='text-sm text-muted-foreground mt-0.5'>Overview of your platform content and users</p>
        </div>
        <Link
          href='/admin/courses/create'
          className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm'
        >
          <Plus size={16} />
          New Course
        </Link>
      </div>

      {/* Primary stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={BookOpen}
          label='Total Courses'
          value={stats?.totalCourses}
          loading={isLoading}
          color='bg-primary/10 text-primary'
        />
        <Link href='/admin/users'>
          <StatCard
            icon={Users}
            label='Total Users'
            value={stats?.totalUsers}
            loading={isLoading}
            color='bg-sky-500/10 text-sky-600 dark:text-sky-400'
          />
        </Link>
        <StatCard
          icon={GraduationCap}
          label='Enrollments'
          value={stats?.totalEnrollments}
          loading={isLoading}
          color='bg-violet-500/10 text-violet-600 dark:text-violet-400'
        />
        <StatCard
          icon={Tag}
          label='Categories'
          value={stats?.totalCategories}
          loading={isLoading}
          color='bg-amber-500/10 text-amber-600 dark:text-amber-400'
        />
      </div>

      {/* Course status breakdown + secondary stats */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

        {/* Course status card */}
        <div className='lg:col-span-1 rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='flex items-center justify-between mb-1'>
            <p className='text-sm font-semibold'>Course Status</p>
            <Link href='/admin/courses' className='text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1'>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {isLoading ? (
            <div className='space-y-2 mt-4'>
              {[...Array(3)].map((_, i) => <div key={i} className='h-4 rounded bg-muted animate-pulse' />)}
            </div>
          ) : (
            <CourseStatusBar
              published={stats?.publishedCourses ?? 0}
              draft={stats?.draftCourses ?? 0}
              archived={stats?.archivedCourses ?? 0}
              total={stats?.totalCourses ?? 0}
            />
          )}
        </div>

        {/* Content depth stats */}
        <div className='lg:col-span-2 rounded-2xl border bg-card p-5 shadow-sm'>
          <p className='text-sm font-semibold mb-4'>Content Structure</p>
          <div className='grid grid-cols-3 gap-4'>
            {[
              { icon: Layers,   label: 'Sections',      value: stats?.totalSections,     color: 'text-teal-600 dark:text-teal-400',   bg: 'bg-teal-500/10'   },
              { icon: FileText, label: 'Lectures',       value: stats?.totalLectures,     color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
              { icon: Code2,    label: 'Lecture Items',  value: stats?.totalLectureItems, color: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-500/10'   },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`rounded-xl p-4 ${bg}`}>
                <Icon size={18} className={color} />
                <p className='text-xl font-bold mt-2'>{isLoading ? '—' : fmt(value)}</p>
                <p className='text-xs text-muted-foreground mt-0.5'>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review status cards */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <p className='text-sm font-semibold'>Content Review Status</p>
          <span className='text-xs text-muted-foreground'>Lecture Items</span>
        </div>
        <div className='grid grid-cols-3 gap-4'>
          {[
            { icon: FileEdit,    label: 'Draft',       value: stats?.draftItems,    href: '/admin/content/drafts',    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'    },
            { icon: AlertCircle, label: 'In Review',   value: stats?.inReviewItems, href: '/admin/content/in-review', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'       },
            { icon: Eye,         label: 'Published',   value: stats?.publishedItems, href: '/admin/content/published', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
          ].map(({ icon: Icon, label, value, href, color }) => (
            <Link
              key={label}
              href={href}
              className='rounded-2xl border bg-card p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group'
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div className='min-w-0'>
                <p className='text-sm text-muted-foreground font-medium'>{label}</p>
                {isLoading ? (
                  <div className='mt-1 h-6 w-12 rounded bg-muted animate-pulse' />
                ) : (
                  <p className='text-xl font-bold mt-0.5'>{fmt(value)}</p>
                )}
              </div>
              <ArrowRight size={14} className='ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent courses */}
      <div className='rounded-2xl border bg-card shadow-sm overflow-hidden'>
        <div className='flex items-center justify-between px-5 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <TrendingUp size={16} className='text-muted-foreground' />
            <p className='text-sm font-semibold'>Recent Courses</p>
          </div>
          <Link href='/admin/courses' className='text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1'>
            All courses <ArrowRight size={11} />
          </Link>
        </div>

        {isLoading ? (
          <div className='divide-y'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='px-5 py-3.5 flex items-center gap-4'>
                <div className='flex-1 space-y-1.5'>
                  <div className='h-4 w-2/3 rounded bg-muted animate-pulse' />
                  <div className='h-3 w-1/3 rounded bg-muted animate-pulse' />
                </div>
                <div className='h-5 w-20 rounded-full bg-muted animate-pulse' />
              </div>
            ))}
          </div>
        ) : (stats?.recentCourses ?? []).length === 0 ? (
          <div className='px-5 py-10 text-center text-sm text-muted-foreground'>
            No courses yet.{' '}
            <Link href='/admin/courses/create' className='text-primary hover:underline'>Create your first course</Link>
          </div>
        ) : (
          <div className='divide-y'>
            {(stats?.recentCourses ?? []).map((course) => (
              <RecentCourseRow key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className='rounded-2xl border bg-card p-5 shadow-sm'>
        <p className='text-sm font-semibold mb-4'>Quick Actions</p>
        <div className='flex flex-wrap gap-3'>
          {[
            { href: '/admin/courses/create', label: 'New Course',    icon: BookOpen   },
            { href: '/admin/courses',        label: 'Manage Courses', icon: Layers    },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-background hover:bg-muted transition-colors text-sm font-medium'
            >
              <Icon size={15} className='text-muted-foreground' />
              {label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
