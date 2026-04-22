"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { adminGetPages, adminDeletePage } from "../../lib/api";
import { getToken } from "../../lib/auth";
import { showToast } from "../components/Toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import AdminTableSection from "../components/AdminTableSection";
import type { Page } from "../../lib/types";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetPages(token)
      .then(data => setPages(data))
      .catch(() => showToast("Failed to load pages"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await adminDeletePage(id, token);
      showToast("Page deleted");
      adminGetPages(token).then(setPages).catch(() => {});
    } catch {
      showToast("Delete failed");
    }
  }

  const totalPages = Math.ceil(pages.length / pageSize);
  const slice = pages.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="a-hdr">
        <h2>Pages</h2>
        <Link href="/admin/pages/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          <FontAwesomeIcon icon={faPlus} /> New Page
        </Link>
      </div>
      <AdminTableSection loading={loading} page={page} totalPages={totalPages} onPage={setPage} pageSize={pageSize} onPageSize={(n) => { setPageSize(n); setPage(1); }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No pages yet.</TableCell>
              </TableRow>
            ) : slice.map(p => (
              <TableRow key={p._id}>
                <TableCell className="font-semibold" style={{ color: "var(--navy)" }}>
                  <span className="a-cell-trunc" title={p.title}>{p.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="a-cell-trunc a-cell-trunc-wide" title={`/${p.slug}`}>/{p.slug}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/pages/${p._id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
                      <FontAwesomeIcon icon={faPencil} /> Edit
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(p._id, p.title)}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableSection>
    </>
  );
}
