# Spiele Hub

Ein cleaner neal.fun-Style Grid-Hub für deine Spiele-Sammlung — dunkle Apple-Ästhetik, quadratische Cards, iOS-buttery Animationen.

## 🎮 Spiele hinzufügen

**Du musst nur eine Datei bearbeiten:** `public/games.json`

```json
{
  "games": [
    {
      "name": "Strands",
      "image": "/games/strands.jpg",
      "link": "https://strands.deinedomain.de"
    },
    {
      "name": "Queens",
      "image": "/games/queens.jpg",
      "link": "https://queens.deinedomain.de"
    }
  ]
}
```

### Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `name` | string | Spiel-Titel (erscheint unten auf der Card in Serif-Font) |
| `image` | string | Pfad zum Bild (relativ zu `public/`) |
| `link` | string | URL zum Spiel (extern oder intern) |

Spiele werden in der JSON-Reihenfolge angezeigt. Keine Kategorien — einfach ein flaches Grid.

## 🖼️ Bild-Spezifikation

**Format:** JPG oder PNG

**Empfohlene Größe:** **640 × 400 px** (16:10 Aspect Ratio, 2x Retina)

Das Bild wird in einer eigenständigen 16:10 Card angezeigt (`aspect-[16/10]` + `object-cover`). Beschnitt auf 16:10 — wichtige Inhalte mittig platzieren.

**Card-Struktur:**
- Bild-Card: 16:10 rounded rectangle (eigenständig, nicht mit Name verschmolzen)
- Name-Pill: separater Pill darunter mit 14px Abstand zum Bild
- Hover: Bild-Card zoomt (scale 1.03), Name-Pill wird heller

**Responsive Card-Größen:**

| Viewport | Bild-Card | Spalten |
|----------|-----------|---------|
| Mobile (< 640px) | ~330 × 206 px | 1 |
| Tablet (640-1024px) | ~280 × 175 px | 2 |
| Desktop (> 1024px) | ~300 × 188 px | 3 |

**Bilder ablegen:** `public/games/dein-spiel.jpg`

## 🚀 Auf Cloudflare Pages deployen

### Variante A: Git-Connect (empfohlen)

1. **Code zu GitHub pushen:**
   ```bash
   git init
   git add .
   git commit -m "Spiele Hub"
   git branch -M main
   git remote add origin https://github.com/DEIN-NAME/spiele-hub.git
   git push -u origin main
   ```

2. **Cloudflare Dashboard** → [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

3. **Build Settings:**
   ```
   Framework preset:        Next.js (Static HTML Export)
   Build command:           npm run build
   Build output directory:  out
   ```

4. **Environment Variables:**
   ```
   NODE_VERSION = 20
   ```

5. **Save and Deploy** → ~2-3 Min.

### Variante B: Direct Upload

```bash
npm install
npm run build
# Inhalt des out/ Ordners als ZIP packen und in Cloudflare hochladen
```

## 🎨 Design-Details

- **Typography:** Georgia Serif für Titel und Card-Namen
- **Background:** 4-farbiger Mesh-Gradient (subtil, Schwarz-Basis)
- **Cards:** Quadratisch (1:1), Bild füllt Card, Name unten
- **Card-Hover:** scale 1.03 + y -4 + Bild zoom 1.1 (700ms ease-out) + Gradient-Overlay
- **Staggered Entrance:** 80ms Delay pro Card, Spring-Physics
- **Grid:** 1 Spalte Mobile / 2 Spalten Tablet / 3 Spalten Desktop
- **Footer:** Instagram + Website Links

## 📁 Projekt-Struktur

```
├── public/
│   ├── games.json           ← EINZIGE DATEI DIE DU BEARBEITEST
│   └── games/               ← Hier kommen die Bilder rein
│       ├── strands.jpg
│       └── queens.jpg
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx         ← Hub-Page
│   └── components/
│       └── Footer.tsx
├── package.json
├── next.config.ts           (Static Export)
└── README.md
```

## Lizenz

MIT — frei verwendbar.
