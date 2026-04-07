'use client';

import { useCallback } from 'react';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { Button } from '@/components/common/tiptap/tiptap-ui-primitive/button';

export function GraphButton({ editor: providedEditor }) {
  const { editor } = useTiptapEditor(providedEditor);

  const handleClick = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertGraphBlock().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      tabIndex={-1}
      aria-label="Insert function graph"
      tooltip="Graph (f(x))"
      onClick={handleClick}
    >
      <span className="tiptap-button-icon" style={{ fontWeight: 700, fontSize: 13 }}>
        📈
      </span>
    </Button>
  );
}
