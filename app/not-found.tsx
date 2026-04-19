import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, color: 'var(--navy)' }}>404</h1>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, color: 'var(--text-muted)' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>Go Home</Link>
    </div>
  );
}
