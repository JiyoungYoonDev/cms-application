import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function SectionForm({ values, onChange }) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Input
        placeholder='Section title'
        value={values.title}
        onChange={(event) => onChange({ ...values, title: event.target.value })}
      />
      <Input
        placeholder='Sort order'
        type='number'
        value={values.sortOrder}
        onChange={(event) =>
          onChange({ ...values, sortOrder: Number(event.target.value) })
        }
      />
      <Textarea
        className='md:col-span-2'
        placeholder='Section description'
        value={values.description}
        onChange={(event) =>
          onChange({ ...values, description: event.target.value })
        }
      />
      <Input
        placeholder='Hours'
        type='number'
        value={values.hours}
        onChange={(event) =>
          onChange({ ...values, hours: Number(event.target.value) })
        }
      />
      <Input
        placeholder='Points'
        type='number'
        value={values.points}
        onChange={(event) =>
          onChange({ ...values, points: Number(event.target.value) })
        }
      />
    </div>
  );
}
