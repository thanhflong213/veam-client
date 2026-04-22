'use client';

import AdminPager from './AdminPager';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

interface Props {
  loading: boolean;
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  pageSize?: number;
  onPageSize?: (n: number) => void;
  children: React.ReactNode;
}

export default function AdminTableSection({
  loading, page, totalPages, onPage, pageSize = 10, onPageSize, children,
}: Props) {
  return (
    <div className="a-tbl-section">
      {loading ? (
        <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>
      ) : (
        <>
          <div className="a-tbl-scroll">
            {children}
          </div>
          <div className="a-pager-bar">
            <div className="a-pager-size">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSize?.(Number(e.target.value))}
                className="a-pager-size-select"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <AdminPager page={page} totalPages={totalPages} onPage={onPage} />
          </div>
        </>
      )}
    </div>
  );
}
