"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichEditor from "./RichEditor";
import { showToast } from "./Toast";
import { adminCreatePage, adminUpdatePage } from "../../lib/api";
import { getToken } from "../../lib/auth";
import type { Page } from "../../lib/types";

interface Props {
  page?: Page;
}

export default function PageEditor({ page }: Props) {
  const router = useRouter();
  const isNew = !page;

  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [content, setContent] = useState(page?.contentHtml || "");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(page?.seoDescription || "");
  const [saving, setSaving] = useState(false);

  function slugify(val: string) {
    return val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function onTitleChange(val: string) {
    setTitle(val);
    if (isNew) setSlug(slugify(val));
  }

  async function save(status: "draft" | "published") {
    if (!title.trim()) {
      showToast("Title is required");
      return;
    }
    if (!slug.trim()) {
      showToast("Slug is required");
      return;
    }
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const data = {
        title,
        slug,
        contentHtml: content,
        seoTitle,
        seoDescription: seoDesc,
        status,
      };
      if (isNew) {
        const created = await adminCreatePage(data, token);
        showToast("Page created");
        router.push(`/admin/pages/${created._id}`);
      } else {
        await adminUpdatePage(page._id, data, token);
        showToast("Page saved");
      }
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "#f0ede6", minHeight: "100vh", margin: -28 }}>
      <div className="ep-header">
        <Link href="/admin/pages" className="ep-back">
          ← Back
        </Link>
        <div className="ep-title">
          {isNew ? "New Page" : title || "Edit Page"}
        </div>
        <div className="ep-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: "7px 14px" }}
            onClick={() => save("draft")}
            disabled={saving}
          >
            Save Draft
          </button>
          <button
            className="btn btn-primary"
            onClick={() => save("published")}
            disabled={saving}
          >
            {saving ? "Saving…" : "✓ Publish"}
          </button>
        </div>
      </div>

      <div className="ep-body">
        <div className="ep-meta">
          <div
            className="form-group sp2"
            style={{ margin: 0, gridColumn: "span 2" }}
          >
            <label className="form-label">Page Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="Page title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Slug (URL)</label>
            <input
              className="form-input"
              type="text"
              placeholder="page-slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">SEO Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="Optional SEO title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div
            className="form-group sp2"
            style={{ margin: 0, gridColumn: "span 2" }}
          >
            <label className="form-label">SEO Description</label>
            <input
              className="form-input"
              type="text"
              placeholder="Optional meta description"
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
            />
          </div>
        </div>

        <RichEditor content={content} onChange={setContent} />
      </div>
    </div>
  );
}
