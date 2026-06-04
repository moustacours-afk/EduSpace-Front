import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, BookOpen, Calendar, FolderOpen, User, LogOut,
  GraduationCap, ChevronLeft, ChevronRight, ChevronDown,
  ClipboardList, FileCheck, BarChart2, AlertOctagon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/data/mockData";

const notesSubItems = [
  { href: "/etudiant/notes/controles", icon: ClipboardList, label: "Contrôle continu & TP" },
  { href: "/etudiant/notes/examens", icon: FileCheck, label: "Examens" },
  { href: "/etudiant/notes/general", icon: BarChart2, label: "Général" },
  { href: "/etudiant/notes/dettes", icon: AlertOctagon, label: "Dettes" },
];

export function StudentSidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notesOpen, setNotesOpen] = useState(location.startsWith("/etudiant/notes"));
  const unread = notifications.filter((n) => !n.lu).length;

  const onNotesRoute = location.startsWith("/etudiant/notes");

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "bg-primary text-white"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    }`;

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} min-h-screen bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0 transition-all duration-250 relative`}
    >
      <div className={`p-4 border-b border-sidebar-border flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">EduSpace</p>
              <p className="text-xs text-sidebar-foreground/50">Espace Étudiant</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center hover:bg-sidebar-accent/80 transition-colors flex-shrink-0"
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-hidden">
        <Link
          href="/etudiant/dashboard"
          className={navItemClass(location === "/etudiant/dashboard") + (collapsed ? " justify-center px-2" : "")}
          title={collapsed ? "Accueil" : undefined}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Accueil</span>}
          {!collapsed && unread > 0 && (
            <Badge className="ml-auto bg-amber-500 text-white text-xs px-1.5 py-0">{unread}</Badge>
          )}
        </Link>

        <div>
          <button
            onClick={() => { if (!collapsed) setNotesOpen(!notesOpen); }}
            className={navItemClass(onNotesRoute && !notesOpen) + " w-full" + (collapsed ? " justify-center px-2" : "")}
            title={collapsed ? "Notes & Résultats" : undefined}
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span>Notes & Résultats</span>
                <ChevronDown className={`ml-auto w-3.5 h-3.5 transition-transform ${notesOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
          {!collapsed && notesOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-sidebar-border pl-3">
              {notesSubItems.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    location === sub.href
                      ? "bg-primary text-white"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <sub.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{sub.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {[
          { href: "/etudiant/emploi-du-temps", icon: Calendar, label: "Emploi du temps" },
          { href: "/etudiant/supports", icon: FolderOpen, label: "Supports de cours" },
          { href: "/etudiant/profil", icon: User, label: "Mon profil" },
        ].map((item) => {
          const active = location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClass(active) + (collapsed ? " justify-center px-2" : "")}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setLocation("/")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full ${collapsed ? "justify-center px-2" : ""}`}
          title={collapsed ? "Déconnexion" : undefined}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
