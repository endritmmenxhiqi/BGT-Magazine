# BGT Magazine

Revista online "BGT" — projekt i studentëve për menaxhimin dhe publikimin e lajmeve.

Ky repo përmban aplikacionin Next.js (app router) me Tailwind CSS, Supabase për back-end dhe një konfigurim të thjeshtë për përmbajtjet.

**Përmbajtja:**

- Aplikacioni në folderin `app/`
- Komponentet në `components/`
- Klienti Supabase në `lib/supabase.js`

## Sfidat kryesore
- Menaxhim i përmbajtjes (Sanity / Supabase)
- Autentikim përdoruesish (login / register)
- Panel dashboard për përdoruesit e regjistruar

## Si të startoni (zhvendosje e shpejtë)
1. Klononi repo-në dhe hyni në folder:

```bash

2. Instaloni varësitë:

```npm install

3. Konfiguroni variablat e mjedisit:

- Kopjoni `.env.example` te `.env.local` dhe plotësoni vlerat e nevojshme (Supabase URL, Anon Key, etj.).
- Në Windows (PowerShell): `cp .env.example .env.local` ose krijoni manualisht `.env.local`.

Variabla tipike që mund t'ju duhen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (shtoni çfarëdo variabla shtesë që ka projekti juaj)

4. Startoni mjedisin e zhvillimit:

```bash

Hapni: http://localhost:3000

## Skriptet e dobishme

- `npm run dev` — starton serverin në zhvillim
- `npm run build` — ndërton për prodhim
- `npm run start` — nis versionin e ndërtuar

## Konfigurime shtesë
- Supabase: sigurohuni që tabela dhe privilegjet të jenë vendosur sipas `supabase_tables.sql` në root.
- Sanity: nëse përdoret, konfiguro `sanity/` sipas dokumentacionit të Sanity.

## Rekomandime për deployment
- Vercel: lidhni repo-në me Vercel dhe shtoni variablat e mjedisit në Settings → Environment Variables.
- GitHub Actions / Other CI: sigurohuni që variablat e mjedisit të jenë të disponueshme në pipeline.

## Kontribuoni
- Bëni fork, krijoni branch, shtoni ndryshimet dhe dërgoni pull request.

Shembull:

```bash
git checkout -b feature/emri-i-funksionit
git add .
git commit -m "feat: shtoj funksionalitet të ri"
git push origin feature/emri-i-funksionit
```

## License
- Shto një skedar `LICENSE` sipas nevojës (p.sh. MIT).

## Kontakt

- Për pyetje ose ndihmë: kontaktoni autorin e repo-së ose mësuesin përgjegjës.

---

