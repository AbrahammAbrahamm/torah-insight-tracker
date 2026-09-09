# GitHub Data Hub for Torah Tracker

## Goal
Expose this Lovable project on GitHub so the seforim hierarchy, data sources, and tracking model are visible and documented alongside the code.

## What we know
All structured Torah/seforim data lives in `src/lib/`:

| File | Contents |
|------|----------|
| `src/lib/category-structures.ts` | Master hierarchy builder: Gemara, Chumash, Nach, Mishnayos, Halacha (Shulchan Aruch), Mishnah Berurah, plus Chumash-by-Parsha. |
| `src/lib/sifim-data.ts` | Sif-per-siman counts for all 4 chelkim of Shulchan Aruch. |
| `src/lib/mb-data.json` | Se'if and se'if-katan presence data for Mishnah Berurah. |
| `src/lib/parsha-data.json` | Aliyah pasuk ranges for every parsha in Chumash. |
| `src/lib/rambam-data.ts` | Rambam's 14 books, halachot, and perek counts; book-based and yomi-based structures. |
| `src/lib/mussar-data.ts` | Mussar/Chasidus sefarim list with section counts. |

No GitHub integration is currently configured in the project (internal Lovable worktree only, no `.github/workflows`, README is a stub).

## Plan

1. **Connect Lovable project to GitHub** (user action)
   - In the Lovable editor: open the Plus (+) menu → GitHub → Connect project.
   - Authorize the Lovable GitHub App and create/select the repository.
   - This enables bidirectional sync: code edits in Lovable push to GitHub, and GitHub changes sync back.

2. **Update `README.md`**
   - Replace the Lovable stub with a project overview.
   - Add a "Seforim Data & Structure" section summarizing each `src/lib/` data file.
   - Include the project URLs (preview/published) and a note that this is a Lovable project.

3. **Create `docs/seforim-structure.md`**
   - Document the hierarchy for every category:
     - Chumash (Perek vs Parsha→Aliya→Pasuk)
     - Nach (Sefer→Perek→Pasuk)
     - Mishnayos (Seder→Masechta→Perek→Mishnah)
     - Gemara (Seder→Masechta→Daf/Amud)
     - Halacha / Shulchan Aruch (Siman→Sif)
     - Mishnah Berurah (Volume→Siman→Se'if→Se'if Katan)
     - Rambam (Book→Halacha→Perek, or Yomi schedule)
     - Mussar/Chasidus (Sefer→Section)
   - List data sources (Sefaria Export, Sefaria shape API, etc.) where applicable.
   - Explain the component-tracking model: first component learned = item learned; additional components are extras.

4. **Create `docs/data-sources.md`**
   - Attribute each dataset (sifim counts, mb-data, parsha aliyot, rambam books, mussar sefarim).
   - Note any manual curation or conversion steps.

5. **Add a doc-generation script (optional but recommended)**
   - `scripts/generate-structure-docs.ts` reads the TypeScript/JSON data files and outputs a markdown summary of counts and hierarchy depth.
   - This keeps `docs/seforim-structure.md` in sync as data changes.

6. **Polish repo hygiene**
   - Add a `.gitignore` if missing (Node/vite defaults).
   - Add a minimal `LICENSE` (user's choice, default MIT unless specified).
   - No CI workflows needed unless requested later.

## Out of scope for this plan
- Code changes to the app itself (data, UI, auth, analytics).
- Setting up GitHub Actions or automated deployments.

## Result
After this plan, the project will be synced to a GitHub repository with a clear README and documentation explaining exactly how every sefer is structured and where the data lives.
