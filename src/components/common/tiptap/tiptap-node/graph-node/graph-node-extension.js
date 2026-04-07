import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { GraphNodeView } from './graph-node-view';

export const GraphBlock = Node.create({
  name: 'graphBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      expression: { default: 'x^2' },
      xMin: { default: -10 },
      xMax: { default: 10 },
      yMin: { default: -10 },
      yMax: { default: 10 },
      width: { default: 600 },
      height: { default: 400 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="graph-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'graph-block' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GraphNodeView);
  },

  addCommands() {
    return {
      insertGraphBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              expression: attrs.expression ?? 'x^2',
              xMin: attrs.xMin ?? -10,
              xMax: attrs.xMax ?? 10,
              yMin: attrs.yMin ?? -10,
              yMax: attrs.yMax ?? 10,
            },
          });
        },
    };
  },
});

export default GraphBlock;
