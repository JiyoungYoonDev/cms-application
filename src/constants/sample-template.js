export const INITIAL_TEMPLATE = {
  type: 'doc',
  content: [
    // What You'll learn
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: "💡 What you'll learn" }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Key Concept 1' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Key Concept 2' }],
            },
          ],
        },
      ],
    },
    // Course Sections
    // { type: 'horizontalRule' },
    // {
    //   type: 'heading',
    //   attrs: { level: 3 },
    //   content: [{ type: 'text', text: 'Course Sections' }],
    // },
    // {
    //     type: 'paragraph',
    //     content: [{type: 'text', text: 'Section Description'}]
    // },
    // {
    //   type: 'bulletList',
    //   content: [
    //     {
    //       type: 'listItem',
    //       content: [
    //         {
    //           type: 'paragraph',
    //           content: [{ type: 'text', text: 'Key Concept 1' }],
    //         },
    //       ],
    //     },
    //     {
    //       type: 'listItem',
    //       content: [
    //         {
    //           type: 'paragraph',
    //           content: [{ type: 'text', text: 'Key Concept 2' }],
    //         },
    //       ],
    //     },
    //   ],
    // },
    // What's included
    // { type: 'horizontalRule' },
    // {
    //     type: 'heading',
    //     attrs: {level: 3},
    //     content: [{ type: 'text', text: "📦 What's included" }]
    // }
  ],
};
