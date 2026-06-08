import { useState } from "react";
import { Link, useLocation } from "wouter";
import { clearAuth, getSuperAgentAccountType, getSuperAgentFaculte } from "@/lib/auth";
import {
  LayoutDashboard, Users, BookOpen, BarChart3,
  ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";

export function SuperAgentSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem("superSidebarCollapsed") === "true"
  );
  const [location] = useLocation();

  const accountType = getSuperAgentAccountType();
  const isDirector  = accountType === "directeur";
  const faculte     = getSuperAgentFaculte();
  const roleLabel   = isDirector ? "Directeur" : (faculte ? `Doyen — ${faculte}` : "Doyen");

  const navItems = [
    { href: "/super-agent/dashboard", icon: LayoutDashboard, label: "Accueil" },
    { href: "/super-agent/comptes", icon: Users, label: "Comptes agents" },
    { href: "/super-agent/modules", icon: BookOpen, label: "Modules par niveau" },
    // Statistiques étudiants — Directeur uniquement
    ...(isDirector ? [{ href: "/super-agent/statistiques", icon: BarChart3, label: "Statistiques étudiants" }] : []),
  ];

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    sessionStorage.setItem("superSidebarCollapsed", String(next));
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
              <p className="text-xs text-sidebar-foreground/50 truncate max-w-[170px]" title={roleLabel}>{roleLabel}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={toggle} className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1 rounded ml-2">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                active ? "bg-brand text-brand-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              } ${collapsed ? "justify-center" : ""}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Footer — pinned to the bottom of the (sticky) sidebar so Déconnexion
          stays reachable no matter how far the page content scrolls. */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Link href="/login/super-agent">
          <a
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-red-300/80 hover:bg-red-500/10 hover:text-red-200 ${collapsed ? "justify-center" : ""}`}
            onClick={() => { clearAuth(); }}
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </a>
        </Link>
        <button
          onClick={toggle}
          title={collapsed ? "Déployer" : "Réduire"}
          className={`w-full flex ${collapsed ? "justify-center" : "justify-end"} p-2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
