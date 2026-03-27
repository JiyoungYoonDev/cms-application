export function StatCard({ label, value }) {
  return (
    <div>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='text-sm font-semibold'>{value}</p>
    </div>
  );
}