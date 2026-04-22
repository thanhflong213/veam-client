'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faRotateLeft, faRotateRight,
  faBold, faItalic, faUnderline, faStrikethrough, faCode, faTerminal,
  faA, faHighlighter,
  faAlignLeft, faAlignCenter, faAlignRight, faAlignJustify,
  faListUl, faListOl, faOutdent, faIndent,
  faQuoteLeft, faMinus,
  faLink, faImage, faTable,
  faPlus, faTrash, faTextSlash,
} from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';

const TEXT_COLORS = [
  '#000000', '#1a2744', '#b8973a', '#c0392b', '#27ae60', '#2980b9', '#8e44ad', '#e67e22',
  '#ffffff', '#5a5a5a', '#888888', '#d8d0be', '#b3e5c4', '#fbbaba', '#fef3a0', '#c8e6f7',
];

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa',
  '#f0fdf4', '#eff6ff', '#fdf4ff', '#fff7ed', 'transparent',
];

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Source Serif 4', value: "'Source Serif 4', serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

const FONT_SIZES = ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '60px', '72px'];

type Panel = 'textColor' | 'highlight' | 'link' | 'image' | 'youtube' | 'table' | null;

function Btn({ icon, title, onClick, active, disabled, children, style }: {
  icon?: IconDefinition; title?: string; onClick: () => void;
  active?: boolean; disabled?: boolean; children?: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      className={`ed-tb-btn${active ? ' active' : ''}${disabled ? ' disabled' : ''}`}
      onMouseDown={e => { e.preventDefault(); if (!disabled) onClick(); }}
      title={title}
      style={style}
    >
      {icon ? <FontAwesomeIcon icon={icon} /> : children}
    </button>
  );
}

function Sep() { return <div className="ed-tb-sep" />; }

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [tableHover, setTableHover] = useState<[number, number]>([0, 0]);

  if (!editor) return null;

  function openPanel(p: Exclude<Panel, null>) {
    setPanel(prev => prev === p ? null : p);
    if (p === 'link') setLinkUrl(editor!.getAttributes('link').href || '');
  }

  function insertLink() {
    if (linkUrl.trim()) editor!.chain().focus().setLink({ href: linkUrl.trim() }).run();
    else editor!.chain().focus().unsetLink().run();
    setPanel(null); setLinkUrl('');
  }
  function insertImage() {
    if (imgUrl.trim()) editor!.chain().focus().setImage({ src: imgUrl.trim() }).run();
    setPanel(null); setImgUrl('');
  }
  function insertYt() {
    if (ytUrl.trim()) editor!.chain().focus().setYoutubeVideo({ src: ytUrl.trim() }).run();
    setPanel(null); setYtUrl('');
  }

  const hl = [1, 2, 3, 4].find(l => editor.isActive('heading', { level: l }))?.toString() ?? '0';
  const activeTextColor = editor.getAttributes('textStyle').color as string | undefined;
  const activeHL = editor.getAttributes('highlight').color as string | undefined;
  const activeFontFamily = editor.getAttributes('textStyle').fontFamily as string | undefined;
  const activeFontSize = editor.getAttributes('textStyle').fontSize as string | undefined;
  const inTable = editor.isActive('table');

  return (
    <div className="ed-tb-container">
      <div className="ed-tb">

        {/* History */}
        <Btn icon={faRotateLeft} title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <Btn icon={faRotateRight} title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        <Sep />

        {/* Font family */}
        <select
          className="ed-tb-select"
          style={{ maxWidth: 116 }}
          value={activeFontFamily || ''}
          onChange={e => {
            if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
          title="Font family"
        >
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font size */}
        <select
          className="ed-tb-select"
          style={{ maxWidth: 66 }}
          value={activeFontSize || ''}
          onChange={e => {
            if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          title="Font size"
        >
          <option value="">Size</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}</option>)}
        </select>
        <Sep />

        {/* Heading */}
        <select
          className="ed-tb-select"
          style={{ maxWidth: 104 }}
          value={hl}
          onChange={e => {
            const v = e.target.value;
            if (v === '0') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 | 4 }).run();
          }}
          title="Paragraph style"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
        <Sep />

        {/* Inline styles */}
        <Btn icon={faBold} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
        <Btn icon={faItalic} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
        <Btn icon={faUnderline} title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
        <Btn icon={faStrikethrough} title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
        <Btn icon={faCode} title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} />
        <Btn icon={faTerminal} title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} />
        <Sep />

        {/* Text color */}
        <button
          type="button"
          className={`ed-tb-btn${panel === 'textColor' ? ' active' : ''}`}
          onMouseDown={e => { e.preventDefault(); openPanel('textColor'); }}
          title="Text color"
        >
          <span style={{ borderBottom: `3px solid ${activeTextColor || '#000'}`, lineHeight: 1.1, paddingBottom: 1 }}>
            <FontAwesomeIcon icon={faA} style={{ fontSize: 11 }} />
          </span>
        </button>

        {/* Highlight */}
        <button
          type="button"
          className={`ed-tb-btn${panel === 'highlight' ? ' active' : ''}`}
          onMouseDown={e => { e.preventDefault(); openPanel('highlight'); }}
          title="Highlight color"
          style={{ background: activeHL && activeHL !== 'transparent' ? activeHL : undefined }}
        >
          <FontAwesomeIcon icon={faHighlighter} style={{ fontSize: 11 }} />
        </button>
        <Sep />

        {/* Alignment */}
        <Btn icon={faAlignLeft} title="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
        <Btn icon={faAlignCenter} title="Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
        <Btn icon={faAlignRight} title="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
        <Btn icon={faAlignJustify} title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />
        <Sep />

        {/* Lists */}
        <Btn icon={faListUl} title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
        <Btn icon={faListOl} title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
        <Btn icon={faOutdent} title="Outdent" onClick={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!editor.can().liftListItem('listItem')} />
        <Btn icon={faIndent} title="Indent" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!editor.can().sinkListItem('listItem')} />
        <Sep />

        {/* Blocks */}
        <Btn icon={faQuoteLeft} title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
        <Btn icon={faMinus} title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Sep />

        {/* Media */}
        <Btn icon={faLink} title="Link" onClick={() => openPanel('link')} active={panel === 'link' || editor.isActive('link')} />
        <Btn icon={faImage} title="Image by URL" onClick={() => openPanel('image')} active={panel === 'image'} />
        <Btn icon={faYoutube} title="YouTube embed" onClick={() => openPanel('youtube')} active={panel === 'youtube'} />
        <Sep />

        {/* Table */}
        <Btn icon={faTable} title="Insert table" onClick={() => openPanel('table')} active={panel === 'table'} />
        {inTable && (
          <>
            <Btn icon={faPlus} title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()} />
            <Btn icon={faMinus} title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()} />
            <Btn title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>+C</Btn>
            <Btn title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>−C</Btn>
            <Btn icon={faTrash} title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} />
          </>
        )}
        <Sep />

        <Btn icon={faTextSlash} title="Clear all formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />

      </div>

      {/* ── Text color panel ── */}
      {panel === 'textColor' && (
        <div className="ed-inline-panel">
          <div className="ed-panel-label">Text Color</div>
          <div className="ed-cp-swatches">
            {TEXT_COLORS.map(c => (
              <button key={c} type="button" className="ed-cp-swatch"
                style={{ background: c, outline: activeTextColor === c ? '2px solid #1e3a5f' : undefined, outlineOffset: '2px' }}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setPanel(null); }}
              />
            ))}
          </div>
          <button type="button" className="ed-panel-link" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setPanel(null); }}>Reset</button>
        </div>
      )}

      {/* ── Highlight panel ── */}
      {panel === 'highlight' && (
        <div className="ed-inline-panel">
          <div className="ed-panel-label">Highlight Color</div>
          <div className="ed-cp-swatches">
            {HIGHLIGHT_COLORS.map(c => (
              <button key={c} type="button" className="ed-cp-swatch"
                style={{
                  background: c === 'transparent' ? 'white' : c,
                  border: c === 'transparent' ? '1px dashed #ccc' : '1px solid rgba(0,0,0,.15)',
                  outline: activeHL === c ? '2px solid #1e3a5f' : undefined,
                  outlineOffset: '2px',
                }}
                title={c === 'transparent' ? 'Remove highlight' : c}
                onMouseDown={e => {
                  e.preventDefault();
                  if (c === 'transparent') editor.chain().focus().unsetHighlight().run();
                  else editor.chain().focus().setHighlight({ color: c }).run();
                  setPanel(null);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Link panel ── */}
      {panel === 'link' && (
        <div className="ed-inline-panel">
          <form className="ed-panel-row" onSubmit={e => { e.preventDefault(); insertLink(); }}>
            <input className="ed-panel-input" type="url" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} autoFocus />
            <button type="submit" className="ed-panel-btn">Apply</button>
            <button type="button" className="ed-panel-cancel" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetLink().run(); setPanel(null); }}>Remove</button>
          </form>
        </div>
      )}

      {/* ── Image URL panel ── */}
      {panel === 'image' && (
        <div className="ed-inline-panel">
          <form className="ed-panel-row" onSubmit={e => { e.preventDefault(); insertImage(); }}>
            <input className="ed-panel-input" type="url" placeholder="https://example.com/image.jpg" value={imgUrl} onChange={e => setImgUrl(e.target.value)} autoFocus />
            <button type="submit" className="ed-panel-btn">Insert</button>
            <button type="button" className="ed-panel-cancel" onClick={() => setPanel(null)}>Cancel</button>
          </form>
        </div>
      )}

      {/* ── YouTube panel ── */}
      {panel === 'youtube' && (
        <div className="ed-inline-panel">
          <form className="ed-panel-row" onSubmit={e => { e.preventDefault(); insertYt(); }}>
            <input className="ed-panel-input" type="url" placeholder="https://www.youtube.com/watch?v=..." value={ytUrl} onChange={e => setYtUrl(e.target.value)} autoFocus />
            <button type="submit" className="ed-panel-btn">Embed</button>
            <button type="button" className="ed-panel-cancel" onClick={() => setPanel(null)}>Cancel</button>
          </form>
        </div>
      )}

      {/* ── Table picker panel ── */}
      {panel === 'table' && (
        <div className="ed-inline-panel">
          <div className="ed-panel-label" style={{ marginBottom: 6 }}>
            {tableHover[0] > 0 ? `${tableHover[0]} × ${tableHover[1]} table` : 'Select table size'}
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 22px)', gap: 2 }}
            onMouseLeave={() => setTableHover([0, 0])}
          >
            {Array.from({ length: 64 }, (_, i) => {
              const row = Math.floor(i / 8) + 1;
              const col = (i % 8) + 1;
              const highlighted = row <= tableHover[0] && col <= tableHover[1];
              return (
                <button
                  key={i}
                  type="button"
                  style={{
                    width: 22, height: 22, padding: 0,
                    border: `1px solid ${highlighted ? '#1e3a5f' : '#cbd5e1'}`,
                    background: highlighted ? 'rgba(26,58,95,0.18)' : 'white',
                    borderRadius: 2, cursor: 'pointer',
                  }}
                  onMouseEnter={() => setTableHover([row, col])}
                  onMouseDown={e => {
                    e.preventDefault();
                    editor!.chain().focus().insertTable({ rows: row, cols: col, withHeaderRow: true }).run();
                    setPanel(null);
                    setTableHover([0, 0]);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
