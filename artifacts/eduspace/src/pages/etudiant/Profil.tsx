import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, BookOpen, Users, GraduationCap, Building2, User } from "lucide-react";
import { getUser } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function EtudiantProfil() {
  const user = getUser();
  const p = (user?.profile ?? {}) as Record<string, string>;

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground mt-1">Informations académiques personnelles</p>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                  <span className="text-white text-2xl font-bold">
                    {p.prenom?.[0]}{p.nom?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{p.prenom} {p.nom}</h2>
                  <p className="text-muted-foreground">{p.filiere} — {p.niveau}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-200 text-xs">Actif</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Hash,        label: "Numéro Matricule",    value: p.matricule },
                  { icon: Building2,   label: "Département",         value: p.departement },
                  { icon: BookOpen,    label: "Filière",             value: p.filiere },
                  { icon: GraduationCap, label: "Niveau",            value: p.niveau },
                  { icon: Users,       label: "Groupe",              value: p.groupe },
                  { icon: User,        label: "Année universitaire", value: p.anneeUniversitaire },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <f.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{f.label}</p>
                      <p className="font-medium text-sm">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-500 mb-0.5">Établissement</p>
                <p className="font-medium text-sm text-blue-900">{p.universite}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
