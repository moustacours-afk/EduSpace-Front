import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, BookOpen,
  ChevronLeft, ChevronRight, LogOut, ShieldCheck,
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
      className={`${collapsed ? "w-16" : "w-64"} min-h-screen flex flex-col flex-shrink-0 transition-all duration-200`}
      style={{ background: "hsl(270 60% 10%)" }}
    >
      <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-base leading-tight text-white">EduSpace</p>
              <p className="text-xs text-white/50">Super Agent</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={toggle} className="text-white/40 hover:text-white transition-colors p-1 rounded ml-2">
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
                active ? "bg-purple-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/10">
        {collapsed ? (
          <button onClick={toggle} className="w-full flex justify-center p-2 text-white/40 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link href="/login/super-agent">
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              onClick={() => sessionStorage.removeItem("superAgentLoggedIn")}
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
