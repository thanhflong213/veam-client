'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useState, useRef, useEffect } from 'react';
import { adminUploadImage } from '../../lib/api';
import { getToken } from '../../lib/auth';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

const COLORS = [
  '#000000','#1a2744','#b8973a','#c0392b','#27ae60','#2980b9','#8e44ad','#e67e22',
  '#ffffff','#5a5a5a','#888888','#d8d0be','#e8f8ef','#fff0f0','#fef9e7','#eaf4fb',
];

export default function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({ controls: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'ed-body', 'data-placeholder': 'Start writing content here…' },
    },
  });

  const [colorOpen, setColorOpen] = useState(false);
  const [colorPos, setColorPos] = useState({ top: 0, left: 0 });
  const [tableOpen, setTableOpen] = useState(false);
  const [tablePos, setTablePos] = useState({ top: 0, left: 0 });
  const [tableHover, setTableHover] = useState({ r: 0, c: 0 });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkPos, setLinkPos] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState('');
  const [ytOpen, setYtOpen] = useState(false);
  const [ytPos, setYtPos] = useState({ top: 0, left: 0 });
  const [ytUrl, setYtUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function close() { setColorOpen(false); setTableOpen(false); setLinkOpen(false); setYtOpen(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!editor) return null;

  function openDropAt(e: React.MouseEvent, setOpen: (b: boolean) => void, setPos: (p: { top: number; left: number }) => void) {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setColorOpen(false); setTableOpen(false); setLinkOpen(false); setYtOpen(false);
    setOpen(true);
  }

  async function handleImageUpload(file: File) {
    const token = getToken();
    if (!token) return;
    try {
      const { url } = await adminUploadImage(file, token);
      editor.chain().focus().setImage({ src: url }).run();
    } catch { /* ignore */ }
  }

  function insertLink() {
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkOpen(false);
    setLinkUrl('');
  }

  function insertYt() {
    if (ytUrl) editor.chain().focus().setYoutubeVideo({ src: ytUrl }).run();
    setYtOpen(false);
    setYtUrl('');
  }

  const B = ({ label, onClick, active, title }: { label: string; onClick: () => void; active?: boolean; title?: string }) => (
    <button
      className={`tb-btn${active ? ' active' : ''}`}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title || label}
      type="button"
    >
      {label}
    </button>
  );

  const Sep = () => <div className="tb-sep" />;

  return (
    <div className="ep-content" onMouseDown={e => e.stopPropagation()}>
      <div className="tb">
        {/* Headings */}
        <B label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} />
        <B label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
        <B label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />
        <Sep />
        {/* Inline */}
        <B label="B" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold" />
        <B label="I" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic" />
        <B label="U" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline" />
        <B label="S" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough" />
        <Sep />
        {/* Lists */}
        <B label="• List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
        <B label="1. List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
        <B label="❝" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote" />
        <Sep />
        {/* Align */}
        <B label="≡L" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left" />
        <B label="≡C" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center" />
        <B label="≡R" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right" />
        <Sep />
        {/* Table */}
        <button
          className="tb-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); openDropAt(e, setTableOpen, setTablePos); }}
          title="Insert table"
        >
          ⊞ Table
        </button>
        {/* Image */}
        <button
          className="tb-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); fileRef.current?.click(); }}
          title="Upload image"
        >
          🖼 Image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
        />
        {/* YouTube */}
        <button
          className="tb-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); openDropAt(e, setYtOpen, setYtPos); }}
          title="Embed YouTube"
        >
          ▶ YouTube
        </button>
        {/* Link */}
        <button
          className="tb-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); setLinkUrl(editor.getAttributes('link').href || ''); openDropAt(e, setLinkOpen, setLinkPos); }}
          title="Insert link"
        >
          🔗 Link
        </button>
        {/* Color */}
        <button
          className="tb-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); openDropAt(e, setColorOpen, setColorPos); }}
          title="Text color"
          style={{ borderBottom: '3px solid currentColor' }}
        >
          A Color
        </button>
      </div>

      <EditorContent editor={editor} />

      {/* Color picker */}
      {colorOpen && (
        <div
          className="color-picker-drop"
          style={{ top: colorPos.top, left: colorPos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Text Color</div>
          <div className="cp-swatches">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className="cp-swatch"
                style={{ background: c }}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setColorOpen(false); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Table picker */}
      {tableOpen && (
        <div
          className="table-picker-drop"
          style={{ top: tablePos.top, left: tablePos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="t-lbl">{tableHover.r > 0 ? `${tableHover.r} × ${tableHover.c}` : 'Select table size'}</div>
          <div className="tgrid">
            {Array.from({ length: 8 }, (_, r) =>
              Array.from({ length: 8 }, (_, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`tcell${r < tableHover.r && c < tableHover.c ? ' hl' : ''}`}
                  onMouseEnter={() => setTableHover({ r: r + 1, c: c + 1 })}
                  onMouseDown={e => {
                    e.preventDefault();
                    editor.chain().focus().insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: true }).run();
                    setTableOpen(false);
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Link panel */}
      {linkOpen && (
        <div
          className="fpanel"
          style={{ top: linkPos.top, left: linkPos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="fpanel-title">
            Insert Link
            <button type="button" onClick={() => setLinkOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 15 }}>✕</button>
          </div>
          <input
            className="fp-inp"
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); insertLink(); } }}
            autoFocus
          />
          <div className="fp-row">
            <button type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }} onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}>Remove</button>
            <button type="button" className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px' }} onMouseDown={e => { e.preventDefault(); insertLink(); }}>Insert</button>
          </div>
        </div>
      )}

      {/* YouTube panel */}
      {ytOpen && (
        <div
          className="fpanel"
          style={{ top: ytPos.top, left: ytPos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="fpanel-title">
            Embed YouTube
            <button type="button" onClick={() => setYtOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 15 }}>✕</button>
          </div>
          <input
            className="fp-inp"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={ytUrl}
            onChange={e => setYtUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); insertYt(); } }}
            autoFocus
          />
          <div className="fp-row">
            <button type="button" className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px' }} onMouseDown={e => { e.preventDefault(); insertYt(); }}>Embed</button>
          </div>
        </div>
      )}
    </div>
  );
}
