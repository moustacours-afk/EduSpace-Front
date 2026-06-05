import { useState } from "react";
import { Link, useLocation } from "wouter";
import { clearAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, BookOpen,
  ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/super-agent/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/super-agent/comptes", icon: Users, label: "Comptes agents" },
  { href: "/super-agent/modules", icon: BookOpen, label: "Modules par niveau" },
];

export function SuperAgentSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem("superSidebarCollapsed") === "true"
  );
  const [location] = useLocation();

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    sessionStorage.setItem("superSidebarCollapsed", String(next));
  }

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} min-h-screen flex flex-col flex-shrink-0 transition-all duration-200 bg-sidebar text-sidebar-foreground`}
    >
      <div className={`p-4 border-b border-sidebar-border flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-white/10">
            <img src="/logo.svg" className="w-full h-full object-cover" alt="EduSpace" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-base leading-tight text-sidebar-foreground">EduSpace</p>
              <p className="text-xs text-sidebar-foreground/50">Super Agent</p>
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

      <div className="p-2 border-t border-sidebar-border">
        {collapsed ? (
          <button onClick={toggle} className="w-full flex justify-center p-2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link href="/login/super-agent">
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all cursor-pointer"
              onClick={() => { clearAuth(); }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Déconnexion</span>
            </a>
          </Link>
        )}
      </div>
    </aside>
  );
}
