export type OrgGroup = {
  id: string;
  nom: string;
  nbMax: number;
  studentIds: string[];
};

export type OrgSection = {
  id: string;
  nom: string;
  niveau: string;
  maxStudents: number;
  nbGroupes: number;
  groupes: OrgGroup[];
};

export type OrgState = {
  sections: OrgSection[];
};

const ORG_KEY = "eduspace_org";

export function getOrgState(): OrgState {
  try {
    const raw = localStorage.getItem(ORG_KEY);
    if (!raw) return { sections: [] };
    return JSON.parse(raw) as OrgState;
  } catch {
    return { sections: [] };
  }
}

export function setOrgState(state: OrgState): void {
  localStorage.setItem(ORG_KEY, JSON.stringify(state));
}

export function getStudentAssignment(studentId: string): { section: string; groupe: string } | null {
  const org = getOrgState();
  for (const section of org.sections) {
    for (const groupe of section.groupes) {
      if (groupe.studentIds.includes(studentId)) {
        return { section: section.nom, groupe: groupe.nom };
      }
    }
  }
  return null;
}

export function getSectionsForNiveau(niveau: string): OrgSection[] {
  return getOrgState().sections.filter(s => s.niveau === niveau);
}

export function getGroupesForNiveau(niveau: string): string[] {
  const sections = getSectionsForNiveau(niveau);
  return sections.flatMap(s => s.groupes.map(g => g.nom));
}
