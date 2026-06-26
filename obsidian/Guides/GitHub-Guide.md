# GitHub-Guide für Einsteiger: Homeserver-Dashboard bekannt machen

Dieser Guide hilft dir dabei, dein Repository **HomeServer Hub** auf GitHub professionell einzurichten, rechtlich abzusichern und in der Open-Source- und Homeserver-Community bekannt zu machen.

---

## 1. Das passende Lizenzmodell (Rechtliche Absicherung)

Ohne eine Lizenzdatei darf rechtlich gesehen niemand deinen Code kopieren oder benutzen. Für Open-Source-Projekte gibt es drei Standard-Lizenzen. Ich empfehle dir die **MIT-Lizenz**.

| Lizenz | Was bedeutet sie? | Empfehlung |
| :--- | :--- | :--- |
| **MIT License** | Jeder darf deine App nutzen, verändern und teilen (auch kommerziell). Du übernimmst keine Haftung. Dein Name muss als Urheber genannt werden. | **Sehr empfohlen** (Standard für 95 % aller Hobby- & Serverprojekte) |
| **Apache 2.0** | Ähnlich wie MIT, bietet aber zusätzlichen Schutz bei Patenten. | Für größere Firmenprojekte geeignet |
| **GPL v3** | Jeder darf deinen Code nutzen, aber wer ihn verändert und veröffentlicht, *muss* seinen eigenen Code ebenfalls Open Source machen. | Für Entwickler, die verhindern wollen, dass ihr Code in closed-source Software verbaut wird |

### So fügst du die MIT-Lizenz auf GitHub hinzu:
1. Rufe dein Repository `homeserver_hub` auf GitHub auf.
2. Klicke auf **Add file** -> **Create new file**.
3. Gib der Datei exakt den Namen **`LICENSE`** (in Großbuchstaben).
4. GitHub erkennt das und blendet rechts den Button **Choose a license template** ein. Klicke darauf.
5. Wähle in der Liste links **MIT License** aus.
6. Klicke rechts auf **Review and submit**.
7. Scrolle nach unten und klicke auf den grünen Button **Commit new file**.

---

## 2. Die Projektseite optimieren (Das Schaufenster)

Bevor du Werbung machst, muss dein „Schaufenster“ (deine GitHub-Projektseite) einladend aussehen.

### A. Der „About“-Bereich (Rechte Spalte auf GitHub)
Klicke auf der Startseite deines Repositories ganz rechts auf das kleine Zahnrad neben **About**:
- **Description**: Trage eine prägnante Kurzbeschreibung ein. 
  - *Deutsch:* `Elegantes Dark-Mode Dashboard für Homeserver mit Live-Status-Überwachung, Netzwerkscan und Telegram-Alarm.`
  - *Englisch (empfohlen für GitHub):* `A sleek dark-mode dashboard for your homeserver featuring live status monitoring, network scanning, and Telegram alerts.`
- **Website**: Falls du eine Projekt-Webseite hast, trage sie ein. Ansonsten kannst du das Feld leer lassen.
- **Topics (Sehr wichtig für die Suche!)**: Trage hier relevante Stichwörter (Tags) ein. Drücke nach jedem Begriff Enter:
  `homeserver`, `dashboard`, `docker`, `monitoring`, `self-hosted`, `telegram-bot`, `portainer`, `home-assistant`, `glassmorphic`.

### B. Bilder sagen mehr als Worte (Screenshots)
Die Leute in der Community wollen sofort sehen, wie die App aussieht.
1. Mache 1-2 schöne Screenshots deines Dashboards (z. B. die Kacheln mit dem wabernden Hintergrund und das geöffnete Einstellungs-Modal).
2. Erstelle in deinem Repository einen Ordner namens `images` (über die GitHub-Weboberfläche oder Git) und lade die Bilder dort hoch.
3. Binde die Screenshots in deiner `README.md` ein. Füge dazu folgenden Code an einer passenden Stelle (z. B. direkt unter der Überschrift) in der `README.md` ein:
   ```markdown
   ![Dashboard Vorschau](images/screenshot1.png)
   ```

---

## 3. Die App bekannt machen (Marketing)

Die Homeserver- und „Self-Hosted“-Szene ist riesig und extrem dankbar für neue, schicke Tools. Hier erreichst du deine Zielgruppe:

### A. Reddit (Die wichtigste Plattform)
Erstelle einen Post im Forum **[r/selfhosted](https://www.reddit.com/r/selfhosted/)** (über 300.000 Mitglieder) sowie in **[r/homeserver](https://www.reddit.com/r/homeserver/)**.
- **Format**: Wähle das Format „Image/Video“ und lade deinen besten Screenshot hoch.
- **Titel-Idee**: *„I built a sleek, dark-mode homeserver dashboard with auto-monitoring, network scanning, and Telegram downtime alerts (v0.2 Beta)“*
- **Erster Kommentar**: Schreibe direkt nach dem Posten einen Kommentar unter dein Bild, in dem du erklärst:
  - Warum du die App gebaut hast (z. B. weil dir andere Dashboards zu kompliziert einzurichten waren).
  - Welche Features sie hat.
  - Verlinke dein GitHub-Repository und erkläre kurz, wie einfach der Start mit dem Docker-Compose-Code ist.

### B. Awesome-Selfhosted Liste
Die wichtigste Anlaufstelle für Server-Freunde ist die GitHub-Liste [Awesome Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted).
- Sobald deine App ein paar Wochen stabil läuft und du erstes Feedback gesammelt hast, kannst du dort einen sogenannten „Pull Request“ stellen, um dein Dashboard in der Rubrik „Personal Dashboards“ listen zu lassen. Das bringt dir dauerhaft und vollautomatisch neue Nutzer.

---

## 4. Releases pflegen

Auf GitHub zeigt man Updates über sogenannte **Releases** an. Das signalisiert Besuchern, dass das Projekt aktiv gepflegt wird.

1. Klicke rechts auf der GitHub-Seite auf **Create a new release** (unter der Sektion „Releases“).
2. Wähle als Tag dein bereits existierendes Tag **`v0.2`** aus.
3. Gib dem Release einen Titel (z. B. `v0.2 Beta - Docker Support & Telegram Alerts`).
4. Beschreibe kurz in Stichpunkten, was neu ist (Nutze einfach die Punkte aus unserem Änderungsprotokoll).
5. Klicke auf **Publish release**.
