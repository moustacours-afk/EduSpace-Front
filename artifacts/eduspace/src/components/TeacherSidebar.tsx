import { Link, useLocation } from "wouter";
import { clearAuth } from "@/lib/auth";
import { Home, Upload, ClipboardList, Calendar, Megaphone, LogOut } from "lucide-react";

const navItems = [
  { href: "/enseignant/dashboard", icon: Home, label: "Accueil" },
  { href: "/enseignant/supports", icon: Upload, label: "Supports de cours" },
  { href: "/enseignant/notes", icon: ClipboardList, label: "Saisie des notes" },
  { href: "/enseignant/emploi-du-temps", icon: Calendar, label: "Emploi du temps" },
  { href: "/enseignant/annonces", icon: Megaphone, label: "Annonces" },
];

export function TeacherSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm ring-1 ring-white/10">
            <img src="/logo.svg" className="w-full h-full object-cover" alt="EduSpace" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight text-sidebar-foreground">EduSpace</p>
            <p className="text-xs text-sidebar-foreground/50">Espace Enseignant</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-brand text-brand-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => { clearAuth(); window.location.href = "/"; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full"
          data-testid="button-logout-teacher"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
