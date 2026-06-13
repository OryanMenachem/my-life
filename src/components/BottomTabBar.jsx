import { Link, useLocation } from "react-router-dom";
import { BookOpen, Search, CalendarDays, SlidersHorizontal } from "lucide-react";

const TABS = [
  { path: "/",          label: "Journal",  Icon: BookOpen         },
  { path: "/calendar",  label: "Calendar", Icon: CalendarDays     },
  { path: "/search",    label: "Search",   Icon: Search           },
  { path: "/settings",  label: "Settings", Icon: SlidersHorizontal },
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
              <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-body font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}