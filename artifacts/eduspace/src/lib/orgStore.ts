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
  specialite?: string;
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

/**
 * Build the section/group organisation tree directly from the backend student
 * records (their real `section` + `groupe` fields). This makes the Organisation
 * page a faithful mirror of the Comptes étudiants data — single source of truth.
 */
export function buildOrgFromStudents(
  students: { id: string; niveau: string; section?: string; groupe?: string; specialite?: string }[],
): OrgState {
  const sectionsMap = new Map<string, OrgSection>();
  for (const s of students) {
    const sectionNom = (s.section && s.section.trim()) || "Section A";
    const groupeNom  = (s.groupe && s.groupe.trim())  || "Groupe 1";
    const key = `${s.niveau}||${sectionNom}`;
    let section = sectionsMap.get(key);
    if (!section) {
      section = {
        id: `sec-${s.niveau}-${sectionNom}`.replace(/\s+/g, "-").toLowerCase(),
        nom: sectionNom, niveau: s.niveau, specialite: s.specialite,
        maxStudents: 200, nbGroupes: 0, groupes: [],
      };
      sectionsMap.set(key, section);
    }
    let groupe = section.groupes.find(g => g.nom === groupeNom);
    if (!groupe) {
      groupe = { id: `${section.id}-${groupeNom}`.replace(/\s+/g, "-").toLowerCase(), nom: groupeNom, nbMax: 40, studentIds: [] };
      section.groupes.push(groupe);
    }
    groupe.studentIds.push(s.id);
  }
  const sections = [...sectionsMap.values()].map(sec => ({
    ...sec,
    nbGroupes: sec.groupes.length,
    groupes: [...sec.groupes].sort((a, b) => a.nom.localeCompare(b.nom, undefined, { numeric: true })),
  }));
  sections.sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom, undefined, { numeric: true }));
  return { sections };
}

/** Rebuild the persisted org state from backend students and save it. */
export function syncOrgFromStudents(
  students: { id: string; niveau: string; section?: string; groupe?: string; specialite?: string }[],
): OrgState {
  const state = buildOrgFromStudents(students);
  setOrgState(state);
  return state;
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

export function getSectionsForNiveauAndSpecialite(niveau: string, specialite?: string): OrgSection[] {
  const sections = getSectionsForNiveau(niveau);
  if (!specialite || specialite === "all") return sections;
  return sections.filter(s => s.specialite === specialite);
}
