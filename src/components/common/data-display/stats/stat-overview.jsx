import { StatCard } from './stat-card';

export function StatsOverview({ items, className = '' }) {
  return (
    <section className={`rounded-2xl border bg-card p-6 shadow-sm ${className}`}>
      <div className='grid gap-4 md:grid-cols-4'>
        {items.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
    </section>
  );
}