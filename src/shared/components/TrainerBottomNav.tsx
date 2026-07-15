import { Link, useLocation } from "@tanstack/react-router";
import { Home, History, CalendarDays, User } from "lucide-react";
import { cn } from "../lib/utils";

const items = [
  { to: "/pro/dashboard", icon: Home, label: "Início" },
  { to: "/pro/history", icon: History, label: "Histórico" },
  { to: "/pro/schedules", icon: CalendarDays, label: "Agendamentos" },
  { to: "/pro/profile", icon: User, label: "Perfil" },
] as const;

export function ProBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={label}
              to={to as never}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-[var(--brand-black)]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}