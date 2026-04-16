import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Fields } from '@/components/ui/form/Fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, AlignLeft, Type } from 'lucide-react';

const LECTURE_TYPES = ['TEXT', 'VIDEO', 'QUIZ', 'PROJECT', 'CODING'];

export function LectureForm({ values, onChange }) {
  return (
    <Fields
      items={[
        {
          key: 'title',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <Type size={11} /> Lecture Title
            </span>
          ),
          className: 'md:col-span-2',
          child: (
            <Input
              placeholder='e.g. Introduction to Variables'
              value={values.title}
              onChange={(e) => onChange({ ...values, title: e.target.value })}
              className='h-11 border-input/60'
            />
          ),
        },
        {
          key: 'description',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <AlignLeft size={11} /> Description
            </span>
          ),
          className: 'md:col-span-2',
          child: (
            <Textarea
              placeholder='Brief summary of what this lecture covers'
              value={values.description}
              onChange={(e) => onChange({ ...values, description: e.target.value })}
              className='border-input/60 resize-none min-h-20'
            />
          ),
        },
        {
          key: 'lectureType',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              Lecture Type
            </span>
          ),
          child: (
            <Select
              value={values.lectureType}
              onValueChange={(value) => onChange({ ...values, lectureType: value })}
            >
              <SelectTrigger className='border-input/60'>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                {LECTURE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        },
        {
          key: 'durationMinutes',
          label: (
            <span className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40'>
              <Clock size={11} /> Duration (minutes)
            </span>
          ),
          child: (
            <Input
              type='number'
              placeholder='e.g. 15'
              value={values.durationMinutes}
              min={0}
              onChange={(e) => onChange({ ...values, durationMinutes: Math.max(0, Number(e.target.value)) })}
              className='h-11 border-input/60 font-mono'
            />
          ),
        },
      ]}
    />
  );
}
