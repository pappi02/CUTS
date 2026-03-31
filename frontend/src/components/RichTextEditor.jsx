import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Box, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Link as LinkIcon,
  FormatQuote,
} from '@mui/icons-material';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onChange={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive('strike')}
          onChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <FormatStrikethrough />
        </ToggleButton>
        <Divider orientation="vertical" flexItem />
        <ToggleButton
          value="bulletList"
          selected={editor.isActive('bulletList')}
          onChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive('orderedList')}
          onChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumbered />
        </ToggleButton>
        <Divider orientation="vertical" flexItem />
        <ToggleButton
          value="codeBlock"
          selected={editor.isActive('codeBlock')}
          onChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code />
        </ToggleButton>
        <ToggleButton
          value="blockquote"
          selected={editor.isActive('blockquote')}
          onChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuote />
        </ToggleButton>
        <ToggleButton
          value="link"
          selected={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

const RichTextEditor = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // or getJSON() – we'll store HTML for simplicity
    },
  });

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        '& .ProseMirror': { outline: 'none', minHeight: 200 },
      }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default RichTextEditor;
