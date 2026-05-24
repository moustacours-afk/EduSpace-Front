import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft, Lock, Hash } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  matricule: z.string().min(8, "Numéro matricule invalide"),
  motDePasse: z.string().min(4, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginEtudiant() {
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { matricule: "", motDePasse: "" },
  });

  function onSubmit() {
    setLocation("/etudiant/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 text-sm transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au choix du profil
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Espace Étudiant</h1>
              <p className="text-sm text-gray-400">Connexion à votre compte</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Numéro Matricule</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...field}
                          className="pl-10"
                          placeholder="ex: 20221234"
                          data-testid="input-matricule"
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

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl transition-all"
                data-testid="button-submit-login"
              >
                Se connecter
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
