"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipTapImage from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import { showToast } from "./Toast";
import { adminCreatePage, adminUpdatePage } from "../../lib/api";
import { getToken } from "../../lib/auth";
import type { Page } from "../../lib/types";
import { EditorToolbar } from "./EditorToolbar";

const EXTENSIONS = [
  StarterKit,
  Underline,
  TextStyle,
  Color,
  FontFamily.configure({ types: ["textStyle"] }),
  FontSize.configure({ types: ["textStyle"] }),
  Highlight.configure({ multicolor: true }),
  TipTapLink.configure({ openOnClick: false }),
  TipTapImage,
  Youtube.configure({ controls: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

interface Props {
  page?: Page;
  allPages?: Page[];
}

export default function PageEditor({ page, allPages = [] }: Props) {
  const router = useRouter();
  const isNew = !page;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [parentId, setParentId] = useState(
    typeof page?.parent === "string" ? page.parent : (page?.parent as unknown as { _id?: string })?._id ?? ""
  );
  const [disabled, setDisabled] = useState(page?.disabled ?? false);
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(page?.seoDescription ?? "");
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EXTENSIONS,
    content: page?.contentHtml ?? "",
    editorProps: {
      attributes: { class: "ed-prose", "data-placeholder": "Start writing content here…" },
    },
  });

  function slugify(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function save(status: "draft" | "published") {
    if (!title.trim()) { showToast("Title is required"); return; }
    if (!slug.trim()) { showToast("Slug is required"); return; }
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const data: Partial<Page> & { parent?: string | null; disabled?: boolean } = {
        title, slug,
        contentHtml: editor?.getHTML() ?? "",
        seoTitle, seoDescription: seoDesc, status,
        parent: parentId || null,
        disabled,
      };
      if (isNew) {
        await adminCreatePage(data, token);
        showToast("Page created");
      } else {
        await adminUpdatePage(page._id, data, token);
        showToast("Page saved");
      }
      router.push("/admin/pages");
    } catch {
      showToast("Save failed");
      setSaving(false);
    }
  }

  const parentOptions = allPages.filter(p => p._id !== page?._id);

  return (
    <div className="ep2-layout">
      <div className="ep2-header">
        <Link href="/admin/pages" className="ep2-back">← Back</Link>
        <span className="ep2-title">{isNew ? "New Page" : title || "Edit Page"}</span>
        <div className="ep2-actions">
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}
            onClick={() => save("draft")} disabled={saving}>Save Draft</button>
          <button className="btn btn-primary" onClick={() => save("published")} disabled={saving}>
            {saving ? "Saving…" : "✓ Publish"}
          </button>
        </div>
      </div>

      <div className="ep2-toolbar-full">
        <EditorToolbar editor={editor} />
      </div>

      <div className="ep2-columns">
        <div className="ep2-editor-col">
          <EditorContent editor={editor} />
        </div>

        <div className="ep2-sidebar">
          <div className="ep2-fields">
            <div className="form-group">
              <label className="form-label">Page Title</label>
              <input className="form-input" type="text" placeholder="Page title" value={title}
                onChange={e => { setTitle(e.target.value); if (isNew) setSlug(slugify(e.target.value)); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug (URL)</label>
              <input className="form-input" type="text" placeholder="page-slug" value={slug}
                onChange={e => setSlug(slugify(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Page</label>
              <select className="form-input" value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">— None (root level) —</option>
                {parentOptions.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: "var(--gold)", cursor: "pointer" }} />
                Non-navigable (group header)
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">SEO Title</label>
              <input className="form-input" type="text" placeholder="Optional SEO title" value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">SEO Description</label>
              <textarea className="form-input" rows={3} placeholder="Optional meta description" value={seoDesc}
                onChange={e => setSeoDesc(e.target.value)} style={{ resize: "vertical" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
