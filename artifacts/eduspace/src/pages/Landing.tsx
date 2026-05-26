import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users, ShieldCheck, ArrowRight } from "lucide-react";

const roles = [
  {
    href: "/login/etudiant",
    icon: GraduationCap,
    title: "Étudiant",
    description: "Consultez vos notes, emploi du temps et supports de cours.",
    accent: "#3b82f6",
    iconBg: "bg-blue-600",
    badge: "Espace Étudiant",
    badgeColor: "bg-blue-50 text-blue-700",
  },
  {
    href: "/login/enseignant",
    icon: BookOpen,
    title: "Enseignant",
    description: "Déposez des supports, saisissez les notes et gérez vos séances.",
    accent: "#10b981",
    iconBg: "bg-emerald-600",
    badge: "Espace Enseignant",
    badgeColor: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/login/agent",
    icon: Users,
    title: "Agent Pédagogique",
    description: "Gérez les comptes, emplois du temps et validez les notes.",
    accent: "#8b5cf6",
    iconBg: "bg-violet-600",
    badge: "Administration",
    badgeColor: "bg-violet-50 text-violet-700",
  },
  {
    href: "/login/super-agent",
    icon: ShieldCheck,
    title: "Super Agent",
    description: "Créez les comptes agents et définissez les modules par niveau.",
    accent: "#7c3aed",
    iconBg: "bg-purple-700",
    badge: "Administration Centrale",
    badgeColor: "bg-purple-50 text-purple-700",
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-3 mb-6 px-5 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">EduSpace</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Bienvenue sur votre plateforme académique
        </h1>
        <p className="text-gray-500 text-base max-w-sm mx-auto">
          Choisissez votre profil pour accéder à votre espace personnalisé.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full">
        {roles.map((role, i) => (
          <motion.button
            key={role.href}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * (i + 1) }}
            whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation(role.href)}
            className="bg-white border border-gray-200 rounded-2xl p-7 text-left cursor-pointer group transition-all duration-200 shadow-sm"
            data-testid={`button-role-${role.title.toLowerCase().replace(" ", "-")}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center shadow-md`}>
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.badgeColor}`}>{role.badge}</span>
            </div>
            <h2 className="font-bold text-lg text-gray-900 mb-2">{role.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{role.description}</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
              Se connecter
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-gray-400 text-xs"
      >
        Plateforme de gestion pédagogique universitaire — EduSpace v1.0
      </motion.p>
    </div>
  );
}
