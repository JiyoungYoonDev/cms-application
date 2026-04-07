import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CourseSectionForm({
  key,
  sections,
  setSections,
  onSave,
  onCancel,
  isNew,
}) {
  return (
    <div
      className={`p-6 rounded-[24px] border-2 bg-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-300 ${isNew ? 'border-dashed border-slate-800' : 'border-slate-700 bg-slate-900/40 shadow-xl'}`}
    >
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2 col-span-2'>
            <label className='text-xs font-black text-slate-500 uppercase ml-1'>
              Section Title
            </label>
          </div>
          <Input
            autoFocus
            value={sections.title}
            onChange={(e) =>
              setSections({
                ...sections,
                title: e.target.value,
              })
            }
          />
        </div>

        <div className='flex flex-col gap-2 col-span-2'>
          <label className='text-xs font-black text-slate-500 uppercase ml-1'>
            Description
          </label>
          <Textarea
            value={sections.description}
            onChange={(e) =>
              setSections({ ...sections, description: e.target.value })
            }
            className='bg-slate-950 border-slate-800 text-slate-200 min-h-[80px]'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-xs font-black text-slate-500 uppercase ml-1'>
            Sub Courses
          </label>
          <Input
            type='number'
            value={sections.sub_courses || ''}
            min={0}
            onChange={(e) =>
              setSections({
                ...sections,
                sub_courses: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className='bg-slate-950 border-slate-800 text-slate-200'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-xs font-black text-slate-500 uppercase ml-1'>
            Hours
          </label>
          <Input
            type='number'
            value={sections.hours || ''}
            min={0}
            onChange={(e) =>
              setSections({ ...sections, hours: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className='bg-slate-950 border-slate-800 text-slate-200'
          />
        </div>

        <div className='flex flex-col gap-2 col-span-2'>
          <label className='text-xs font-black text-slate-500 uppercase ml-1'>
            Deduct Points
          </label>
          <Input
            type='number'
            value={sections.points || ''}
            min={0}
            onChange={(e) =>
              setSections({
                ...sections,
                points: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className='bg-slate-950 border-slate-800 text-slate-200'
          />
        </div>

        <div className='flex justify-end gap-2 pt-2 border-t border-slate-800/50'>
          <Button
            variant='ghost'
            onClick={onCancel}
            className='text-slate-500 hover:text-slate-300'
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className='bg-slate-200 text-slate-950 hover:bg-white font-bold rounded-xl px-6'
          >
            {isNew ? 'Save Section' : 'Update Section'}
          </Button>
        </div>
      </div>
    </div>
  );
}
