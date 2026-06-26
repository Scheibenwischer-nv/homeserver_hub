# HomeServer Hub – Projektgedächtnis

Willkommen im Projektgedächtnis für **HomeServer Hub**. Diese Notiz dient als zentraler Wissensspeicher für alle Designentscheidungen, Architekturmuster und Vorlagen der App.

---

## 🌟 Vision & Kernfunktionen
HomeServer Hub ist ein leichtgewichtiges, aber visuell atemberaubendes Dashboard zur Überwachung von lokalen und Docker-basierten Homeserver-Diensten.

- **Live-Statusüberwachung**: Echtzeit-Pings (online/offline) inklusive Latenzanzeige.
- **Mehrsprachigkeit (i18n)**: Volle Unterstützung für Deutsch 🇩🇪 und Englisch 🇬🇧 ohne Seiten-Reload.
- **Dynamische Kategorisierung**: Gruppierung von Servern mit benutzerdefinierten Farben und Icons (FontAwesome + Google Material Icons).
- **Docker-Scanner**: Automatisches Entdecken und Hinzufügen von Docker-Containern und Systemdiensten über das lokale Netzwerk.
- **Telegram-Notifikation**: Sofortige Downtime-Warnungen über einen Telegram-Bot.

---

## 🎨 Designentscheidungen & Ästhetik

### 1. Glassmorphismus (Frosted Glass)
Das Dashboard nutzt ein stark ausgeprägtes Glassmorphismus-Aesthetic, um einen extrem modernen und fließenden Eindruck zu erzeugen.
- **Hintergrund**: Ein HTML5 Canvas-Element zeichnet im Hintergrund wabernde, weiche Farb-Blobs in Violett, Indigo und Cyan auf tiefdunklem Grund.
- **Kacheln (`.server-card`)**: 
  - `background: rgba(255, 255, 255, 0.03)`
  - `backdrop-filter: blur(16px)`
  - `border: 1px solid rgba(255, 255, 255, 0.08)`
  - Feiner Box-Shadow und leichter Skalierungseffekt (`scale(1.02)`) bei Hover.

### 2. Dynamische Farbkonzepte
Farbakzente werden nicht flach aufgetragen, sondern fließen transluzent in das Design ein:
- **Kategorie-Badges**: Nutzen die benutzerdefinierte Hex-Farbe der Kategorie mit Transparenz-Suffixen:
  - `border-color: [color]33` (ca. 20% Deckkraft)
  - `background: [color]0d` (ca. 5% Deckkraft)
- **Kategorie-Überschriften**:
  - `border-bottom: 1px solid [color]33`
  - Das Icon erhält einen weichen, leuchtenden Farbschatten: `text-shadow: 0 0 10px [color]80`.

### 3. Typografie
- **Schriftart**: *Outfit* (Google Fonts), die sich durch eine geometrische, aber sehr weiche und moderne Ästhetik auszeichnet.

---

## 🏗️ Technologische Basis
- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, Flexbox, Grid), Vanilla JavaScript (ES6, Fetch API, Canvas).
- **Backend**: Node.js mit Express.
- **Datenhaltung**: Flache JSON-Dateien (`servers.json`, `categories.json`, `settings.json`) zur schnellen, unkomplizierten Speicherung ohne schwere Datenbanken.

---

## 📄 Vorlagen & Dateipfade
- **Hauptseite**: `public/index.html` (Struktur, Dialoge, Modals)
- **Styling**: `public/style.css` (Glassmorphismus, Layouts)
- **Anwendungslogik**: `public/script.js` (Status-Polling, i18n, Canvas-Animation, DOM-Manipulation)
- **Server/Backend**: `server.js` (Express Server, API-Endpunkte, Docker-Socket-Abfragen)
- **Kategorien**: `categories.json` (Speicherort für IDs, Namen, Icons und Farben)
