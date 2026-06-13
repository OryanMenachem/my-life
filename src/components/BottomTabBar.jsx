import { Link, useLocation } from "react-router-dom";

const HomeIcon = ({ sw }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2h14a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <line x1="8" y1="2" x2="8" y2="10" />
  </svg>
);

const SearchIcon = ({ sw }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.2-4.2" />
  </svg>
);

const CalIcon = ({ sw }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" />
  </svg>
);

const SettingsIcon = ({ sw }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
  </svg>
);

const AnalysisIcon = ({ sw }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 3 7 7 10 4 14 8 21 1" />
    <polyline points="21 1 21 7 15 7" />
    <path d="M3 13v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8" />
  </svg>
);

const TABS = [
  { path: "/",         label: "Journal",  Icon: HomeIcon     },
  { path: "/search",   label: "Search",   Icon: SearchIcon   },
  { path: "/analysis", label: "Analysis", Icon: AnalysisIcon },
  { path: "/calendar", label: "Calendar", Icon: CalIcon      },
  { path: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-lg border-t border-border/40">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ path, label, Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                active ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <Icon sw={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-body font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}