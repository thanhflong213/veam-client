import { getSettings, getPages } from "../lib/api";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/ThemeContext";

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: import("../lib/types").Settings = {
    siteName: "VEAM",
    activeTheme: "modern",
    heroSlides: [],
  };
  let pages: import("../lib/types").Page[] = [];
  try {
    [settings, pages] = await Promise.all([getSettings(), getPages()]);
  } catch {
    // backend not available — use defaults
  }

  const initialTheme = settings.activeTheme === "classic" ? "b" : "a";

  return (
    <ThemeProvider initial={initialTheme}>
      {/* <div className="topbar">
        <div className="inner">
          <span>✉ veam@veam.org</span>
          <span>☎ (84 24) 39351419</span>
          <span>🕐 8:00AM – 6:00PM</span>
        </div>
      </div> */}
      <Header
        siteName={settings.siteName}
        pages={pages}
      />
      <main style={{ minHeight: "calc(100vh - 68px - 110px)" }}>
        {children}
      </main>
      <Footer siteName={settings.siteName} pages={pages} />
    </ThemeProvider>
  );
}
