import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Lock, User } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginWithMatricule } from "@/lib/api";
import { setAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(3, "Identifiant requis"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginEnseignant() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", motDePasse: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoginError("");
    setLoading(true);
    try {
      const { token, user } = await loginWithMatricule(values.email, values.motDePasse);
      if (user.role !== "enseignant") {
        setLoginError("Ce compte n'est pas un compte enseignant.");
        return;
      }
      setAuth(token, user);
      setLocation("/enseignant/dashboard");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-emerald-300 hover:text-white mb-8 text-sm transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au choix du profil
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Espace Enseignant</h1>
              <p className="text-sm text-gray-500">Connexion à votre compte</p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-5 text-xs text-emerald-700">
            <span className="font-semibold">Compte démo :</span> nom d'utilisateur = <span className="font-mono">m.hadj@univ-alger.dz</span> — mot de passe: <span className="font-mono">password</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...field}
                          type="text"
                          className="pl-10"
                          placeholder="ex: m.hadj"
                          data-testid="input-username"
                        />
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
                    <FormLabel className="text-gray-700 font-medium">Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...field}
                          type="password"
                          className="pl-10"
                          placeholder="••••••••"
                          data-testid="input-mot-de-passe"
                        />
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
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-5 rounded-xl shadow-lg"
                data-testid="button-submit-login"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
