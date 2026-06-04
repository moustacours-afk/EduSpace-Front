# Design revert — how to go back to the previous version

On **2026-06-04** the app was restyled to the **"Slate & Teal"** academic palette
(unified, no per-role rainbow). The exact original versions of every file that was
changed are saved in this folder (`_design-backup/`).

## What changed (10 files)
| Backed-up file | Original location |
|---|---|
| `index.css` | `artifacts/eduspace/src/index.css` |
| `Landing.tsx` | `artifacts/eduspace/src/pages/Landing.tsx` |
| `LoginEtudiant.tsx` | `artifacts/eduspace/src/pages/LoginEtudiant.tsx` |
| `LoginEnseignant.tsx` | `artifacts/eduspace/src/pages/LoginEnseignant.tsx` |
| `LoginAgent.tsx` | `artifacts/eduspace/src/pages/LoginAgent.tsx` |
| `LoginSuperAgent.tsx` | `artifacts/eduspace/src/pages/LoginSuperAgent.tsx` |
| `TeacherSidebar.tsx` | `artifacts/eduspace/src/components/TeacherSidebar.tsx` |
| `AgentSidebar.tsx` | `artifacts/eduspace/src/components/AgentSidebar.tsx` |
| `StudentSidebar.tsx` | `artifacts/eduspace/src/components/StudentSidebar.tsx` |
| `SuperAgentSidebar.tsx` | `artifacts/eduspace/src/components/SuperAgentSidebar.tsx` |

## Option A — restore everything (PowerShell, one command)
Run from the project root (`Edu-Space-Front-1zip`):

```powershell
$bak = ".\_design-backup"; $src = ".\artifacts\eduspace\src"
Copy-Item "$bak\index.css"             "$src\index.css" -Force
Copy-Item "$bak\Landing.tsx"           "$src\pages\Landing.tsx" -Force
Copy-Item "$bak\LoginEtudiant.tsx"     "$src\pages\LoginEtudiant.tsx" -Force
Copy-Item "$bak\LoginEnseignant.tsx"   "$src\pages\LoginEnseignant.tsx" -Force
Copy-Item "$bak\LoginAgent.tsx"        "$src\pages\LoginAgent.tsx" -Force
Copy-Item "$bak\LoginSuperAgent.tsx"   "$src\pages\LoginSuperAgent.tsx" -Force
Copy-Item "$bak\TeacherSidebar.tsx"    "$src\components\TeacherSidebar.tsx" -Force
Copy-Item "$bak\AgentSidebar.tsx"      "$src\components\AgentSidebar.tsx" -Force
Copy-Item "$bak\StudentSidebar.tsx"    "$src\components\StudentSidebar.tsx" -Force
Copy-Item "$bak\SuperAgentSidebar.tsx" "$src\components\SuperAgentSidebar.tsx" -Force
```

## Option B — restore only the colors (keep the new icons/layout)
Just copy back the one file that holds the palette:

```powershell
Copy-Item ".\_design-backup\index.css" ".\artifacts\eduspace\src\index.css" -Force
```

## Option C — git
If these files were committed, `git checkout <old-commit> -- <path>` also works.

After reverting, restart the dev server (or rebuild) to see the original design.
