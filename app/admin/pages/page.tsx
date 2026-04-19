"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetPages, adminDeletePage } from "../../lib/api";
import { getToken } from "../../lib/auth";
import { showToast } from "../components/Toast";
import type { Page } from "../../lib/types";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getToken();
    if (!token) return;
    try {
      const data = await adminGetPages(token);
      setPages(data);
    } catch {
      showToast("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await adminDeletePage(id, token);
      showToast("Page deleted");
      load();
    } catch {
      showToast("Delete failed");
    }
  }

  return (
    <>
      <div className="a-hdr">
        <h2>Pages</h2>
        <Link href="/admin/pages/new" className="btn btn-primary">
          + New Page
        </Link>
      </div>
      {loading ? (
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            color: "var(--text-muted)",
            padding: 20,
          }}
        >
          Loading…
        </div>
      ) : (
        <div className="a-tbl-wrap">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ color: "var(--text-muted)", textAlign: "center" }}
                  >
                    No pages yet.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: "var(--navy)" }}>
                      {p.title}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>/{p.slug}</td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          href={`/admin/pages/${p._id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: "5px 10px" }}
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: 12, padding: "5px 10px" }}
                          onClick={() => handleDelete(p._id, p.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
