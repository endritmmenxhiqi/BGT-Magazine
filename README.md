# BGT Magazine

Projekti i revistës BGT për studentë.

## Si të filloni (Udhëzime për Studentët)

Ndiqni hapat e mëposhtëm për të ekzekutuar projektin në kompjuterin tuaj pas shkarkimit (Clone).

### 1. Klonimi i Projektit
```bash
git clone https://github.com/endritmmenxhiqi/BGT-Magazine.git
cd BGT-Magazine/bgt-magazine
```

### 2. Instalimi i Paketave (Dependencies)
Pas hyrjes në folderin `bgt-magazine`, ekzekutoni komandën:
```bash
npm install
```

### 3. Konfigurimi i Variablave të Mjedisit (.env)
Pasi që fajlli `.env.local` nuk është në GitHub për arsye sigurie, ju duhet ta krijoni vetë:

1. Kopjoni fajllin `.env.example` dhe emërojeni si `.env.local`:
   - Në Windows (PowerShell): `cp .env.example .env.local`
   - Ose krijoni një fajll të ri me emrin `.env.local` manualisht.
2. Hapni `.env.local` dhe vendosni vlerat e kërkuara nga profesori (Supabase URL dhe Anon Key).

### 4. Ekzekutimi i Projektit
Pasi të keni instaluar paketat dhe konfiguruar `.env.local`, startoni serverin:
```bash
npm run dev
```

Projekti do të jetë i qasshëm në: [http://localhost:3000](http://localhost:3000)

---
**Shënim:** Sigurohuni që keni të instaluar [Node.js](https://nodejs.org/) në kompjuterin tuaj.
