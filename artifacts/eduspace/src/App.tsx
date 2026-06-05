import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/Landing";
import LoginEtudiant from "@/pages/LoginEtudiant";
import LoginEnseignant from "@/pages/LoginEnseignant";
import LoginAgent from "@/pages/LoginAgent";

import EtudiantDashboard from "@/pages/etudiant/Dashboard";
import EtudiantEmploiDuTemps from "@/pages/etudiant/EmploiDuTemps";
import EtudiantSupports from "@/pages/etudiant/Supports";
import EtudiantProfil from "@/pages/etudiant/Profil";

import EtudiantControles from "@/pages/etudiant/notes/Controles";
import EtudiantExamens from "@/pages/etudiant/notes/Examens";
import EtudiantGeneral from "@/pages/etudiant/notes/General";
import EtudiantDettes from "@/pages/etudiant/notes/Dettes";

import EnseignantDashboard from "@/pages/enseignant/Dashboard";
import EnseignantSupports from "@/pages/enseignant/Supports";
import EnseignantNotes from "@/pages/enseignant/Notes";
import EnseignantEmploiDuTemps from "@/pages/enseignant/EmploiDuTemps";
import EnseignantNotifications from "@/pages/enseignant/Notifications";

import AgentDashboard from "@/pages/agent/Dashboard";
import AgentComptes from "@/pages/agent/Comptes";
import AgentEmploiDuTemps from "@/pages/agent/EmploiDuTemps";
import AgentValidationNotes from "@/pages/agent/ValidationNotes";
import AgentDeliberations from "@/pages/agent/Deliberations";
import AgentCalendrier from "@/pages/agent/Calendrier";
import AgentNotifications from "@/pages/agent/Notifications";
import AgentAnnonces from "@/pages/agent/Annonces";
import AgentOrganisationEtudiants from "@/pages/agent/OrganisationEtudiants";
import AgentFeuilles from "@/pages/agent/Sheets";
import AgentPermissions from "@/pages/agent/Permissions";

import LoginSuperAgent from "@/pages/LoginSuperAgent";
import SuperAgentDashboard from "@/pages/super-agent/Dashboard";
import SuperAgentComptes from "@/pages/super-agent/Comptes";
import SuperAgentModules from "@/pages/super-agent/Modules";
import CreateSuperAgent from "@/pages/admin/CreateSuperAgent";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function isAgentLoggedIn() {
  return sessionStorage.getItem("agentLoggedIn") === "true";
}

function isSuperAgentLoggedIn() {
  return sessionStorage.getItem("superAgentLoggedIn") === "true";
}

function AgentGuard({ component: Component }: { component: React.ComponentType }) {
  if (!isAgentLoggedIn()) return <Redirect to="/login/agent" />;
  return <Component />;
}

function SuperAgentGuard({ component: Component }: { component: React.ComponentType }) {
  if (!isSuperAgentLoggedIn()) return <Redirect to="/login/super-agent" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login/etudiant" component={LoginEtudiant} />
      <Route path="/login/enseignant" component={LoginEnseignant} />
      <Route path="/login/agent" component={LoginAgent} />

      <Route path="/etudiant/dashboard" component={EtudiantDashboard} />
      <Route path="/etudiant/notes">
        <Redirect to="/etudiant/notes/general" />
      </Route>
      <Route path="/etudiant/notes/controles" component={EtudiantControles} />
      <Route path="/etudiant/notes/examens" component={EtudiantExamens} />
      <Route path="/etudiant/notes/general" component={EtudiantGeneral} />
      <Route path="/etudiant/notes/dettes" component={EtudiantDettes} />
      <Route path="/etudiant/emploi-du-temps" component={EtudiantEmploiDuTemps} />
      <Route path="/etudiant/supports" component={EtudiantSupports} />
      <Route path="/etudiant/profil" component={EtudiantProfil} />

      <Route path="/enseignant/dashboard" component={EnseignantDashboard} />
      <Route path="/enseignant/supports" component={EnseignantSupports} />
      <Route path="/enseignant/notes" component={EnseignantNotes} />
      <Route path="/enseignant/emploi-du-temps" component={EnseignantEmploiDuTemps} />
      <Route path="/enseignant/notifications" component={EnseignantNotifications} />

      <Route path="/agent/dashboard">
        <AgentGuard component={AgentDashboard} />
      </Route>
      <Route path="/agent/comptes">
        <Redirect to="/agent/comptes/etudiants" />
      </Route>
      <Route path="/agent/comptes/etudiants">
        <AgentGuard component={AgentComptes} />
      </Route>
      <Route path="/agent/comptes/enseignants">
        <AgentGuard component={AgentComptes} />
      </Route>
      <Route path="/agent/emploi-du-temps">
        <AgentGuard component={AgentEmploiDuTemps} />
      </Route>
      <Route path="/agent/notes">
        <AgentGuard component={AgentValidationNotes} />
      </Route>
      <Route path="/agent/deliberations">
        <AgentGuard component={AgentDeliberations} />
      </Route>
      <Route path="/agent/calendrier">
        <AgentGuard component={AgentCalendrier} />
      </Route>
      <Route path="/agent/annonces">
        <AgentGuard component={AgentAnnonces} />
      </Route>
      <Route path="/agent/notifications">
        <AgentGuard component={AgentNotifications} />
      </Route>
      <Route path="/agent/organisation-etudiants">
        <AgentGuard component={AgentOrganisationEtudiants} />
      </Route>
      <Route path="/agent/feuilles">
        <AgentGuard component={AgentFeuilles} />
      </Route>
      <Route path="/agent/permissions">
        <AgentGuard component={AgentPermissions} />
      </Route>

      <Route path="/login/super-agent" component={LoginSuperAgent} />
      <Route path="/super-agent/dashboard">
        <SuperAgentGuard component={SuperAgentDashboard} />
      </Route>
      <Route path="/super-agent/comptes">
        <SuperAgentGuard component={SuperAgentComptes} />
      </Route>
      <Route path="/super-agent/modules">
        <SuperAgentGuard component={SuperAgentModules} />
      </Route>

      {/* Owner-only page — no auth guard, access by URL knowledge */}
      <Route path="/admin/create-super-agent" component={CreateSuperAgent} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
