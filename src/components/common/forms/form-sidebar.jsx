import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function FormSidebar({
  description = 'Please verify your updates before publishing.',
  onBack,
  backLabel = 'Back',
  children,
}) {
  return (
    <div className='sticky top-10 space-y-6'>
      <div className='p-8 border rounded-[32px] bg-card shadow-sm space-y-8'>
        <div className='space-y-2'>
          <h3 className='text-xs font-black uppercase tracking-widest opacity-40'>
            Actions
          </h3>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {description}
          </p>
        </div>

        <div className='flex flex-col gap-3'>{children}</div>

        {onBack && (
          <div className='pt-4 border-t'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start text-muted-foreground'
              onClick={onBack}
            >
              <ChevronLeft size={16} className='mr-1' /> {backLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
