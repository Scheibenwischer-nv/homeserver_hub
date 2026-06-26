# Stage 1: Build & Run
FROM node:20-alpine

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Package-Dateien kopieren und Abhängigkeiten installieren
COPY package*.json ./
RUN npm ci --only=production

# Anwendungsdateien kopieren (siehe .dockerignore für ausgeschlossene Dateien)
COPY . .

# Umgebungsvariablen definieren
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV NODE_ENV=production

# Datenverzeichnis erstellen und Berechtigungen anpassen
RUN mkdir -p /app/data && chown -R node:node /app

# Port freigeben
EXPOSE 3000

# Als unprivilegierter Benutzer ausführen
USER node

# Startbefehl festlegen
CMD ["node", "server.js"]
