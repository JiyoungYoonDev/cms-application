'use client';

import { useCallback } from 'react';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { Button } from '@/components/common/tiptap/tiptap-ui-primitive/button';

export function MathButton({ editor: providedEditor }) {
  const { editor } = useTiptapEditor(providedEditor);

  const handleClick = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertMathBlock().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      tabIndex={-1}
      aria-label="Insert math block"
      tooltip="Math (LaTeX)"
      onClick={handleClick}
    >
      <span className="tiptap-button-icon" style={{ fontWeight: 700, fontSize: 13, fontStyle: 'italic' }}>
        ∑
      </span>
    </Button>
  );
}
