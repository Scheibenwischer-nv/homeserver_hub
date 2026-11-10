# Stage 1: Build & Run
FROM node:20-alpine

# SSH-Client und cURL für lokale/entfernte Docker-Socket-Steuerung installieren
RUN apk add --no-cache openssh-client curl

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

# Datenverzeichnis erstellen
RUN mkdir -p /app/data

# Port freigeben
EXPOSE 3000

# Startbefehl festlegen (läuft als root für Zugriff auf /var/run/docker.sock)
CMD ["node", "server.js"]
