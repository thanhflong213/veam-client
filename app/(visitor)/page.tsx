import { getSettings } from "../lib/api";
import HeroSlider from "./components/HeroSlider";

export default async function HomePage() {
  let settings: import("../lib/types").Settings = {
    siteName: "VEAM",
    activeTheme: "modern",
    heroSlides: [],
  };
  try {
    settings = await getSettings();
  } catch {
    /* use defaults */
  }

  return (
    <>
      {/* Hero */}
      <div id="hero-section">
        <HeroSlider slides={settings.heroSlides} />
        <div className="home-strip">
          <div className="inner">
            <div className="strip-item">
              <div>
                <span className="si-label">Conference Date</span>
                <span className="si-val">July 13–14, 2026</span>
              </div>
            </div>
            <div className="strip-divider" />
            <div className="strip-item">
              <div>
                <span className="si-label">Location</span>
                <span className="si-val">Hue, Vietnam</span>
              </div>
            </div>
            <div className="strip-divider" />
            <div className="strip-item">
              <div>
                <span className="si-label">Paper Deadline</span>
                <span className="si-val">May 31, 2026</span>
              </div>
            </div>
            <div className="strip-divider" />
            <div className="strip-item">
              <div>
                <span className="si-label">Notification</span>
                <span className="si-val">June 15, 2026</span>
              </div>
            </div>
            <div className="strip-divider" />
            <div className="strip-item">
              <div>
                <span className="si-label">Registration</span>
                <span className="si-val">June 16–30, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[500px]"></div>
      {/*       
      <div className="home-section" style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="inner">
          <div className="section-head">
            <h2>Keynote Speakers</h2>
            <p>Confirmed speakers for VEAM 2026</p>
          </div>
          <div className="keynote-grid">
            {[
              { initials: 'PA', name: 'Prof. Philippe Aghion', inst: 'London School of Economics and Political Science', topic: 'Innovation & Growth Economics' },
              { initials: 'TKP', name: 'Prof. Thi Kim Cuong PHAM', inst: 'University of Paris Nanterre', topic: 'Development Economics' },
              { initials: 'MB', name: 'Prof. Maria-Giuseppina BRUNA', inst: 'IPAG Business School, France', topic: 'Management & Diversity' },
            ].map(sp => (
              <div className="keynote-card" key={sp.initials}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="kc-avatar">{sp.initials}</div>
                  <div>
                    <div className="kc-name">{sp.name}</div>
                    <div className="kc-inst">{sp.inst}</div>
                    <div className="kc-topic">{sp.topic}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="keynote-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                TBA<br /><span style={{ fontSize: 11 }}>To be announced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-section" style={{ background: 'var(--cream)' }}>
        <div className="inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <div className="section-head">
              <h2>Important Dates</h2>
              <p>Key deadlines for VEAM 2026</p>
            </div>
            <div className="timeline">
              {[
                { date: 'May 31\n2026', title: 'Paper Submission Deadline', desc: '5:00 PM Hanoi time (GMT+7)' },
                { date: 'Jun 15\n2026', title: 'Acceptance Notification', desc: 'Authors notified by email' },
                { date: 'Jun 16\n2026', title: 'Registration Opens', desc: 'Early bird rates available' },
                { date: 'Jun 30\n2026', title: 'Registration Closes', desc: 'Final deadline for all participants' },
                { date: 'Jul 13–14\n2026', title: 'Main Conference', desc: 'Hue University of Economics, Vietnam', done: true },
              ].map((item, i) => (
                <div className="tl-item" key={i}>
                  <div className="tl-date" style={{ whiteSpace: 'pre-line' }}>{item.date}</div>
                  <div className={`tl-dot${item.done ? ' done' : ''}`} />
                  <div className="tl-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-head">
              <h2>ISVE Special Sessions</h2>
              <p>International Society of Vietnam Economists</p>
            </div>
            <div className="sessions-grid" style={{ gridTemplateColumns: '1fr' }}>
              {[
                { title: 'Behavioral Economics and Environment', chair: 'Chair: Khanh-Nam Pham, UEH, Vietnam' },
                { title: 'Development Economics', chair: 'Chair: Quang Thanh Le, University of Wollongong, Australia' },
                { title: 'Theoretical Economics', chair: 'Chair: Ngoc-Sang Pham, EM Normandie, France' },
              ].map((s, i) => (
                <div className="session-card" key={i}>
                  <div className="sc-title">{s.title}</div>
                  <div className="sc-chair">{s.chair}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="home-section" style={{ background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="inner">
          <div className="section-head">
            <h2>Publication Opportunities</h2>
            <p>Selected papers from VEAM 2026 will be considered for publication</p>
          </div>
          <div className="pub-grid">
            {[
              { title: "Revue d'Économie du Développement", desc: 'ISVE–VEAM Special Issue featuring selected conference papers' },
              { title: 'Journal of International Economics and Management', desc: 'Foreign Trade University flagship journal' },
              { title: 'Review of Development Economics', desc: 'John Wiley & Sons Ltd. peer-reviewed journal' },
              { title: 'Journal of Asian Business and Economic Studies', desc: 'Emerald Publishing international journal' },
            ].map((p, i) => (
              <div className="pub-card" key={i}>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="home-section">
        <div className="inner">
          <div className="section-head">
            <h2>Organizing Institutions</h2>
            <p>VEAM 2026 is organized by a consortium of universities and research centers</p>
          </div>
          <div className="org-grid">
            {[
              { name: 'University of Economics – Hue University', role: 'Host Institution' },
              { name: 'Foreign Trade University', role: 'Co-organizer' },
              { name: 'DEPOCEN', role: 'Development and Policies Research Center' },
              { name: 'CNRS France', role: 'French National Center for Scientific Research' },
              { name: 'University of Economics Ho Chi Minh City', role: 'Co-organizer' },
              { name: 'ISVE', role: 'International Society of Vietnam Economists' },
            ].map((org, i) => (
              <div className="org-card" key={i}>
                <h4>{org.name}</h4>
                <p>{org.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </>
  );
}
