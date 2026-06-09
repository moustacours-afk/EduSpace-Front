import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { clearAuth, getAgentFiliere } from "@/lib/auth";
import { agent as api } from "@/lib/api";
import { syncOrgFromStudents } from "@/lib/orgStore";
import {
  LayoutDashboard, Users, CalendarDays, CheckSquare, LogOut,
  GraduationCap, Bell, BookOpen, Calendar, Megaphone,
  ChevronLeft, ChevronRight, ListChecks, Layers, FileSpreadsheet, ShieldCheck, ClipboardEdit,
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
    label: "Organisation",
    items: [
      { href: "/agent/organisation-etudiants", icon: Layers, label: "Organisation des étudiants" },
    ],
  },
  {
    label: "Pédagogie",
    items: [
      { href: "/agent/emploi-du-temps", icon: CalendarDays, label: "Emplois du temps" },
      { href: "/agent/notes", icon: CheckSquare, label: "Notes & Validation" },
      { href: "/agent/dettes", icon: ClipboardEdit, label: "Gestion des dettes" },
      { href: "/agent/deliberations", icon: ListChecks, label: "Délibérations" },
      { href: "/agent/feuilles", icon: FileSpreadsheet, label: "Feuilles" },
      { href: "/agent/permissions", icon: ShieldCheck, label: "Permissions Enseignants" },
    ],
  },
  {
    label: "Outils",
    items: [
      { href: "/agent/calendrier", icon: Calendar, label: "Calendrier académique" },
      { href: "/agent/annonces", icon: Megaphone, label: "Annonces" },
      { href: "/agent/notifications", icon: Bell, label: "Notifications" },
    ],
  },
];

// Sync the shared org store (sections/groups) from the backend once per app load,
// so every agent page reflects the real student section/groupe assignments.
let orgSynced = false;

export function AgentSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem("sidebarCollapsed") === "true"
  );
  const [location] = useLocation();

  useEffect(() => {
    if (orgSynced) return;
    orgSynced = true;
    const filiere = getAgentFiliere();
    api.students()
      .then(data => {
        const list = (data as Record<string, unknown>[]).map(s => ({
          id: String(s.id), niveau: String(s.niveau ?? ""),
          section: String(s.section ?? ""), groupe: String(s.groupe ?? ""),
          filiere: String(s.filiere ?? ""),
        }));
        syncOrgFromStudents(filiere ? list.filter(s => s.filiere === filiere) : list);
      })
      .catch(() => { orgSynced = false; });
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    sessionStorage.setItem("sidebarCollapsed", String(next));
  }

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} sticky top-0 h-screen flex flex-col flex-shrink-0 transition-all duration-200 bg-sidebar text-sidebar-foreground`}
    >
      <div className={`p-4 border-b border-sidebar-border flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-white/10">
            <img src="/logo.svg" className="w-full h-full object-cover" alt="EduSpace" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-base leading-tight text-sidebar-foreground">EduSpace</p>
              <p className="text-xs text-sidebar-foreground/50">Agent Pédagogique</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={toggle} className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1 rounded ml-2" title="Réduire">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={toggle} className="flex items-center justify-center py-2.5 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors border-b border-sidebar-border" title="Agrandir">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si}>
            {!collapsed && section.label && (
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 mb-1">{section.label}</p>
            )}
            {collapsed && section.label && <div className="my-2 border-t border-sidebar-border" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${collapsed ? "justify-center" : ""} ${active ? "bg-brand text-brand-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-sidebar-foreground">Ferhat Nadia</p>
            <p className="text-xs text-sidebar-foreground/40">Agent · Informatique</p>
          </div>
        )}
        <button onClick={() => { clearAuth(); window.location.href = "/"; }}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Déconnexion" : undefined}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
