import { getSettings } from "../lib/api";
import HeroSlider from "./components/HeroSlider";
import type { Settings } from "../lib/types";

const DEFAULT_SETTINGS: Settings = {
  siteName: "VEAM",
  activeTheme: "modern",
  heroSlides: [],
  conferenceInfo: { date: "", location: "" },
  importantDates: [],
  keynotes: [],
  specialSessions: [],
  publications: [],
  organizingInstitutions: [],
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default async function HomePage() {
  let settings: Settings = DEFAULT_SETTINGS;
  try {
    settings = await getSettings();
  } catch {
    /* use defaults */
  }

  const conf = settings.conferenceInfo ?? {};
  const dates = settings.importantDates ?? [];
  const keynotes = settings.keynotes ?? [];
  const sessions = settings.specialSessions ?? [];
  const pubs = settings.publications ?? [];
  const orgs = settings.organizingInstitutions ?? [];

  const stripSlots = [
    conf.date ? { label: "Conference Date", value: conf.date } : null,
    conf.location ? { label: "Location", value: conf.location } : null,
    ...dates.slice(0, 3).map((d) => ({ label: d.title, value: d.date })),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {/* Hero */}
      <div id="hero-section">
        <HeroSlider slides={settings.heroSlides} />
        {stripSlots.length > 0 && (
          <div className="home-strip">
            <div className="inner">
              {stripSlots.map((slot, i) => (
                <div key={i} style={{ display: "contents" }}>
                  {i > 0 && <div className="strip-divider" />}
                  <div className="strip-item">
                    <div>
                      <span className="si-label">{slot.label}</span>
                      <span className="si-val">{slot.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keynote Speakers */}
      {keynotes.length > 0 && (
        <div
          className="home-section"
          style={{
            background: "white",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="inner">
            <div className="section-head">
              <h2>Keynote Speakers</h2>
              <p>Confirmed speakers for VEAM 2026</p>
            </div>
            <div className="keynote-grid">
              {keynotes.map((sp, i) => (
                <div className="keynote-card" key={i}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    {sp.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sp.avatarUrl}
                        alt={sp.name}
                        className="kc-avatar"
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      <div className="kc-avatar">{initials(sp.name)}</div>
                    )}
                    <div>
                      <div className="kc-name">{sp.name}</div>
                      <div className="kc-inst">{sp.institution}</div>
                      <div className="kc-topic">{sp.topic}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Important Dates + Special Sessions */}
      {(dates.length > 0 || sessions.length > 0) && (
        <div className="home-section" style={{ background: "var(--cream)" }}>
          <div
            className="inner"
            style={{
              display: "grid",
              gridTemplateColumns:
                dates.length > 0 && sessions.length > 0 ? "1fr 1fr" : "1fr",
              gap: 48,
            }}
          >
            {dates.length > 0 && (
              <div>
                <div className="section-head">
                  <h2>Important Dates</h2>
                  <p>Key deadlines for VEAM 2026</p>
                </div>
                <div className="timeline">
                  {dates.map((item, i) => (
                    <div className="tl-item" key={i}>
                      <div
                        className="tl-date"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {item.date}
                      </div>
                      <div className="tl-dot" />
                      <div className="tl-content">
                        <h4>{item.title}</h4>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sessions.length > 0 && (
              <div>
                <div className="section-head">
                  <h2>ISVE Special Sessions</h2>
                  <p>International Society of Vietnam Economists</p>
                </div>
                <div
                  className="sessions-grid"
                  style={{ gridTemplateColumns: "1fr" }}
                >
                  {sessions.map((s, i) => (
                    <div className="session-card" key={i}>
                      <div className="sc-title">{s.title}</div>
                      <div className="sc-chair">{s.chair}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publications */}
      {pubs.length > 0 && (
        <div
          className="home-section"
          style={{
            background: "white",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="inner">
            <div className="section-head">
              <h2>Publication Opportunities</h2>
              <p>
                Selected papers from VEAM 2026 will be considered for
                publication
              </p>
            </div>
            <div className="pub-grid">
              {pubs.map((p, i) => (
                <div className="pub-card" key={i}>
                  <h4>{p.title}</h4>
                  {p.description && <p>{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organizing Institutions */}
      {orgs.length > 0 && (
        <div className="home-section">
          <div className="inner">
            <div className="section-head">
              <h2>Organizing Institutions</h2>
              <p>
                VEAM 2026 is organized by a consortium of universities and
                research centers
              </p>
            </div>
            <div className="org-grid">
              {orgs.map((org, i) => (
                <div className="org-card" key={i}>
                  {org.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      style={{
                        height: 48,
                        objectFit: "contain",
                        marginBottom: 8,
                      }}
                    />
                  ) : null}
                  <h4>{org.name}</h4>
                  <p>{org.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
