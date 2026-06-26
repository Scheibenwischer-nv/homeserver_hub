# Änderungsprotokoll – HomeServer Hub

Dieses Protokoll dokumentiert chronologisch alle Versionen, Feature-Erweiterungen und Bugfixes von HomeServer Hub.

---

## [v0.3-beta] – 2026-06-26

### 🎨 Google Icons & Kategorie-Farbauswahl
- **Google Material Icons Integration**: Unterstützung von 16 Google Icons (Material Symbols) zusätzlich zu FontAwesome-Icons im Einstellungsbereich.
- **Kategorie-Farbwahl**: Ein nativer Farbwähler wurde im Formular zum Hinzufügen einer Kategorie sowie im Inline-Editor integriert.
- **Glassmorphismus-Aesthetic**:
  - Kategorie-Badges auf den Server-Kacheln passen sich farblich mit reduzierter Deckkraft (`color + "33"` für Border, `color + "0d"` für Background) an.
  - Kategorie-Überschriften im Dashboard zeichnen ihr Icon in der gewählten Kategorie-Farbe mit einem weichen Leuchten (`text-shadow: 0 0 10px [color]80`) und färben die untere Trennlinie leicht ein (`border-bottom: 1px solid [color]33`).
  - Im Kategorie-Editor in den Einstellungen visualisiert ein kleiner runder Kreis die Hex-Farbe und die Icon-Vorschau wird in der Kategorie-Farbe gerendert.
- **Backend-Validierung**: Die API-Route `/api/categories` in `server.js` validiert und speichert das Feld `color` persistent in `categories.json`.

---

## [v0.2-beta] – 2026-06-26

### 🌐 Mehrsprachigkeit (i18n) & Flaggen-Steuerung
- **Sprachumschaltung im Header**: Button-Gruppe mit Länderflaggen (🇩🇪 und 🇬🇧) im Header. Im Premium-Design gehalten (transparente Buttons, Hover-Skalierung, feiner Glow im aktiven Zustand).
- **Vollständige Lokalisierung**: Übersetzung aller statischen UI-Texte, Dialogtitel, Formular-Platzhalter, Tooltips, Buttons sowie der Onboarding-Hilfe und des Netzwerk-Scanners.
- **localStorage-Persistenz**: Speicherung der Sprachauswahl im Browser, um die Einstellung nach einem Refresh (F5) beizubehalten.
- **Scanner-Fixes**: Stabilitätsverbesserungen im Netzwerk-Scanner zur Vermeidung potenzieller JavaScript-Abstürze durch fehlende DOM-Elemente (`selected-count`/`total-scanned-count`).
