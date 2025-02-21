# RouteCompare.ai - Versiunea Funcțională

Aplicatie pentru analiza și compararea rutelor de transport cu integrare PTV Maps. Această aplicație permite utilizatorilor să caute locații cu autocompletare, să calculeze trasee, să estimeze distanța și timpul de parcurgere și să ofere suport pentru multiple tipuri de camioane.

## Funcționalități Cheie

- **Integrare PTV Maps**
  - Căutare locații cu autocompletare (folosind PTV API)
  - Calculare și vizualizare rute pe hartă
  - Estimare a distanței și timpului de parcurgere
  - Suport pentru diferite tipuri de vehicule comerciale

- **Frontend Modern**
  - Construirea interfeței cu React.js și gestionarea stării cu React Hooks
  - Styling modular folosind CSS Modules
  - Utilizarea Vite pentru build rapid și eficient

- **Componente Reutilizabile**
  - **LoadingSpinner:** Indică procesele în desfășurare printr-o animație de tip spinner
  - **Map:** Afișează harta și traseele calculate
  - **RouteForm:** Permite introducerea datelor necesare pentru calcularea rutei

## Tehnologii Folosite

- **Frontend:** React.js, React Hooks
- **Mapping:** PTV Maps API
- **Build Tool:** Vite
- **Styling:** CSS Modules

## Instalare și Rulare

1. **Clonează repository-ul:**
```bash
git clone https://github.com/CioravaBogdan/varianta-care-merge.git
```

2. **Instalează dependențele:**
```bash
cd varianta-care-merge
npm install
```

3. **Configurare fișier de mediu:**
   - Creează un fișier `.env` bazat pe fișierul `.env.example` și adaugă cheile API necesare:
```env
PTV_API_KEY=your_ptv_api_key_here
```
   > **Notă:** Nu adăuga niciodată cheile API reale în repository!

4. **Rulează aplicația:**
```bash
npm run dev
```
   Aplicația va rula local (de obicei `http://localhost:3000`).

## Structura Proiectului

```
src/
├── components/
│   ├── LoadingSpinner/     # Componentă pentru animația de încărcare
│   ├── Map/                # Componentă pentru afișarea hărții și traseelor
│   └── RouteForm/          # Formulare pentru introducerea datelor de rută
├── styles/                 # Fișiere CSS Modules
├── utils/                  # Funcții helper (ex. decodare polilinie)
└── App.jsx                 # Componenta principală a aplicației
```

## Configurare Necesară și Prerechizite

1. **Cont PTV Developer:** Obține o cheie API de la [PTV Maps Developer](https://developer.ptvgroup.com/)
2. **Node.js:** Asigură-te că ai instalat Node.js (v14 sau o versiune ulterioară)
3. **Dependențe:** Toate modulele necesare vor fi instalate folosind `npm install`

## Note de Dezvoltare

- Aplicația este optimizată pentru utilizarea în Europa.
- Suportă multiple tipuri de vehicule comerciale.
- Include mecanisme de cache pentru interogările repetate la API-ul PTV.
- Codul este organizat modular pentru a facilita întreținerea și scalabilitatea.

## Considerații de Securitate

- Nu se includ cheile API sau alte date sensibile în repository-ul public.
- Fișierul `.env` este exclus din tracking (verifică `.gitignore`).

## .gitignore

```
node_modules
.env
dist
```

## Contribuții

Pentru a contribui:

- Deschide un pull request pe un branch separat.
- Urmează ghidul de dezvoltare și adaugă teste noi pentru fiecare componentă.
- Asigură respectarea standardelor de cod existente.

## Licență

Acest proiect este licențiat sub [MIT License](LICENSE).

---

Aceasta documentație oferă toate informațiile necesare pentru a recrea și rula proiectul de la zero, fără a fi nevoie să reprezinți manual fiecare pas sau funcționalitate. Pentru orice întrebări sau contribuții, deschide un issue în repository.
