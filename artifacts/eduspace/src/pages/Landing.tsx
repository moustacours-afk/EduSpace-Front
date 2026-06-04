import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookMarked, Presentation, Building2, GraduationCap, ArrowRight } from "lucide-react";

const roles = [
  {
    href: "/login/etudiant",
    icon: BookMarked,
    title: "Étudiant",
    eyebrow: "Espace personnel",
    description: "Consultez vos notes, votre emploi du temps et vos supports de cours.",
  },
  {
    href: "/login/enseignant",
    icon: Presentation,
    title: "Enseignant",
    eyebrow: "Espace pédagogique",
    description: "Déposez des supports, saisissez les notes et gérez vos séances.",
  },
  {
    href: "/login/agent",
    icon: Building2,
    title: "Agent Pédagogique",
    eyebrow: "Administration",
    description: "Gérez les comptes, les emplois du temps et validez les notes.",
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-8">
      {/* subtle academic top wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand/[0.06] to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-primary/[0.04] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-7 px-4 py-2.5 bg-card border border-card-border rounded-xl shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif font-bold text-xl text-foreground tracking-tight">EduSpace</span>
        </div>
        <h1 className="font-serif text-[2.1rem] leading-tight font-bold text-foreground mb-3">
          Plateforme académique universitaire
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Choisissez votre profil pour accéder à votre espace de travail.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
        {roles.map((role, i) => (
          <motion.button
            key={role.href}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * (i + 1) }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setLocation(role.href)}
            className="group bg-card border border-card-border rounded-2xl p-7 text-left cursor-pointer shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200"
            data-testid={`button-role-${role.title.toLowerCase().replace(" ", "-")}`}
          >
            <div className="mb-6 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              <role.icon className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">{role.eyebrow}</p>
            <h2 className="font-bold text-lg text-foreground mb-2">{role.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{role.description}</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground group-hover:text-brand transition-colors">
              Se connecter
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative mt-12 flex flex-col items-center gap-2.5"
      >
        <div className="h-px w-24 bg-border" />
        <p className="text-muted-foreground/70 text-xs">
          Plateforme de gestion pédagogique universitaire — EduSpace v1.0
        </p>
        <button
          onClick={() => setLocation("/login/super-agent")}
          className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          Accès administration centrale
        </button>
      </motion.div>
    </div>
  );
}
