import type { Metadata } from "next";
import Link from "next/link";
import { getInstitutions } from "../../lib/api";
import type { Institution } from "../../lib/types";
import VisitorSidebar from "../components/VisitorSidebar";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Institutions – VEAM",
  description: "Organizing and partner institutions of VEAM.",
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

export default async function InstitutionsPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const searchQuery = q?.trim() ?? "";
  const currentPage = Math.max(1, Number(pageParam ?? 1));
  const limit = 10;

  let institutions: Institution[] = [];
  let total = 0;

  try {
    const res = await getInstitutions({
      page: currentPage,
      limit,
      search: searchQuery || undefined,
    });
    institutions = res.items || [];
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
    return `/institutions${qs ? "?" + qs : ""}`;
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
                    {total} result{total !== 1 ? "s" : ""} for &ldquo;
                    {searchQuery}&rdquo;
                  </>
                ) : (
                  <>No results found for &ldquo;{searchQuery}&rdquo;</>
                )}
              </p>
              <Link
                href="/institutions"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  color: "var(--gold)",
                  textDecoration: "none",
                  marginTop: 4,
                  display: "inline-block",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />{" "}
                All institutions
              </Link>
            </>
          ) : (
            <>
              <h2>Institutions</h2>
              <p>Organizing and partner institutions of VEAM</p>
            </>
          )}
        </div>

        {institutions.length === 0 ? (
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "var(--text-muted)",
              marginTop: 16,
            }}
          >
            {searchQuery
              ? "Try a different search term."
              : "No institutions yet."}
          </p>
        ) : (
          <div className="content-card-list">
            {institutions.map((inst) => (
              <div key={inst._id} className="content-card">
                <Link
                  href={`/institutions/${inst.slug}`}
                  className="content-card-title"
                >
                  {inst.title}
                </Link>
                {inst.publishedAt && (
                  <div className="content-card-date">
                    ⊙ {formatDate(inst.publishedAt)}
                  </div>
                )}
                {inst.excerpt && (
                  <p className="content-card-excerpt">{inst.excerpt}</p>
                )}
                <Link
                  href={`/institutions/${inst.slug}`}
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
