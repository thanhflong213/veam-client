import Link from 'next/link';
import type { Page } from '../../lib/types';

interface Props {
  siteName: string;
  pages: Page[];
}

export default function Footer({ siteName, pages }: Props) {
  const navPages = pages.filter(p => p.status === 'published');
  return (
    <footer className="site-footer">
      <div className="inner">
        <div className="fg">
          <div>
            <h4>{siteName}</h4>
            <p>
              The Vietnam Economists Annual Meeting is an annual conference for economists and
              social researchers worldwide to present scholarly works and foster academic dialogue.
            </p>
            <p style={{ marginTop: 12 }}>
              <a
                href="https://www.facebook.com/VEAM2016/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold-light)', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}
              >
                Facebook VEAM →
              </a>
            </p>
          </div>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              {navPages.map(p => (
                <li key={p._id}><Link href={`/${p.slug}`}>{p.title}</Link></li>
              ))}
              <li><Link href="/announcements">Announcements</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:veam@veam.org">veam@veam.org</a></li>
              <li><a href="tel:+842439351419">(84 24) 39351419</a></li>
              <li>8:00AM – 6:00PM</li>
            </ul>
          </div>
        </div>
        <div className="fb">
          <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <span>Vietnam Economists Annual Meeting</span>
        </div>
      </div>
    </footer>
  );
}
