import { Checkbox } from '@/components/ui/checkbox';
import { LectureForm } from '@/components/admin/cms/lecture-form';

export function LectureEditorPanel({ values, onChange }) {
  return (
    <div className='space-y-6'>
      <LectureForm values={values} onChange={onChange} />
      <div className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-sm'>
        <label className='flex items-center gap-2'>
          <Checkbox
            checked={values.isPreview}
            onCheckedChange={(checked) =>
              onChange({ ...values, isPreview: Boolean(checked) })
            }
          />
          Preview lecture
        </label>
        <label className='flex items-center gap-2'>
          <Checkbox
            checked={values.isPublished}
            onCheckedChange={(checked) =>
              onChange({ ...values, isPublished: Boolean(checked) })
            }
          />
          Published
        </label>
      </div>
    </div>
  );
}
