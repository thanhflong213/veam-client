"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipTapImage from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Color,
  FontFamily,
  FontSize,
  TextStyle,
} from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import { showToast } from "./Toast";
import {
  adminCreateInstitution,
  adminUpdateInstitution,
  adminUploadImage,
} from "../../lib/api";
import { getToken } from "../../lib/auth";
import type { Institution } from "../../lib/types";
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
  institution?: Institution;
}

export default function InstitutionEditor({ institution }: Props) {
  const router = useRouter();
  const isNew = !institution;
  const coverRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(institution?.title ?? "");
  const [slug, setSlug] = useState(institution?.slug ?? "");
  const [excerpt, setExcerpt] = useState(institution?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(institution?.coverImage ?? "");
  const [publishedAt, setPublishedAt] = useState(
    institution?.publishedAt ? institution.publishedAt.slice(0, 10) : "",
  );
  const [saving, setSaving] = useState(false);
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [coverUrlInput, setCoverUrlInput] = useState(institution?.coverImage ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EXTENSIONS,
    content: institution?.contentHtml ?? "",
    editorProps: {
      attributes: {
        class: "ed-prose",
        "data-placeholder": "Write about this institution…",
      },
    },
  });

  function slugify(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleCoverUpload(file: File) {
    const token = getToken();
    if (!token) return;
    try {
      const { url } = await adminUploadImage(file, token);
      setCoverImage(url);
    } catch {
      showToast("Cover upload failed");
    }
  }

  async function save(status: "draft" | "published") {
    if (!title.trim()) { showToast("Title is required"); return; }
    if (!slug.trim()) { showToast("Slug is required"); return; }
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const data: Partial<Institution> = {
        title, slug, excerpt,
        contentHtml: editor?.getHTML() ?? "",
        coverImage, status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      };
      if (isNew) {
        await adminCreateInstitution(data, token);
        showToast("Institution created");
      } else {
        await adminUpdateInstitution(institution._id, data, token);
        showToast("Institution saved");
      }
      router.push("/admin/institutions");
    } catch {
      showToast("Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="ep2-layout">
      <div className="ep2-header">
        <Link href="/admin/institutions" className="ep2-back">← Back</Link>
        <span className="ep2-title">{isNew ? "New Institution" : title || "Edit Institution"}</span>
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
              <label className="form-label">Title</label>
              <input className="form-input" type="text" placeholder="Institution name" value={title}
                onChange={(e) => { setTitle(e.target.value); if (isNew) setSlug(slugify(e.target.value)); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input className="form-input" type="text" placeholder="url-slug" value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Published Date</label>
              <input className="form-input" type="date" value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Excerpt</label>
              <textarea className="form-input" rows={3} placeholder="Short description shown in list view"
                value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Cover Image</label>
                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" className={`ed-tb-btn${coverMode === "upload" ? " active" : ""}`}
                    style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => setCoverMode("upload")}>Upload</button>
                  <button type="button" className={`ed-tb-btn${coverMode === "url" ? " active" : ""}`}
                    style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => setCoverMode("url")}>URL</button>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {coverImage && <img src={coverImage} alt="cover"
                style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />}
              {coverMode === "upload" ? (
                <>
                  <div className="uzone" onClick={() => coverRef.current?.click()}>
                    {coverImage ? "Click to replace" : "Click to upload cover image"}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ""; }} />
                </>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="form-input" type="url" placeholder="https://example.com/image.jpg"
                    value={coverUrlInput} onChange={(e) => setCoverUrlInput(e.target.value)} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-secondary"
                    style={{ fontSize: 12, padding: "4px 12px", whiteSpace: "nowrap" }}
                    onClick={() => { if (coverUrlInput.trim()) setCoverImage(coverUrlInput.trim()); }}>Apply</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
