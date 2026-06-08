import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Lock, IdCard } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand/[0.06] to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au choix du profil
        </button>

        <div className="bg-card border border-card-border rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-primary-foreground" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Agent Pédagogique</h1>
              <p className="text-sm text-muted-foreground">Espace Administration</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                    <FormLabel className="text-foreground font-medium">Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="password" className="pl-10" placeholder="••••••••" autoComplete="current-password" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {loginError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-5 rounded-xl"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground/70 mt-5">
            Plateforme réservée aux agents pédagogiques autorisés
          </p>
        </div>
      </motion.div>
    </div>
  );
}
