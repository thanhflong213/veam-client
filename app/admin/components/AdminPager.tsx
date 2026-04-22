'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export default function AdminPager({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-1" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          size="icon-sm"
          onClick={() => onPage(p)}
          className={cn(p === page && 'pointer-events-none')}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </Button>
      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
