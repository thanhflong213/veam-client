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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { showToast } from "./Toast";
import { adminCreatePage, adminUpdatePage } from "../../lib/api";
import { getToken } from "../../lib/auth";
import type { Page } from "../../lib/types";
import { EditorToolbar } from "./EditorToolbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
    typeof page?.parent === "string"
      ? page.parent
      : ((page?.parent as unknown as { _id?: string })?._id ?? ""),
  );
  const [disabled, setDisabled] = useState(page?.disabled ?? false);
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(page?.seoDescription ?? "");
  const [saving, setSaving] = useState(false);
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EXTENSIONS,
    content: page?.contentHtml ?? "",
    onUpdate: () => forceUpdate((n) => n + 1),
    onSelectionUpdate: () => forceUpdate((n) => n + 1),
    editorProps: {
      attributes: {
        class: "ed-prose",
        "data-placeholder": "Start writing content here…",
      },
    },
  });

  function slugify(val: string) {
    return val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
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
      const data: Partial<Page> & {
        parent?: string | null;
        disabled?: boolean;
      } = {
        title,
        slug,
        contentHtml: editor?.getHTML() ?? "",
        seoTitle,
        seoDescription: seoDesc,
        status,
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

  const parentOptions = allPages.filter((p) => p._id !== page?._id);

  return (
    <div className="ep2-layout">
      <div className="ep2-header">
        <Link
          href="/admin/pages"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "ep2-back",
          )}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> Back
        </Link>
        <span className="ep2-title">
          {isNew ? "New Page" : title || "Edit Page"}
        </span>
        <div className="ep2-actions">
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Preview
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => save("draft")}
            disabled={saving}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => save("published")}
            disabled={saving}
            className="gap-1.5"
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} /> Publish
              </>
            )}
          </Button>
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
              <Label htmlFor="pg-title">Page Title</Label>
              <Input
                id="pg-title"
                type="text"
                placeholder="Page title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (isNew) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="pg-slug">Slug (URL)</Label>
              <Input
                id="pg-slug"
                type="text"
                placeholder="page-slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="pg-parent">Parent Page</Label>
              <select
                id="pg-parent"
                className="form-input"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— None (root level) —</option>
                {parentOptions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <div
                className="flex items-center gap-2"
                style={{ cursor: "pointer" }}
              >
                <Checkbox
                  id="pg-disabled"
                  checked={disabled}
                  onCheckedChange={(v) => setDisabled(v === true)}
                />
                <Label
                  htmlFor="pg-disabled"
                  style={{ cursor: "pointer", fontWeight: 400 }}
                >
                  Non-navigable (group header)
                </Label>
              </div>
            </div>
            <div className="form-group">
              <Label htmlFor="pg-seo-title">SEO Title</Label>
              <Input
                id="pg-seo-title"
                type="text"
                placeholder="Optional SEO title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <Label htmlFor="pg-seo-desc">SEO Description</Label>
              <textarea
                id="pg-seo-desc"
                className="form-input"
                rows={3}
                placeholder="Optional meta description"
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
