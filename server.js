import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import net from 'net';

// TLS-Zertifikatsprüfungen für lokale HTTPS-Dienste (z. B. Proxmox) deaktivieren
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurierbarer Datenordner für Docker-Persistenz
const DATA_DIR = process.env.DATA_DIR || __dirname;

// Datenordner erstellen, falls er noch nicht existiert
if (!fsSync.existsSync(DATA_DIR)) {
  fsSync.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFI_FILE = path.join(DATA_DIR, 'servers.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read settings from file
async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const defaultSettings = {
      telegram: {
        enabled: false,
        botToken: '',
        chatId: ''
      }
    };
    await writeSettings(defaultSettings);
    return defaultSettings;
  }
}

// Helper: Write settings to file
async function writeSettings(settings) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Fehler beim Schreiben der settings.json:', error);
  }
}

// Helper: Send Telegram message
async function sendTelegramMessage(text) {
  const settings = await readSettings();
  if (!settings.telegram || !settings.telegram.enabled) return false;
  const { botToken, chatId } = settings.telegram;
  if (!botToken || !chatId) return false;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const data = await response.json();
    return response.ok && data.ok;
  } catch (error) {
    console.error('Fehler beim Senden der Telegram-Nachricht:', error);
    return false;
  }
}

// Helper: Read categories from file
async function readCategories() {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Falls die Datei nicht existiert oder fehlerhaft ist, Standardwerte anlegen
    const defaultCategories = [
      { id: 'cat-1', name: 'Smart Home', icon: 'fa-house-signal' },
      { id: 'cat-2', name: 'Media', icon: 'fa-film' },
      { id: 'cat-3', name: 'Network', icon: 'fa-network-wired' },
      { id: 'cat-4', name: 'Storage', icon: 'fa-hard-drive' },
      { id: 'cat-5', name: 'Development', icon: 'fa-code' },
      { id: 'cat-6', name: 'Other', icon: 'fa-screwdriver-wrench' }
    ];
    await writeCategories(defaultCategories);
    return defaultCategories;
  }
}

// Helper: Write categories to file
async function writeCategories(categories) {
  try {
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (error) {
    console.error('Fehler beim Schreiben der categories.json:', error);
  }
}

// ==========================================================================
// Netzwerk-Scanner Logik
// ==========================================================================

// Hilfsfunktion: Lokales Subnetz ermitteln
function getLocalSubnet() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Nur IPv4, nicht intern, keine Link-Local-Adresse
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254')) {
        const parts = iface.address.split('.');
        if (parts.length === 4) {
          // Annahme: /24er Subnetz (z.B. 192.168.100.x)
          return `${parts[0]}.${parts[1]}.${parts[2]}`;
        }
      }
    }
  }
  return null;
}

// Hilfsfunktion: Einzelnen TCP-Port prüfen
function probePort(ip, port, timeout = 300) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(timeout);

    socket.connect(port, ip, () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('error', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });
  });
}

// Hilfsfunktion: Favicon aus HTML extrahieren
function extractFavicon(html, baseUrl) {
  // Regex für link-Tags mit rel="icon" oder rel="shortcut icon" oder rel="apple-touch-icon"
  let match = html.match(/<link[^>]*rel=["'](?:shortcut |apple-touch-)?icon["'][^>]*href=["']([^"']+)["']/i);
  if (!match) {
    match = html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut |apple-touch-)?icon["']/i);
  }
  if (!match) {
    match = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
  }
  if (!match) {
    match = html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i);
  }

  if (match && match[1]) {
    let href = match[1].trim();
    try {
      if (href.startsWith('//')) {
        const protocol = baseUrl.startsWith('https') ? 'https:' : 'http:';
        return protocol + href;
      }
      return new URL(href, baseUrl).href;
    } catch (e) {
      return href;
    }
  }

  // Standard-Pfad zurückgeben
  try {
    return new URL('/favicon.ico', baseUrl).href;
  } catch (e) {
    return `${baseUrl}/favicon.ico`;
  }
}

// Hilfsfunktion: Dienstdetails via HTTP(S) abrufen
async function getServiceDetails(ip, port) {
  const protocol = port === 443 || port === 8006 || port === 9443 ? 'https' : 'http';
  const url = `${protocol}://${ip}:${port}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Homeserver-Scanner)' }
    });
    
    const text = await response.text();
    // HTML-Titel extrahieren
    const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    // Kategorie und Name erraten
    let category = 'Other';
    if (/plex/i.test(title) || port === 32400) {
      title = title || 'Plex Media Server';
      category = 'Media';
    } else if (/home\s*assistant/i.test(title) || port === 8123) {
      title = title || 'Home Assistant';
      category = 'Smart Home';
    } else if (/pi-hole/i.test(title) || /pi\.hole/i.test(text)) {
      title = title || 'Pi-hole';
      category = 'Network';
    } else if (/proxmox/i.test(title) || port === 8006) {
      title = title || 'Proxmox VE';
      category = 'Development';
    } else if (/portainer/i.test(title) || port === 9000 || port === 9443) {
      title = title || 'Portainer';
      category = 'Development';
    } else if (/synology/i.test(title) || /dsm/i.test(title) || port === 5001) {
      title = title || 'Synology DSM';
      category = 'Storage';
    } else if (/nextcloud/i.test(title)) {
      title = title || 'Nextcloud';
      category = 'Storage';
    }
    
    // Favicon extrahieren
    const favicon = extractFavicon(text, url);
    
    return {
      name: title || `Webdienst (${ip}:${port})`,
      url: url,
      category: category,
      identified: !!title,
      favicon: favicon
    };
  } catch (error) {
    // Port ist offen, aber HTTP-Request schlug fehl (z.B. SSL-Fehler oder SSH-Port)
    let category = 'Other';
    let name = `Dienst (${ip}:${port})`;
    if (port === 32400) { name = 'Plex Media Server'; category = 'Media'; }
    else if (port === 8123) { name = 'Home Assistant'; category = 'Smart Home'; }
    else if (port === 8006) { name = 'Proxmox VE'; category = 'Development'; }
    else if (port === 9000) { name = 'Portainer'; category = 'Development'; }
    else if (port === 5001) { name = 'Synology DiskStation'; category = 'Storage'; }
    
    return {
      name,
      url,
      category,
      identified: false
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Hilfsfunktion: Docker-Container abfragen (Port 2375)
async function fetchDockerContainers(ip) {
  const url = `http://${ip}:2375/containers/json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s Timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return [];

    const containers = await response.json();
    const services = [];

    for (const container of containers) {
      if (container.State !== 'running') continue;

      const rawName = container.Names && container.Names[0] ? container.Names[0] : '';
      const name = rawName.startsWith('/') ? rawName.substring(1) : rawName || container.Image;

      if (container.Ports && container.Ports.length > 0) {
        for (const portInfo of container.Ports) {
          if (portInfo.PublicPort && portInfo.Type === 'tcp') {
            const hostPort = portInfo.PublicPort;
            if (hostPort === 22 || hostPort === 2375 || hostPort === 2376) continue;

            const serviceUrl = `http://${ip}:${hostPort}`;
            let category = 'Other';
            const image = container.Image.toLowerCase();
            const nameLower = name.toLowerCase();

            if (image.includes('plex') || nameLower.includes('plex')) category = 'Media';
            else if (image.includes('home-assistant') || image.includes('homeassistant') || nameLower.includes('hass') || nameLower.includes('homeassistant')) category = 'Smart Home';
            else if (image.includes('pihole') || nameLower.includes('pihole')) category = 'Network';
            else if (image.includes('portainer') || nameLower.includes('portainer')) category = 'Development';
            else if (image.includes('nextcloud') || nameLower.includes('nextcloud')) category = 'Storage';
            else if (image.includes('nginx') || image.includes('apache') || image.includes('caddy')) category = 'Network';
            else if (image.includes('postgres') || image.includes('mysql') || image.includes('redis') || image.includes('mongo')) category = 'Development';

            // Duplikate im selben Container-Port-Mapping vermeiden
            if (services.some(s => s.url === serviceUrl)) continue;

            services.push({
              name: `${name} (Docker)`,
              url: serviceUrl,
              category: category,
              identified: true,
              isDocker: true,
              containerName: name,
              image: container.Image
            });
          }
        }
      }
    }
    return services;
  } catch (error) {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper: Read servers from file
async function readServers() {
  try {
    const data = await fs.readFile(CONFI_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Fehler beim Lesen der servers.json:', error);
    return [];
  }
}

// Helper: Write servers to file
async function writeServers(servers) {
  try {
    await fs.writeFile(CONFI_FILE, JSON.stringify(servers, null, 2), 'utf-8');
  } catch (error) {
    console.error('Fehler beim Schreiben der servers.json:', error);
  }
}

// Helper: Check status of a single server
async function checkServerStatus(server) {
  let url = server.url.trim();
  
  // URL bereinigen und Protokoll sicherstellen
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 Sekunden Timeout

  try {
    let response;
    let htmlText = '';
    const needsHtml = !server.favicon;

    if (needsHtml) {
      // GET-Request machen, um das HTML für das Favicon auszulesen
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Homeserver-Monitor)' }
      });
      htmlText = await response.text();
    } else {
      // HEAD-Request versuchen (schneller)
      try {
        response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Homeserver-Monitor)' }
        });
      } catch (headError) {
        if (controller.signal.aborted) throw headError;
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Homeserver-Monitor)' }
        });
        htmlText = await response.text();
      }
    }

    const end = performance.now();
    const latency = Math.round(end - start);

    server.status = 'online';
    server.latency = latency;

    if (needsHtml && htmlText) {
      server.favicon = extractFavicon(htmlText, url);
    }
  } catch (error) {
    server.status = 'offline';
    server.latency = null;
  } finally {
    clearTimeout(timeoutId);
    server.lastChecked = new Date().toISOString();
  }

  return server;
}

// Helper: Check all servers
async function checkAllServers() {
  console.log('[StatusCheck] Starte automatischen Status-Check...');
  
  // Bisherige Server-Zustände auslesen
  const oldServers = await readServers();
  const oldStatusMap = new Map(oldServers.map(s => [s.id, s.status]));

  // Checks durchführen
  const updatedServers = await Promise.all(
    oldServers.map(server => checkServerStatus(server))
  );

  // Statusänderungen prüfen und melden
  const settings = await readSettings();
  if (settings.telegram && settings.telegram.enabled) {
    for (const server of updatedServers) {
      const oldStatus = oldStatusMap.get(server.id);

      // Wechsel von online -> offline (Ausfall)
      if (oldStatus === 'online' && server.status === 'offline') {
        const timeString = new Date().toLocaleTimeString('de-DE');
        const message = `⚠️ *Homeserver Ausfall!*\n\nDer Server *${server.name}* (${server.url}) ist offline gegangen.\n🕒 Zeit: ${timeString}`;
        sendTelegramMessage(message).then(success => {
          if (success) {
            console.log(`[Telegram] Ausfall-Warnung für "${server.name}" gesendet.`);
          } else {
            console.warn(`[Telegram] Senden der Warnung für "${server.name}" fehlgeschlagen.`);
          }
        });
      }

      // Wechsel von offline -> online (Entwarnung)
      if (oldStatus === 'offline' && server.status === 'online') {
        const timeString = new Date().toLocaleTimeString('de-DE');
        const message = `✅ *Homeserver wieder online!*\n\nDer Server *${server.name}* (${server.url}) ist wieder erreichbar.\n🕒 Zeit: ${timeString}\n⚡ Latenz: ${server.latency} ms`;
        sendTelegramMessage(message).then(success => {
          if (success) {
            console.log(`[Telegram] Entwarnung für "${server.name}" gesendet.`);
          }
        });
      }
    }
  }

  await writeServers(updatedServers);
  console.log('[StatusCheck] Status-Check abgeschlossen.');
  return updatedServers;
}

// API: Einstellungen abrufen
app.get('/api/settings', async (req, res) => {
  const settings = await readSettings();
  res.json(settings);
});

// API: Einstellungen speichern
app.post('/api/settings', async (req, res) => {
  const { telegram } = req.body;
  if (!telegram) {
    return res.status(400).json({ error: 'Telegram-Einstellungen sind erforderlich.' });
  }

  const settings = {
    telegram: {
      enabled: !!telegram.enabled,
      botToken: telegram.botToken ? telegram.botToken.trim() : '',
      chatId: telegram.chatId ? telegram.chatId.trim() : ''
    }
  };

  await writeSettings(settings);
  res.json(settings);
});

// API: Telegram Verbindung testen
app.post('/api/telegram/test', async (req, res) => {
  const { botToken, chatId } = req.body;
  if (!botToken || !chatId) {
    return res.status(400).json({ error: 'Bot-Token und Chat-ID sind erforderlich.' });
  }

  const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: '🔔 *HomeServer Hub Testnachricht!*\n\nDie Verbindung zu deinem Telegram-Bot wurde erfolgreich hergestellt! 🎉',
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (response.ok && data.ok) {
      res.json({ success: true, message: 'Testnachricht erfolgreich gesendet!' });
    } else {
      res.status(400).json({ error: data.description || 'Telegram-API Fehler' });
    }
  } catch (error) {
    console.error('Fehler beim Telegram-Test:', error);
    res.status(500).json({ error: 'Verbindung zu Telegram fehlgeschlagen. Bitte prüfe das Token.' });
  }
});

// API: Alle Kategorien abrufen
app.get('/api/categories', async (req, res) => {
  const categories = await readCategories();
  res.json(categories);
});

// API: Alle Kategorien speichern (Sammelspeicherung aus den Einstellungen)
app.post('/api/categories', async (req, res) => {
  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'Ein Array von Kategorien ist erforderlich.' });
  }

  // Validierung der Kategorien
  const validated = categories.map((cat, index) => ({
    id: cat.id || `cat-${Date.now()}-${index}`,
    name: cat.name ? cat.name.trim() : 'Unbenannt',
    icon: cat.icon ? cat.icon.trim() : 'fa-server'
  }));

  await writeCategories(validated);
  res.json(validated);
});

// API: Alle Server abrufen
app.get('/api/servers', async (req, res) => {
  const servers = await readServers();
  res.json(servers);
});

// API: Server hinzufügen
app.post('/api/servers', async (req, res) => {
  const { name, url, category } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name und URL sind erforderlich.' });
  }

  // URL bereinigen: Protokoll ergänzen, falls nicht vorhanden
  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `http://${cleanUrl}`;
  }

  const servers = await readServers();
  const newServer = {
    id: Date.now().toString(),
    name,
    url: cleanUrl,
    category: category || 'General',
    status: 'checking',
    latency: null,
    lastChecked: null,
    favorite: req.body.favorite || false
  };

  // Sofortigen Check für den neuen Server durchführen
  await checkServerStatus(newServer);
  
  servers.push(newServer);
  await writeServers(servers);
  res.status(201).json(newServer);
});

// API: Server bearbeiten
app.put('/api/servers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, url, category } = req.body;

  const servers = await readServers();
  const serverIndex = servers.findIndex(s => s.id === id);

  if (serverIndex === -1) {
    return res.status(404).json({ error: 'Server nicht gefunden.' });
  }

  // Werte aktualisieren
  servers[serverIndex].name = name || servers[serverIndex].name;
  
  if (url !== undefined) {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `http://${cleanUrl}`;
    }
    servers[serverIndex].url = cleanUrl;
  }

  servers[serverIndex].category = category || servers[serverIndex].category;
  if (req.body.favorite !== undefined) {
    servers[serverIndex].favorite = req.body.favorite;
  }
  servers[serverIndex].status = 'checking';

  // Neu prüfen
  await checkServerStatus(servers[serverIndex]);

  await writeServers(servers);
  res.json(servers[serverIndex]);
});

// API: Server löschen
app.delete('/api/servers/:id', async (req, res) => {
  const { id } = req.params;
  let servers = await readServers();
  
  if (!servers.some(s => s.id === id)) {
    return res.status(404).json({ error: 'Server nicht gefunden.' });
  }

  servers = servers.filter(s => s.id !== id);
  await writeServers(servers);
  res.json({ message: 'Server erfolgreich gelöscht.' });
});

// API: Manuellen Status-Check triggern
app.post('/api/servers/check', async (req, res) => {
  const updatedServers = await checkAllServers();
  res.json(updatedServers);
});

// API: Lokales Netzwerk scannen
app.post('/api/scan', async (req, res) => {
  const subnet = getLocalSubnet();
  if (!subnet) {
    return res.status(400).json({ error: 'Keine aktive Netzwerkschnittstelle für den Scan gefunden.' });
  }

  console.log(`[Scan] Manueller Scan gestartet im Subnetz: ${subnet}.x`);
  // Port 2375 (Docker API) und 9443 (Portainer HTTPS) zur Liste hinzugefügt
  const PORTS_TO_SCAN = [80, 443, 8080, 8123, 32400, 8006, 9000, 9443, 5001, 2375];
  const targets = [];
  
  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    for (const port of PORTS_TO_SCAN) {
      targets.push({ ip, port });
    }
  }

  const foundServices = [];
  const CONCURRENCY = 120; // Ausgewogene Parallelität zur Vermeidung von Socket-Limitierungen

  try {
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      const batch = targets.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map(async (target) => {
          const isOpen = await probePort(target.ip, target.port, 350);
          if (isOpen) {
            if (target.port === 2375) {
              const dockerServices = await fetchDockerContainers(target.ip);
              if (dockerServices && dockerServices.length > 0) {
                return dockerServices; // Gibt Array von Containern zurück
              }
              // Standard-Docker-Dienst, falls keine Container oder Fehler
              return {
                name: `Docker Host (${target.ip})`,
                url: `http://${target.ip}:2375`,
                category: 'Development',
                identified: false,
                isDocker: true
              };
            } else {
              return await getServiceDetails(target.ip, target.port);
            }
          }
          return null;
        })
      );

      results.forEach(res => {
        if (res) {
          if (Array.isArray(res)) {
            foundServices.push(...res);
          } else {
            foundServices.push(res);
          }
        }
      });
    }

    console.log(`[Scan] Scan beendet. ${foundServices.length} Dienste/Container gefunden.`);
    res.json({ subnet, services: foundServices });
  } catch (error) {
    console.error('Fehler beim Netzwerkscan:', error);
    res.status(500).json({ error: 'Fehler beim Scannen des Netzwerks.' });
  }
});

// API: Mehrere Server gleichzeitig hinzufügen (Batch Import)
app.post('/api/servers/batch', async (req, res) => {
  const { servers: newServers } = req.body;
  if (!newServers || !Array.isArray(newServers)) {
    return res.status(400).json({ error: 'Ein Array von Servern ist erforderlich.' });
  }

  const currentServers = await readServers();
  const addedServers = [];

  for (const serverData of newServers) {
    const { name, url, category } = serverData;
    if (!name || !url) continue;

    // Duplikate vermeiden (anhand der URL prüfen)
    if (currentServers.some(s => s.url.trim().toLowerCase() === url.trim().toLowerCase())) continue;

    const newServer = {
      id: (Date.now() + Math.floor(Math.random() * 10000)).toString(),
      name,
      url,
      category: category || 'Other',
      status: 'checking',
      latency: null,
      lastChecked: null,
      favorite: false
    };

    addedServers.push(newServer);
    currentServers.push(newServer);
  }

  // Alle neu hinzugefügten Server parallel prüfen
  await Promise.all(
    addedServers.map(server => checkServerStatus(server))
  );

  await writeServers(currentServers);
  res.status(201).json(addedServers);
});

// Automatischer Check im Hintergrund alle 30 Sekunden
setInterval(checkAllServers, 30 * 1000);

// Beim Start des Servers einmal alle prüfen
checkAllServers();

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Homeserver Monitor läuft auf http://localhost:${PORT}`);
  console.log(`==================================================`);
});
