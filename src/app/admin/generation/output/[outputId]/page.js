'use client';

import { use } from 'react';
import OutputViewer from '@/features/generation/components/output-viewer';

export default function OutputPage({ params }) {
  const { outputId } = use(params);
  return <OutputViewer outputId={outputId} />;
}
