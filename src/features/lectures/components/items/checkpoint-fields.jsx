'use client';

import { BlockFields } from './block-fields';

export function CheckpointFields({ value, onChange }) {
  return <BlockFields value={value} onChange={onChange} variant='checkpoint' />;
}
