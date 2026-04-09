import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Lightweight checkpointBlock node so the editor schema recognises
 * AI-generated checkpoint nodes without crashing.
 * The actual editing UI lives in CheckpointFields (blocks format).
 */
export const CheckpointBlock = Node.create({
  name: 'checkpointBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      title: { default: '' },
      question: { default: '' },
      answer: { default: '' },
      alternatives: { default: '' },
      hint: { default: '' },
      blockId: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="checkpoint-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'checkpoint-block', class: 'checkpoint-preview' }),
      `✏️ Checkpoint: ${HTMLAttributes.question || '(no question)'}`,
    ];
  },
});

export default CheckpointBlock;
