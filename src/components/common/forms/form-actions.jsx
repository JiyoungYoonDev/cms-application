import { Button } from '@/components/ui/button';
import { Rocket, Save } from 'lucide-react';

export default function FormActions({
  loading = false,
  onPublish,
  onSaveDraft,
  publishLabel = 'Publish',
  draftLabel = 'Save as Draft',
}) {
  return (
    <div className='mt-4 flex flex-col gap-3 border-t pt-8'>
      <Button
        onClick={onPublish}
        disabled={loading}
        className='w-full py-8 text-lg font-black'
      >
        <Rocket size={20} className='mr-2' />
        {publishLabel}
      </Button>

      <Button
        variant='outline'
        onClick={onSaveDraft}
        disabled={loading}
        className='w-full py-8 font-bold'
      >
        <Save size={20} className='mr-2' />
        {draftLabel}
      </Button>
    </div>
  );
}
