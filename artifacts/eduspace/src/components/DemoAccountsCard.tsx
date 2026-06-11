import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { KeyRound } from "lucide-react";

interface DemoAccount {
  label: string;
  identifiant: string;
}

interface DemoAccountsCardProps {
  accounts: DemoAccount[];
  password?: string;
}

export function DemoAccountsCard({ accounts, password = "password" }: DemoAccountsCardProps) {
  return (
    <div className="w-full max-w-md mt-4 bg-card border border-card-border rounded-2xl shadow-sm px-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="demo-accounts" className="border-b-0">
          <AccordionTrigger className="text-sm font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand" />
              Comptes de démonstration
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">
              {accounts.map((acc) => (
                <li key={acc.identifiant} className="flex flex-col">
                  <span className="font-mono text-foreground">{acc.identifiant}</span>
                  <span className="text-xs text-muted-foreground">{acc.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-card-border">
              Mot de passe : <span className="font-mono font-semibold text-foreground">{password}</span>
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
