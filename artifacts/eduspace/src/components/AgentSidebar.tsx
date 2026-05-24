import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, CalendarDays, CheckSquare, LogOut,
  GraduationCap, Bell, BookOpen, Calendar,
  ChevronLeft, ChevronRight, ListChecks,
} from "lucide-react";

const navSections = [
  {
    label: null,
    items: [
      { href: "/agent/dashboard", icon: LayoutDashboard, label: "Accueil" },
    ],
  },
  {
    label: "Comptes",
    items: [
      { href: "/agent/comptes/etudiants", icon: GraduationCap, label: "Comptes étudiants" },
      { href: "/agent/comptes/enseignants", icon: Users, label: "Comptes enseignants" },
    ],
  },
  {
    label: "Pédagogie",
    items: [
      { href: "/agent/emploi-du-temps", icon: CalendarDays, label: "Emplois du temps" },
      { href: "/agent/notes", icon: CheckSquare, label: "Notes & Validation" },
      { href: "/agent/deliberations", icon: ListChecks, label: "Délibérations" },
    ],
  },
  {
    label: "Outils",
    items: [
      { href: "/agent/calendrier", icon: Calendar, label: "Calendrier académique" },
      { href: "/agent/notifications", icon: Bell, label: "Notifications" },
    ],
  },
];

export function AgentSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem("sidebarCollapsed") === "true"
  );
  const [location] = useLocation();

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    sessionStorage.setItem("sidebarCollapsed", String(next));
  }

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} min-h-screen flex flex-col flex-shrink-0 transition-all duration-200`}
      style={{ background: "hsl(222 47% 13%)" }}
    >
      <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-base leading-tight text-white">EduSpace</p>
              <p className="text-xs text-white/50">Agent Pédagogique</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={toggle} className="text-white/40 hover:text-white transition-colors p-1 rounded ml-2" title="Réduire">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={toggle} className="flex items-center justify-center py-2.5 text-white/40 hover:text-white transition-colors border-b border-white/10" title="Agrandir">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si}>
            {!collapsed && section.label && (
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">{section.label}</p>
            )}
            {collapsed && section.label && <div className="my-2 border-t border-white/10" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${collapsed ? "justify-center" : ""} ${active ? "bg-primary text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-white">Ferhat Nadia</p>
            <p className="text-xs text-white/40">agent001</p>
          </div>
        )}
        <button onClick={() => { sessionStorage.removeItem("agentLoggedIn"); sessionStorage.removeItem("sidebarCollapsed"); window.location.href = "/"; }}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all w-full ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Déconnexion" : undefined}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
