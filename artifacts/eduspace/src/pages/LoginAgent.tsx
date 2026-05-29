import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowLeft, Lock, IdCard, X, Info } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loginWithMatricule } from "@/lib/api";
import { setAuth } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginAgent() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", motDePasse: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoginError("");
    setLoading(true);
    try {
      const { token, user } = await loginWithMatricule(values.username, values.motDePasse);
      if (user.role !== "agent") {
        setLoginError("Ce compte n'est pas un compte agent pédagogique.");
        return;
      }
      setAuth(token, user);
      sessionStorage.setItem("agentLoggedIn", "true");
      setLocation("/agent/dashboard");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-violet-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-purple-300 hover:text-white mb-8 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au choix du profil
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Agent Pédagogique</h1>
              <p className="text-sm text-gray-500">Espace Administration</p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mb-5 text-xs text-purple-700">
            <span className="font-semibold">Compte démo :</span> nom d'utilisateur = <span className="font-mono">n.ferhat@univ-alger.dz</span> — mot de passe: <span className="font-mono">password</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input {...field} type="text" className="pl-10" placeholder="ex: mbenali.agent" autoComplete="username" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motDePasse"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium">Mot de passe</FormLabel>
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-purple-600 hover:text-purple-700 underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input {...field} type="password" className="pl-10" placeholder="••••••••" autoComplete="current-password" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {loginError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-5 rounded-xl shadow-lg"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Plateforme réservée aux agents pédagogiques autorisés
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-base">Réinitialisation du mot de passe</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowForgot(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Pour réinitialiser votre mot de passe, veuillez contacter le service informatique de l'université :
                </p>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-1 text-sm">
                  <p><span className="font-medium">Email :</span> support-si@univ-alger.dz</p>
                  <p><span className="font-medium">Téléphone :</span> +213 21 XX XX XX</p>
                  <p><span className="font-medium">Bureau :</span> Bâtiment Administration — Rdc</p>
                </div>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowForgot(false)}>
                  Fermer
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
