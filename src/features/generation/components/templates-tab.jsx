'use client';

import { useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '../hooks/use-prompt-templates';
import TemplateDetail from './template-detail';

export default function TemplatesTab() {
  const { data: res, isLoading } = useTemplates();
  const templates = res?.data ?? [];
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const selected = templates.find(t => t.id === selectedTemplate);

  if (selectedTemplate && selected) {
    return (
      <TemplateDetail
        templateId={selectedTemplate}
        templateName={selected.name}
        templateDescription={selected.description}
        templateTaskType={selected.taskType}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <h3 className='text-sm font-semibold text-muted-foreground'>Prompt Templates ({templates.length})</h3>

      {isLoading ? (
        <div className='space-y-2'>
          {[...Array(3)].map((_, i) => <div key={i} className='h-16 rounded-lg bg-muted animate-pulse' />)}
        </div>
      ) : templates.length === 0 ? (
        <div className='text-sm text-muted-foreground p-10 text-center rounded-xl border bg-card'>
          No prompt templates yet. Templates are created by the PromptTemplateSeeder on startup.
        </div>
      ) : (
        <div className='rounded-xl border bg-card overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/30'>
                <th className='text-left px-4 py-2.5 font-medium text-muted-foreground'>Template</th>
                <th className='text-left px-2 py-2.5 font-medium text-muted-foreground'>Type</th>
                <th className='text-center px-2 py-2.5 font-medium text-muted-foreground'>Status</th>
                <th className='w-8' />
              </tr>
            </thead>
            <tbody className='divide-y'>
              {templates.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className='cursor-pointer hover:bg-muted/40 transition-colors group'
                >
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <FileText size={15} className='text-muted-foreground shrink-0' />
                      <div>
                        <p className='font-medium'>{t.name}</p>
                        <p className='text-xs text-muted-foreground'>{t.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-2 py-3'>
                    <Badge variant='outline' className='text-[10px]'>{t.taskType}</Badge>
                  </td>
                  <td className='px-2 py-3 text-center'>
                    <Badge variant='outline' className={`text-[10px] ${t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : ''}`}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className='px-2'>
                    <ChevronRight size={14} className='text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
