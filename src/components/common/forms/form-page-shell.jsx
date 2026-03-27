export default function FormPageShell({ main, sidebar }) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-12'>
      <div className='space-y-12 lg:col-span-8'>{main}</div>
      <aside className='space-y-6 lg:col-span-4'>{sidebar}</aside>
    </div>
  );
}
