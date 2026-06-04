import { Link, useLocation } from "wouter";
import { Home, Upload, ClipboardList, Calendar, Megaphone, LogOut, GraduationCap } from "lucide-react";

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
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: "hsl(222 47% 15%)" }}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight text-white">EduSpace</p>
            <p className="text-xs text-white/50">Espace Enseignant</p>
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
                  ? "bg-primary text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all w-full"
          data-testid="button-logout-teacher"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
