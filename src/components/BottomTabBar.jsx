import { Link, useLocation } from "react-router-dom";

const HomeIcon = ({ sw }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 11.4a1 1 0 0 1 .35-.76l7.5-6.4a1 1 0 0 1 1.3 0l7.5 6.4a1 1 0 0 1 .35.76V19a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z" />
    <path d="M9.5 21v-4.5a2.5 2.5 0 0 1 5 0V21" />
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
    <path d="M20 7h-7M6 7H4M20 17h-2M11 17H4" />
    <circle cx="10" cy="7" r="2.4" />
    <circle cx="14" cy="17" r="2.4" />
  </svg>
);

const TABS = [
  { path: "/",         label: "Journal",  Icon: HomeIcon     },
  { path: "/search",   label: "Search",   Icon: SearchIcon   },
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