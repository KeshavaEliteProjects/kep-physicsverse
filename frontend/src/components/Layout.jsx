import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Orbit, FlaskConical, LineChart, Bot, GraduationCap,
  StickyNote, BarChart3, Presentation, Atom, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/universe", label: "Physics Universe", icon: Orbit },
  { to: "/app/lab", label: "Virtual Lab", icon: FlaskConical },
  { to: "/app/graphs", label: "Graph Studio", icon: LineChart },
  { to: "/app/tutor", label: "AI Tutor", icon: Bot },
  { to: "/app/practice", label: "JEE/NEET Practice", icon: GraduationCap },
  { to: "/app/notes", label: "Notes", icon: StickyNote },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/teacher", label: "Teacher Studio", icon: Presentation, teacher: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nav = NAV.filter((n) => !n.teacher || user?.role === "teacher");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarInner = () => (
    <>
      <div className="px-6 py-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Atom className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-[15px] leading-none text-slate-900">PhysicsVerse</p>
          <p className="text-[10px] text-muted-foreground font-mono-data mt-1">v1.0 · Mechanics</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <n.icon className="w-[18px] h-[18px]" />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4 pt-3 border-t border-border mt-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <button data-testid="logout-button" onClick={handleLogout} className="text-slate-400 hover:text-destructive transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white sticky top-0 h-screen">
        <SidebarInner />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white flex flex-col h-full shadow-xl"><SidebarInner /></div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
          <button data-testid="mobile-menu-button" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-slate-900">PhysicsVerse</span>
          </div>
          <div className="w-6" />
        </header>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
