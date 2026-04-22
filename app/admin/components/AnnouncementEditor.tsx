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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { showToast } from "./Toast";
import {
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminUploadImage,
} from "../../lib/api";
import { getToken } from "../../lib/auth";
import type { Announcement } from "../../lib/types";
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
  announcement?: Announcement;
}

export default function AnnouncementEditor({ announcement }: Props) {
  const router = useRouter();
  const isNew = !announcement;
  const coverRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(announcement?.title ?? "");
  const [slug, setSlug] = useState(announcement?.slug ?? "");
  const [excerpt, setExcerpt] = useState(announcement?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(announcement?.coverImage ?? "");
  const [publishedAt, setPublishedAt] = useState(
    announcement?.publishedAt ? announcement.publishedAt.slice(0, 10) : "",
  );
  const [recommend, setRecommend] = useState(announcement?.recommend ?? false);
  const [saving, setSaving] = useState(false);
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [coverUrlInput, setCoverUrlInput] = useState(
    announcement?.coverImage ?? "",
  );
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EXTENSIONS,
    content: announcement?.contentHtml ?? "",
    onUpdate: () => forceUpdate((n) => n + 1),
    onSelectionUpdate: () => forceUpdate((n) => n + 1),
    editorProps: {
      attributes: {
        class: "ed-prose",
        "data-placeholder": "Write your announcement here…",
      },
    },
  });

  function slugify(val: string) {
    return val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
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
      const data: Partial<Announcement> = {
        title,
        slug,
        excerpt,
        contentHtml: editor?.getHTML() ?? "",
        coverImage,
        status,
        recommend,
        publishedAt: publishedAt
          ? new Date(publishedAt).toISOString()
          : undefined,
      };
      if (isNew) {
        await adminCreateAnnouncement(data, token);
        showToast("Announcement created");
      } else {
        await adminUpdateAnnouncement(announcement._id, data, token);
        showToast("Announcement saved");
      }
      router.push("/admin/announcements");
    } catch {
      showToast("Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="ep2-layout">
      <div className="ep2-header">
        <Link
          href="/admin/announcements"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "ep2-back",
          )}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> Back
        </Link>
        <span className="ep2-title">
          {isNew ? "New Announcement" : title || "Edit Announcement"}
        </span>
        <div className="ep2-actions">
          {slug && (
            <a
              href={`/announcements/${slug}`}
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
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                type="text"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (isNew) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="ann-slug">Slug</Label>
              <Input
                id="ann-slug"
                type="text"
                placeholder="url-slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="ann-date">Published Date</Label>
              <Input
                id="ann-date"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
            <div className="form-group">
              <div
                className="flex items-center gap-2"
                style={{ cursor: "pointer" }}
              >
                <Checkbox
                  id="ann-recommend"
                  checked={recommend}
                  onCheckedChange={(v) => setRecommend(v === true)}
                />
                <Label
                  htmlFor="ann-recommend"
                  style={{ cursor: "pointer", fontWeight: 400 }}
                >
                  Feature in Paper Archives
                </Label>
              </div>
            </div>
            <div className="form-group">
              <Label htmlFor="ann-excerpt">Excerpt</Label>
              <textarea
                id="ann-excerpt"
                className="form-input"
                rows={3}
                placeholder="Short description shown in list view"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Label style={{ marginBottom: 0 }}>Cover Image</Label>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    type="button"
                    variant={coverMode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCoverMode("upload")}
                  >
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant={coverMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCoverMode("url")}
                  >
                    URL
                  </Button>
                </div>
              </div>
              {coverImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={coverImage}
                  alt="cover"
                  style={{
                    width: "100%",
                    maxHeight: 100,
                    objectFit: "cover",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                />
              )}
              {coverMode === "upload" ? (
                <>
                  <div
                    className="uzone"
                    onClick={() => coverRef.current?.click()}
                  >
                    {coverImage
                      ? "Click to replace"
                      : "Click to upload cover image"}
                  </div>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCoverUpload(f);
                      e.target.value = "";
                    }}
                  />
                </>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (coverUrlInput.trim())
                        setCoverImage(coverUrlInput.trim());
                    }}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
