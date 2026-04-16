'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';

// --- UI Primitives ---
import { Button } from '@/components/common/tiptap/tiptap-ui-primitive/button';
import { Spacer } from '@/components/common/tiptap/tiptap-ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/common/tiptap/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/common/tiptap/tiptap-node/image-upload-node/image-upload-node-extension';
import { HorizontalRule } from '@/components/common/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import { MathBlock } from '@/components/common/tiptap/tiptap-node/math-node/math-node-extension';
import { GraphBlock } from '@/components/common/tiptap/tiptap-node/graph-node/graph-node-extension';
import { CheckpointBlock } from '@/components/common/tiptap/tiptap-node/checkpoint-node/checkpoint-node-extension';
import '@/components/common/tiptap/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/common/tiptap/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/common/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/common/tiptap/tiptap-node/list-node/list-node.scss';
import '@/components/common/tiptap/tiptap-node/image-node/image-node.scss';
import '@/components/common/tiptap/tiptap-node/heading-node/heading-node.scss';
import '@/components/common/tiptap/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/common/tiptap/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/common/tiptap/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/common/tiptap/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/common/tiptap/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/common/tiptap/tiptap-ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '@/components/common/tiptap/tiptap-ui/color-highlight-popover';
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from '@/components/common/tiptap/tiptap-ui/link-popover';
import { MarkButton } from '@/components/common/tiptap/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/common/tiptap/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/common/tiptap/tiptap-ui/undo-redo-button';
import { MathButton } from '@/components/common/tiptap/tiptap-ui/math-button';
import { GraphButton } from '@/components/common/tiptap/tiptap-ui/graph-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/common/tiptap/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/common/tiptap/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/common/tiptap/tiptap-icons/link-icon';

// --- Hooks ---
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { useWindowSize } from '@/hooks/use-window-size';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';

// --- Components ---
import { ThemeToggle } from '@/components/common/tiptap/simple/theme-toggle';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/common/tiptap/simple/simple-editor.scss';
import { INITIAL_TEMPLATE } from '@/constants/sample-template';

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile }) => {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={['bulletList', 'orderedList', 'taskList']}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type='bold' />
        <MarkButton type='italic' />
        <MarkButton type='strike' />
        <MarkButton type='code' />
        <MarkButton type='underline' />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type='superscript' />
        <MarkButton type='subscript' />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align='left' />
        <TextAlignButton align='center' />
        <TextAlignButton align='right' />
        <TextAlignButton align='justify' />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text='Add' />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MathButton />
        <GraphButton />
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({ type, onBack }) => (
  <>
    <ToolbarGroup>
      <Button variant='ghost' onClick={onBack}>
        <ArrowLeftIcon className='tiptap-button-icon' />
        {type === 'highlighter' ? (
          <HighlighterIcon className='tiptap-button-icon' />
        ) : (
          <LinkIcon className='tiptap-button-icon' />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({
  initialData = INITIAL_TEMPLATE,
  onChange,
  readOnly = false,
}) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState('main');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const toolbarRef = useRef(null);
  const lastContentRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    content: initialData,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON();
        lastContentRef.current = JSON.stringify(json);
        onChange(json);
      }
    },
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      }),
      MathBlock,
      GraphBlock,
      CheckpointBlock,
    ],
  });

  useEffect(() => {
    if (!editor) return;
    if (!initialData) return;
    const nextContent = JSON.stringify(initialData);
    if (nextContent === lastContentRef.current) return;
    lastContentRef.current = nextContent;
    editor.commands.setContent(initialData, false);
  }, [editor, initialData]);

  const handleSubmit = async () => {
    if (!editor) {
      return;
    }

    const submitContent = editor.getJSON();
    const payload = {
      problem_title: submitContent.content[0].content[0].text || 'Untitled',
      problem_description: submitContent,
      problem_category: category,
      problem_difficulty: difficulty,
    };
    try {
      await createProblemBookMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Error submitting content:', error);
    }
  };

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  return (
    <div className='simple-editor-container'>
      <div className={`simple-editor-wrapper border rounded-lg ${readOnly ? 'simple-editor-readonly' : ''}`}>
        <EditorContext.Provider value={{ editor }}>
          {!readOnly && (
            <Toolbar
              ref={toolbarRef}
              style={{
                ...(isMobile
                  ? {
                      bottom: `calc(100% - ${height - rect.y}px)`,
                    }
                  : {}),
              }}
            >
              {mobileView === 'main' ? (
                <MainToolbarContent
                  onHighlighterClick={() => setMobileView('highlighter')}
                  onLinkClick={() => setMobileView('link')}
                  isMobile={isMobile}
                />
              ) : (
                <MobileToolbarContent
                  type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                  onBack={() => setMobileView('main')}
                />
              )}
            </Toolbar>
          )}

          <EditorContent
            editor={editor}
            role='presentation'
            className='simple-editor-content'
          />
        </EditorContext.Provider>
      </div>
      {/* <div className='simple-editor-actions'>
        <Button
          type='button'
          variant='primary'
          onClick={handleSubmit}
          disabled={createProblemBookMutation.isPending}
        >
          {createProblemBookMutation.isPending ? 'Saving...' : 'Submit'}
        </Button>
      </div> */}
    </div>
  );
}
