import type { Metadata } from "next";
import Link from "next/link";
import { getAnnouncements } from "../../lib/api";
import type { Announcement } from "../../lib/types";
import VisitorSidebar from "../components/VisitorSidebar";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Announcements – VEAM",
  description:
    "Latest news, calls for papers, and conference updates from VEAM.",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr)
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const searchQuery = q?.trim() ?? "";
  const currentPage = Math.max(1, Number(pageParam ?? 1));
  const limit = 10;

  let announcements: Announcement[] = [];
  let total = 0;

  try {
    const res = await getAnnouncements({
      page: currentPage,
      limit,
      search: searchQuery || undefined,
    });
    announcements = res.items || [];
    total = res.total || 0;
  } catch {
    /* ignore */
  }

  const totalPages = Math.ceil(total / limit);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString();
    return `/announcements${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="page-body">
      <div>
        <div className="ann-header">
          {searchQuery ? (
            <>
              <h2>Search Results</h2>
              <p>
                {total > 0 ? (
                  <>
                    Showing <strong>{total}</strong> result
                    {total !== 1 ? "s" : ""} for{" "}
                    <strong>&ldquo;{searchQuery}&rdquo;</strong>
                  </>
                ) : (
                  <>
                    No results found for{" "}
                    <strong>&ldquo;{searchQuery}&rdquo;</strong>
                  </>
                )}
              </p>
              <Link
                href="/announcements"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  color: "var(--gold)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />{" "}
                All announcements
              </Link>
            </>
          ) : (
            <>
              <h2>Announcements</h2>
              <p>Latest news, calls for papers, and conference updates</p>
            </>
          )}
        </div>

        {announcements.length === 0 ? (
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "var(--text-muted)",
              marginTop: 16,
            }}
          >
            {searchQuery
              ? "Try a different search term."
              : "No announcements yet."}
          </p>
        ) : (
          <div className="content-card-list">
            {announcements.map((ann) => (
              <div key={ann._id} className="content-card">
                <Link
                  href={`/announcements/${ann.slug}`}
                  className="content-card-title"
                >
                  {ann.title}
                </Link>
                {ann.publishedAt && (
                  <div className="content-card-date">
                    ⊙ {formatDate(ann.publishedAt)}
                  </div>
                )}
                {ann.excerpt && (
                  <p className="content-card-excerpt">{ann.excerpt}</p>
                )}
                <Link
                  href={`/announcements/${ann.slug}`}
                  className="content-card-btn"
                >
                  READ MORE →
                </Link>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            {currentPage > 1 && (
              <Link href={pageUrl(currentPage - 1)} className="pg-btn">
                <i className="fa-solid fa-chevron-left" />
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageUrl(p)}
                className={`pg-btn${p === currentPage ? " active" : ""}`}
              >
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link href={pageUrl(currentPage + 1)} className="pg-btn">
                <i className="fa-solid fa-chevron-right" />
              </Link>
            )}
          </div>
        )}
      </div>

      <VisitorSidebar />
    </div>
  );
}
