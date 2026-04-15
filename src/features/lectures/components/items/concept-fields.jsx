'use client';

import { BlockFields } from './block-fields';

export function ConceptFields({ value, onChange }) {
  return <BlockFields value={value} onChange={onChange} variant='concept' />;
}
