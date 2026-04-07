'use client';

import { Header } from '@/components/common/layout/page-header';
import { Fields } from '@/components/ui/form/Fields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Hash } from 'lucide-react';

export default function SectionBasicInfoFields({ formData, setFormData }) {
  return (
    <section className='space-y-8 animate-in fade-in duration-500'>
      <div className='px-1'>
        <Header
          variant='section'
          title='01. Section Information'
          description='Provide a title and description for this course section.'
          className='opacity-90'
        />
      </div>

      <div className='p-8 rounded-[32px] border bg-card/50 backdrop-blur-sm shadow-sm space-y-8'>
        <Fields
          items={[
            {
              key: 'title',
              label: 'Section Title',
              className: 'md:col-span-2',
              child: (
                <Input
                  placeholder='ex: Introduction to Java'
                  className='py-7 border-input/60 text-lg font-medium focus:ring-1 focus:ring-foreground/20 transition-all'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              ),
            },
            {
              key: 'description',
              label: 'Description',
              className: 'md:col-span-2',
              child: (
                <Textarea
                  placeholder='Briefly describe what this section covers.'
                  className='min-h-[120px] border-input/60 resize-none leading-relaxed'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              ),
            },
          ]}
        />

        <div className='grid grid-cols-2 gap-6 pt-4 border-t border-dashed'>
          <div className='space-y-3'>
            <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              <Clock size={12} /> Hours
            </label>
            <Input
              type='number'
              placeholder='0'
              className='h-12 border-input/60 font-mono'
              value={formData.hours || ''}
              min={0}
              onChange={(e) =>
                setFormData({ ...formData, hours: Math.max(0, Number(e.target.value)) })
              }
            />
          </div>
          <div className='space-y-3'>
            <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 ml-1'>
              <Hash size={12} /> Points
            </label>
            <Input
              type='number'
              placeholder='0'
              className='h-12 border-input/60 font-mono'
              value={formData.points || ''}
              min={0}
              onChange={(e) =>
                setFormData({ ...formData, points: Math.max(0, Number(e.target.value)) })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
