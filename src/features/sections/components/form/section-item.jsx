import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function CourseSectionCard({
  section,
  idx,
  onEdit,
  onCancel,
}) {
  return (
    <div
      key={section.id}
      className='group flex items-center justify-between p-5 rounded-[24px] border border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-all'
    >
      <div className='flex gap-5 items-start'>
        <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-500'>
          {(idx + 1).toString().padStart(2, '0')}
        </div>
        <div className='space-y-1'>
          <h3 className='font-bold text-slate-200 text-base'>
            {section.title}
          </h3>
          <p className='text-sm text-slate-500'>{section.description}</p>
          <div className='flex gap-4 mt-2'>
            <span className='text-[10px] font-black uppercase text-slate-600 tracking-tighter'>
              SubCourses: {section.subCount}
            </span>
            <span className='text-[10px] font-black uppercase text-slate-600 tracking-tighter'>
              Hours: {section.hours}h
            </span>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
        <Button
          onClick={() => onEdit(section)}
          variant='ghost'
          size='sm'
          className='text-slate-400 hover:text-slate-200'
        >
          <Pencil size={14} className='mr-1' /> Edit
        </Button>
        <Button
          onClick={() => onCancel(section.id)}
          variant='ghost'
          size='sm'
          className='text-rose-900/50 hover:text-rose-500'
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
