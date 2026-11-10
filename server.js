import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import net from 'net';
import http from 'http';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
        weeklyUpdates: true,
        lastWeeklyUpdateCheck: null,
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

const DEFAULT_SERVERS = [
  {
    id: "demo-google",
    name: "Google Search",
    url: "https://www.google.com",
    category: "General",
    status: "checking",
    latency: null,
    lastChecked: null,
    favorite: true
  },
  {
    id: "demo-cloudflare",
    name: "Cloudflare DNS",
    url: "https://1.1.1.1",
    category: "Network",
    status: "checking",
    latency: null,
    lastChecked: null,
    favorite: false
  },
  {
    id: "demo-github",
    name: "GitHub Portal",
    url: "https://github.com",
    category: "Development",
    status: "checking",
    latency: null,
    lastChecked: null,
    favorite: false
  }
];

// Helper: Read servers from file
async function readServers() {
  try {
    const data = await fs.readFile(CONFI_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('[Init] servers.json nicht gefunden. Erstelle Demo-Server...');
      try {
        await writeServers(DEFAULT_SERVERS);
        return DEFAULT_SERVERS;
      } catch (writeErr) {
        console.error('Fehler beim Schreiben der Standard-Server:', writeErr);
      }
    } else {
      console.error('Fehler beim Lesen der servers.json:', error);
    }
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

// ==========================================================================
// Wöchentliche Update-Prüfung (GitHub Releases)
// ==========================================================================

const KNOWN_GITHUB_REPOS = [
  { keywords: ['home assistant', 'homeassistant', 'hass'], repo: 'home-assistant/core', label: 'Home Assistant' },
  { keywords: ['stirling-pdf', 'stirling', 'sterling'], repo: 'Stirling-Tools/Stirling-PDF', label: 'Stirling-PDF' },
  { keywords: ['n8n'], repo: 'n8n-io/n8n', label: 'n8n' },
  { keywords: ['portainer'], repo: 'portainer/portainer', label: 'Portainer' },
  { keywords: ['seafile'], repo: 'haiwen/seafile', label: 'Seafile' },
  { keywords: ['openmediavault', 'open media vault', 'omv'], repo: 'openmediavault/openmediavault', label: 'openmediavault' },
  { keywords: ['open archiver', 'openarchiver'], repo: 'LogicLabs-OU/OpenArchiver', label: 'Open Archiver' },
  { keywords: ['photoprism'], repo: 'photoprism/photoprism', label: 'PhotoPrism' },
  { keywords: ['kopia'], repo: 'kopia/kopia', label: 'Kopia' },
  { keywords: ['netbird'], repo: 'netbirdio/netbird', label: 'NetBird' },
  { keywords: ['onlyoffice'], repo: 'ONLYOFFICE/DocumentServer', label: 'ONLYOFFICE DocumentServer' },
  { keywords: ['pi-hole', 'pihole'], repo: 'pi-hole/pi-hole', label: 'Pi-hole' },
  { keywords: ['adguard'], repo: 'AdguardTeam/AdGuardHome', label: 'AdGuard Home' },
  { keywords: ['nextcloud', 'owncloud'], repo: 'nextcloud/server', label: 'Nextcloud / OwnCloud' },
  { keywords: ['jellyfin'], repo: 'jellyfin/jellyfin', label: 'Jellyfin' },
  { keywords: ['plex'], repo: 'plexinc/pms-docker', label: 'Plex Media Server' },
  { keywords: ['immich'], repo: 'immich-app/immich', label: 'Immich' },
  { keywords: ['vaultwarden'], repo: 'dani-garcia/vaultwarden', label: 'Vaultwarden' },
  { keywords: ['uptime kuma', 'uptime-kuma'], repo: 'louislam/uptime-kuma', label: 'Uptime Kuma' },
  { keywords: ['traefik'], repo: 'traefik/traefik', label: 'Traefik' },
  { keywords: ['nginx proxy manager', 'nginx strato', 'npm'], repo: 'NginxProxyManager/nginx-proxy-manager', label: 'Nginx Proxy Manager' },
  { keywords: ['grafana'], repo: 'grafana/grafana', label: 'Grafana' },
  { keywords: ['prometheus'], repo: 'prometheus/prometheus', label: 'Prometheus' },
  { keywords: ['gitea'], repo: 'go-gitea/gitea', label: 'Gitea' },
  { keywords: ['syncthing'], repo: 'syncthing/syncthing', label: 'Syncthing' },
  { keywords: ['node-red', 'nodered'], repo: 'node-red/node-red', label: 'Node-RED' },
  { keywords: ['iobroker'], repo: 'ioBroker/ioBroker.js-controller', label: 'ioBroker' },
  { keywords: ['mealie'], repo: 'mealie-recipes/mealie', label: 'Mealie' },
  { keywords: ['bookstack'], repo: 'BookStackApp/BookStack', label: 'BookStack' },
  { keywords: ['homepage'], repo: 'gethomepage/homepage', label: 'Homepage' },
  { keywords: ['homarr'], repo: 'homarr-labs/homarr', label: 'Homarr' }
];

function isServerExcludedFromUpdates(server) {
  if (!server) return true;
  if (server.ignoreUpdates) return true;
  const lower = (server.name || '').toLowerCase();
  // Paperless ist strikt vom Update gesperrt (Ausnahme: "Portainer (Paperless)" meint Portainer)
  if (lower.includes('paperless') && !lower.includes('portainer')) {
    return true;
  }
  return false;
}

// ==========================================================================
// Docker-Container Update & Rollback Engine (Lokal via Socket & Remote via SSH)
// ==========================================================================

const LOCAL_DOCKER_IPS = new Set(['127.0.0.1', 'localhost', '192.168.100.97']);
const REMOTE_SSH_DOCKER_IPS = new Set(['192.168.100.251']);

function splitImageRepoTag(imageStr) {
  const lastSlash = imageStr.lastIndexOf('/');
  const lastColon = imageStr.lastIndexOf(':');
  if (lastColon > lastSlash) {
    return {
      repo: imageStr.slice(0, lastColon),
      tag: imageStr.slice(lastColon + 1)
    };
  }
  return { repo: imageStr, tag: 'latest' };
}

async function dockerEngineRequest(hostIp, method, apiPath, body = null, timeoutMs = 180000) {
  const isLocal = LOCAL_DOCKER_IPS.has(hostIp) && fsSync.existsSync('/var/run/docker.sock');

  if (isLocal) {
    return new Promise((resolve, reject) => {
      const payloadStr = body !== null ? JSON.stringify(body) : null;
      const headers = {};
      if (payloadStr !== null) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(payloadStr);
      }

      const req = http.request(
        {
          socketPath: '/var/run/docker.sock',
          path: apiPath,
          method,
          headers,
          timeout: timeoutMs
        },
        (res) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const rawText = Buffer.concat(chunks).toString('utf-8');
            let parsed = null;
            try {
              parsed = rawText ? JSON.parse(rawText) : null;
            } catch {
              parsed = rawText;
            }
            if (res.statusCode >= 200 && res.statusCode < 300) {
              // Bei Streaming-Endpunkten (wie /images/create) auf eingebettete Fehler prüfen
              if (typeof rawText === 'string' && rawText.includes('"errorDetail"')) {
                return reject(new Error(`Docker Pull Fehler: ${rawText.slice(-300)}`));
              }
              resolve({ statusCode: res.statusCode, data: parsed, raw: rawText });
            } else {
              const errMsg = (parsed && parsed.message) ? parsed.message : rawText || `HTTP ${res.statusCode}`;
              reject(new Error(`Docker API (${method} ${apiPath}): ${errMsg}`));
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy(new Error(`Docker API Timeout (${method} ${apiPath})`));
      });
      req.on('error', (err) => reject(err));

      if (payloadStr !== null) {
        req.write(payloadStr);
      }
      req.end();
    });
  }

  if (REMOTE_SSH_DOCKER_IPS.has(hostIp)) {
    const safeUrl = `'http://localhost${apiPath.replace(/'/g, "'\\''")}'`;
    let remoteCmd = `sudo -n curl -s -w "\\n__HTTP_STATUS__:%{http_code}" --unix-socket /var/run/docker.sock -X ${method}`;
    let stdinData = null;

    if (body !== null) {
      stdinData = JSON.stringify(body);
      remoteCmd += ` -H "Content-Type: application/json" --data-binary @-`;
    }
    remoteCmd += ` ${safeUrl}`;

    const sshArgs = [
      '-o', 'BatchMode=yes',
      '-o', 'StrictHostKeyChecking=accept-new',
      '-o', 'ConnectTimeout=6',
      `pi@${hostIp}`,
      remoteCmd
    ];

    const { stdout } = await new Promise((resolve, reject) => {
      const child = execFile('ssh', sshArgs, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve({ stdout });
      });
      if (stdinData !== null && child.stdin) {
        child.stdin.write(stdinData);
        child.stdin.end();
      }
    });
    const markerIdx = stdout.lastIndexOf('\n__HTTP_STATUS__:');
    const rawText = markerIdx !== -1 ? stdout.slice(0, markerIdx).trim() : stdout.trim();
    const statusCode = markerIdx !== -1 ? parseInt(stdout.slice(markerIdx + 17).trim(), 10) : 200;

    let parsed = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = rawText;
    }

    if (statusCode >= 200 && statusCode < 300) {
      if (typeof rawText === 'string' && rawText.includes('"errorDetail"')) {
        throw new Error(`Remote Docker Pull Fehler: ${rawText.slice(-300)}`);
      }
      return { statusCode, data: parsed, raw: rawText };
    }
    const errMsg = (parsed && parsed.message) ? parsed.message : rawText || `HTTP ${statusCode}`;
    throw new Error(`Remote Docker API (${hostIp} ${method} ${apiPath}): ${errMsg}`);
  }

  throw new Error(`Host ${hostIp} unterstützt keine direkte Docker-Steuerung.`);
}

async function listContainersOnHost(hostIp) {
  try {
    const res = await dockerEngineRequest(hostIp, 'GET', '/containers/json?all=true', null, 8000);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return [];
  }
}

function parseServerHostAndPort(serverUrl) {
  try {
    let raw = (serverUrl || '').trim();
    if (!/^https?:\/\//i.test(raw)) {
      raw = `http://${raw}`;
    }
    const u = new URL(raw);
    const port = u.port ? parseInt(u.port, 10) : (u.protocol === 'https:' ? 443 : 80);
    return { hostIp: u.hostname, port };
  } catch {
    return { hostIp: null, port: null };
  }
}

function matchContainerFromList(server, containers, hostIp, port) {
  if (!Array.isArray(containers) || containers.length === 0) return null;

  // 1. Primärer Treffer über den veröffentlichten TCP-Port
  let found = containers.find(c =>
    Array.isArray(c.Ports) && c.Ports.some(p => p.PublicPort === port)
  );

  // 2. Fallback über Namen, falls kein Port-Match
  if (!found) {
    const sName = (server.name || '').toLowerCase();
    found = containers.find(c => {
      const cNames = (c.Names || []).map(n => n.replace(/^\//, '').toLowerCase());
      if (sName.includes('n8n')) return cNames.includes('n8n');
      if (sName.includes('stirling') || sName.includes('sterling')) return cNames.some(n => n.includes('stirling'));
      if (sName.includes('onlyoffice')) return cNames.some(n => n.includes('onlyoffice'));
      if (sName.includes('owncloud') || sName.includes('nextcloud')) return cNames.some(n => n.includes('nextcloud') || n.includes('owncloud'));
      if (sName.includes('portainer')) return cNames.some(n => n.includes('portainer'));
      if (sName.includes('openarchiver') || sName.includes('open archiver')) return cNames.some(n => n === 'open-archiver');
      if (sName.includes('kopia')) return cNames.some(n => n.includes('kopia'));
      return false;
    });
  }

  if (!found) return null;

  const rawName = (found.Names && found.Names[0]) ? found.Names[0] : '';
  const cleanName = rawName.replace(/^\//, '');

  // Sicherheits-Sperre: Niemals Paperless-Container als updatebar zurückgeben!
  if (/paperless/i.test(cleanName) || /paperless/i.test(found.Image || '')) {
    return null;
  }

  return {
    hostIp,
    containerId: found.Id,
    containerName: cleanName,
    image: found.Image,
    imageId: found.ImageID
  };
}

async function recreateContainerWithImage(hostIp, inspectData, targetImage) {
  const oldId = inspectData.Id;
  const cleanName = (inspectData.Name || '').replace(/^\//, '');
  const backupName = `${cleanName}-backup-${Date.now()}`;
  const oldShortId = oldId.slice(0, 12);

  const createPayload = {
    ...inspectData.Config,
    Image: targetImage,
    HostConfig: inspectData.HostConfig
  };

  if (createPayload.Hostname && createPayload.Hostname === oldShortId) {
    delete createPayload.Hostname;
  }

  const netMode = inspectData.HostConfig?.NetworkMode;
  const networks = inspectData.NetworkSettings?.Networks || {};
  if (netMode && netMode !== 'default' && netMode !== 'host' && netMode !== 'none' && networks[netMode]) {
    const netInfo = networks[netMode];
    createPayload.NetworkingConfig = {
      EndpointsConfig: {
        [netMode]: {
          IPAMConfig: netInfo.IPAMConfig || null,
          Links: netInfo.Links || null,
          Aliases: Array.isArray(netInfo.Aliases)
            ? [...new Set(netInfo.Aliases.filter(a => a && a !== oldShortId))]
            : []
        }
      }
    };
  }

  // 1. Alten Container umbenennen & stoppen
  await dockerEngineRequest(hostIp, 'POST', `/containers/${oldId}/rename?name=${encodeURIComponent(backupName)}`);
  try {
    await dockerEngineRequest(hostIp, 'POST', `/containers/${oldId}/stop?t=10`);
  } catch {
    // Falls bereits gestoppt, ignorieren
  }

  let newContainerId = null;
  try {
    // 2. Neuen Container mit identischer Konfiguration anlegen
    const createRes = await dockerEngineRequest(
      hostIp,
      'POST',
      `/containers/create?name=${encodeURIComponent(cleanName)}`,
      createPayload
    );
    newContainerId = createRes.data.Id;

    // 3. Zusätzliche Netzwerke verbinden (falls vorhanden)
    for (const netName of Object.keys(networks)) {
      if (netName !== netMode && netName !== 'bridge' && netName !== 'host' && netName !== 'none') {
        try {
          await dockerEngineRequest(hostIp, 'POST', `/networks/${encodeURIComponent(netName)}/connect`, {
            Container: newContainerId
          });
        } catch (netErr) {
          console.warn(`[ContainerUpdate] Hinweis bei Zusatz-Netzwerk ${netName}:`, netErr.message);
        }
      }
    }

    // 4. Neuen Container starten
    await dockerEngineRequest(hostIp, 'POST', `/containers/${newContainerId}/start`);

    // 5. Alten Backup-Container entfernen (das gesicherte Rollback-Image bleibt erhalten!)
    try {
      await dockerEngineRequest(hostIp, 'DELETE', `/containers/${oldId}?v=false`);
    } catch (delErr) {
      console.warn(`[ContainerUpdate] Konnte alten Container ${backupName} nicht löschen:`, delErr.message);
    }

    return newContainerId;
  } catch (err) {
    console.error(`[ContainerUpdate] Fehler beim Erstellen/Starten von ${cleanName}, stelle vorherigen Container wieder her:`, err.message);
    if (newContainerId) {
      try {
        await dockerEngineRequest(hostIp, 'DELETE', `/containers/${newContainerId}?force=true`);
      } catch {}
    }
    try {
      await dockerEngineRequest(hostIp, 'POST', `/containers/${oldId}/rename?name=${encodeURIComponent(cleanName)}`);
      await dockerEngineRequest(hostIp, 'POST', `/containers/${oldId}/start`);
    } catch (restoreErr) {
      console.error(`[ContainerUpdate] Kritischer Fehler bei Wiederherstellung von ${cleanName}:`, restoreErr.message);
    }
    throw err;
  }
}

function matchGithubRepo(serverName) {
  const lower = (serverName || '').toLowerCase();
  for (const entry of KNOWN_GITHUB_REPOS) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry;
    }
  }
  return null;
}

async function fetchLatestGithubRelease(repo) {
  const headers = {
    'User-Agent': 'HomeServer-Hub-UpdateChecker',
    'Accept': 'application/vnd.github+json'
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // 1. Versuche offizielles Latest-Release abzurufen
    const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers,
      signal: controller.signal
    });

    if (relRes.ok) {
      const data = await relRes.json();
      if (data && data.tag_name) {
        return {
          version: data.tag_name,
          url: data.html_url || `https://github.com/${repo}/releases`,
          publishedAt: data.published_at || null
        };
      }
    }

    // 2. Fallback auf Tags (z. B. wenn das Projekt nur Git-Tags statt GitHub-Releases nutzt)
    const tagRes = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=1`, {
      headers,
      signal: controller.signal
    });

    if (tagRes.ok) {
      const tags = await tagRes.json();
      if (Array.isArray(tags) && tags.length > 0 && tags[0].name) {
        return {
          version: tags[0].name,
          url: `https://github.com/${repo}/tags`,
          publishedAt: null
        };
      }
    }
  } catch (error) {
    console.warn(`[UpdateCheck] Konnte Release für ${repo} nicht abrufen:`, error.message);
  } finally {
    clearTimeout(timeoutId);
  }
  return null;
}

async function checkWeeklyServerUpdates(forceTelegramReport = false) {
  console.log('[UpdateCheck] Starte Prüfung auf verfügbare Server-Updates...');
  const servers = await readServers();
  const settings = await readSettings();

  const checkedRepos = new Map();
  const hostContainersCache = new Map();
  const results = [];
  const excludedServers = [];
  let newUpdatesCount = 0;

  for (const server of servers) {
    // Ausgeschlossene Server (z. B. Paperless oder manuell deaktivierte Dienste) überspringen
    if (isServerExcludedFromUpdates(server)) {
      excludedServers.push({
        serverId: server.id,
        serverName: server.name,
        category: server.category,
        favicon: server.favicon || null
      });
      continue;
    }

    const matched = matchGithubRepo(server.name);
    if (!matched) continue;

    let releaseInfo = checkedRepos.get(matched.repo);
    if (releaseInfo === undefined) {
      releaseInfo = await fetchLatestGithubRelease(matched.repo);
      checkedRepos.set(matched.repo, releaseInfo);
    }

    // Prüfen, ob für diesen Server ein verwaltbarer Docker-Container existiert
    let containerInfo = null;
    const { hostIp, port } = parseServerHostAndPort(server.url);
    if (hostIp && (LOCAL_DOCKER_IPS.has(hostIp) || REMOTE_SSH_DOCKER_IPS.has(hostIp))) {
      let containers = hostContainersCache.get(hostIp);
      if (containers === undefined) {
        containers = await listContainersOnHost(hostIp);
        hostContainersCache.set(hostIp, containers);
      }
      containerInfo = matchContainerFromList(server, containers, hostIp, port);
    }

    if (releaseInfo) {
      const previousVersion = server.lastKnownRelease || null;
      const isNew = previousVersion !== null && previousVersion !== releaseInfo.version;
      if (isNew) {
        newUpdatesCount++;
      }

      server.lastKnownRelease = releaseInfo.version;
      server.releaseUrl = releaseInfo.url;
      server.lastUpdateCheck = new Date().toISOString();

      results.push({
        serverId: server.id,
        serverName: server.name,
        repoLabel: matched.label,
        repo: matched.repo,
        version: releaseInfo.version,
        previousVersion,
        isNew,
        url: releaseInfo.url,
        publishedAt: releaseInfo.publishedAt || null,
        favicon: server.favicon || null,
        canUpdateContainer: Boolean(containerInfo),
        containerName: containerInfo ? containerInfo.containerName : null,
        containerImage: containerInfo ? containerInfo.image : null,
        hostIp: containerInfo ? containerInfo.hostIp : null,
        rollbackAvailable: Boolean(server.rollbackAvailable && (server.rollbackImageId || server.rollbackImageTag)),
        rollbackVersion: server.rollbackVersion || null,
        rollbackSavedAt: server.rollbackSavedAt || null,
        installedVersion: server.installedVersion || null
      });
    }
  }

  await writeServers(servers);

  // Zeitstempel der letzten wöchentlichen Prüfung in settings.json sichern
  if (!settings.telegram) {
    settings.telegram = { enabled: false, weeklyUpdates: true, lastWeeklyUpdateCheck: null, botToken: '', chatId: '' };
  }
  settings.telegram.lastWeeklyUpdateCheck = new Date().toISOString();
  await writeSettings(settings);

  // Telegram-Bericht senden, falls aktiviert (oder manuell angefordert)
  const canSendTelegram = settings.telegram.enabled && settings.telegram.botToken && settings.telegram.chatId;
  const shouldSend = forceTelegramReport || (canSendTelegram && settings.telegram.weeklyUpdates !== false);

  let telegramSent = false;
  if (shouldSend && canSendTelegram && results.length > 0) {
    const dateStr = new Date().toLocaleDateString('de-DE');
    let message = `📦 *Wöchentlicher Update-Check (${dateStr})*\n`;
    message += `Hier sind die aktuellsten verfügbaren Versionen deiner eingetragenen Server-Dienste:\n\n`;

    for (const item of results) {
      const badge = item.isNew ? '🆕 *NEUES UPDATE*' : '✅ Aktuellste Version';
      message += `• *${item.serverName}*: \`${item.version}\` (${badge})\n  🔗 [Release Notes](${item.url})\n`;
    }

    if (newUpdatesCount > 0) {
      message += `\n🚀 Es wurden *${newUpdatesCount}* neue Version(en) seit der letzten Prüfung veröffentlicht!`;
    } else {
      message += `\n✨ Alle überwachten Releases sind auf dem bekannten Stand.`;
    }

    telegramSent = await sendTelegramMessage(message);
    console.log(`[UpdateCheck] Wöchentlicher Update-Bericht per Telegram gesendet: ${telegramSent}`);
  }

  console.log(`[UpdateCheck] Prüfung abgeschlossen (${results.length} Dienste geprüft, ${newUpdatesCount} neu).`);
  return {
    checkedCount: results.length,
    newUpdatesCount,
    excludedCount: excludedServers.length,
    telegramSent,
    lastWeeklyUpdateCheck: settings.telegram.lastWeeklyUpdateCheck,
    results,
    excludedServers
  };
}

async function runScheduledWeeklyCheckIfNeeded() {
  try {
    const settings = await readSettings();
    if (!settings.telegram || settings.telegram.weeklyUpdates === false) return;

    const lastCheck = settings.telegram.lastWeeklyUpdateCheck
      ? new Date(settings.telegram.lastWeeklyUpdateCheck).getTime()
      : 0;
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    if (!lastCheck || (Date.now() - lastCheck) >= ONE_WEEK_MS) {
      await checkWeeklyServerUpdates(false);
    }
  } catch (err) {
    console.error('[UpdateCheck] Fehler beim geplanten wöchentlichen Check:', err);
  }
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

  const currentSettings = await readSettings();
  const settings = {
    telegram: {
      enabled: !!telegram.enabled,
      weeklyUpdates: telegram.weeklyUpdates !== undefined ? !!telegram.weeklyUpdates : (currentSettings.telegram?.weeklyUpdates ?? true),
      lastWeeklyUpdateCheck: currentSettings.telegram?.lastWeeklyUpdateCheck || null,
      botToken: telegram.botToken ? telegram.botToken.trim() : '',
      chatId: telegram.chatId ? telegram.chatId.trim() : ''
    }
  };

  await writeSettings(settings);
  res.json(settings);
});

// API: Manuelle Update-Prüfung aller eingetragenen Server auslösen
app.post('/api/servers/check-updates', async (req, res) => {
  try {
    const summary = await checkWeeklyServerUpdates(true);
    res.json(summary);
  } catch (error) {
    console.error('Fehler beim manuellen Update-Check:', error);
    res.status(500).json({ error: 'Fehler bei der Update-Prüfung.' });
  }
});

// API: Docker-Container eines Servers updaten (mit automatischem Rollback-Snapshot)
app.post('/api/servers/:id/update-container', async (req, res) => {
  const { id } = req.params;
  try {
    const servers = await readServers();
    const serverIndex = servers.findIndex(s => s.id === id);
    if (serverIndex === -1) {
      return res.status(404).json({ error: 'Server nicht gefunden.' });
    }

    const server = servers[serverIndex];
    if (isServerExcludedFromUpdates(server)) {
      return res.status(403).json({ error: 'Dieser Server (z. B. Paperless) ist vom Update gesperrt!' });
    }

    const { hostIp, port } = parseServerHostAndPort(server.url);
    if (!hostIp || (!LOCAL_DOCKER_IPS.has(hostIp) && !REMOTE_SSH_DOCKER_IPS.has(hostIp))) {
      return res.status(400).json({ error: 'Für diesen Server ist kein unterstützter Docker-Host hinterlegt.' });
    }

    const containers = await listContainersOnHost(hostIp);
    const matchedContainer = matchContainerFromList(server, containers, hostIp, port);
    if (!matchedContainer) {
      return res.status(404).json({ error: 'Kein passender Docker-Container für diesen Server gefunden.' });
    }

    // 1. Laufenden Container inspizieren
    const inspectRes = await dockerEngineRequest(hostIp, 'GET', `/containers/${matchedContainer.containerId}/json`);
    const inspectData = inspectRes.data;
    const currentImageId = inspectData.Image;
    const configuredImage = inspectData.Config.Image;
    const cleanName = matchedContainer.containerName;

    // 2. Aktuelles Image lokal als Rollback-Snapshot taggen (damit es nie gelöscht wird)
    const rollbackRepo = `homeserver-rollback/${cleanName.toLowerCase().replace(/[^a-z0-9_.-]/g, '-')}`;
    const rollbackTag = 'previous';
    const rollbackFullTag = `${rollbackRepo}:${rollbackTag}`;

    console.log(`[ContainerUpdate] Sichere aktuelles Image (${currentImageId.slice(0, 19)}) von "${cleanName}" als ${rollbackFullTag}...`);
    await dockerEngineRequest(
      hostIp,
      'POST',
      `/images/${encodeURIComponent(currentImageId)}/tag?repo=${encodeURIComponent(rollbackRepo)}&tag=${encodeURIComponent(rollbackTag)}`
    );

    // 3. Neues Image von der Registry pullen (während der alte Container noch weiterläuft!)
    const { repo, tag } = splitImageRepoTag(configuredImage);
    console.log(`[ContainerUpdate] Lade neuestes Image ${repo}:${tag} auf ${hostIp} herunter...`);
    await dockerEngineRequest(
      hostIp,
      'POST',
      `/images/create?fromImage=${encodeURIComponent(repo)}&tag=${encodeURIComponent(tag)}`,
      null,
      300000 // 5 Minuten Timeout für große Images
    );

    // 4. Container mit dem neuen Image neu erstellen & starten
    console.log(`[ContainerUpdate] Starte Container "${cleanName}" mit neuem Image neu...`);
    await recreateContainerWithImage(hostIp, inspectData, configuredImage);

    // 5. Rollback-Metadaten in servers.json speichern
    const previousVerLabel = server.installedVersion || `${configuredImage} (${currentImageId.replace('sha256:', '').slice(0, 8)})`;
    server.rollbackAvailable = true;
    server.rollbackImageId = currentImageId;
    server.rollbackImageTag = rollbackFullTag;
    server.rollbackOriginalImage = configuredImage;
    server.rollbackContainerName = cleanName;
    server.rollbackHostIp = hostIp;
    server.rollbackVersion = previousVerLabel;
    server.rollbackSavedAt = new Date().toISOString();
    server.installedVersion = server.lastKnownRelease || 'Aktuell';
    server.lastUpdatedAt = new Date().toISOString();

    await writeServers(servers);
    console.log(`[ContainerUpdate] Update für "${cleanName}" erfolgreich abgeschlossen!`);

    res.json({
      success: true,
      containerName: cleanName,
      installedVersion: server.installedVersion,
      rollbackAvailable: true,
      rollbackVersion: server.rollbackVersion,
      rollbackSavedAt: server.rollbackSavedAt
    });
  } catch (error) {
    console.error(`[ContainerUpdate] Fehler beim Update von Server ${id}:`, error);
    res.status(500).json({ error: error.message || 'Fehler beim Aktualisieren des Containers.' });
  }
});

// API: Docker-Container auf die zuletzt gesicherte Version zurücksetzen (Rollback)
app.post('/api/servers/:id/rollback-container', async (req, res) => {
  const { id } = req.params;
  try {
    const servers = await readServers();
    const serverIndex = servers.findIndex(s => s.id === id);
    if (serverIndex === -1) {
      return res.status(404).json({ error: 'Server nicht gefunden.' });
    }

    const server = servers[serverIndex];
    if (isServerExcludedFromUpdates(server)) {
      return res.status(403).json({ error: 'Dieser Server ist gesperrt!' });
    }

    if (!server.rollbackAvailable || (!server.rollbackImageId && !server.rollbackImageTag)) {
      return res.status(400).json({ error: 'Für diesen Server ist noch kein Rollback-Snapshot vorhanden.' });
    }

    const { hostIp, port } = parseServerHostAndPort(server.url);
    const targetHostIp = server.rollbackHostIp || hostIp;
    const containers = await listContainersOnHost(targetHostIp);
    const matchedContainer = matchContainerFromList(server, containers, targetHostIp, port);
    if (!matchedContainer) {
      return res.status(404).json({ error: 'Laufender Container für das Rollback wurde nicht gefunden.' });
    }

    const inspectRes = await dockerEngineRequest(targetHostIp, 'GET', `/containers/${matchedContainer.containerId}/json`);
    const inspectData = inspectRes.data;
    const configuredImage = server.rollbackOriginalImage || inspectData.Config.Image;
    const rollbackSource = server.rollbackImageTag || server.rollbackImageId;

    // 1. Gesichertes Rollback-Image wieder auf den ursprünglichen Image-Tag setzen
    const { repo, tag } = splitImageRepoTag(configuredImage);
    console.log(`[ContainerRollback] Stelle Image ${rollbackSource} als ${repo}:${tag} wieder her...`);
    await dockerEngineRequest(
      targetHostIp,
      'POST',
      `/images/${encodeURIComponent(rollbackSource)}/tag?repo=${encodeURIComponent(repo)}&tag=${encodeURIComponent(tag)}`
    );

    // 2. Container mit dem wiederhergestellten Image neu starten
    console.log(`[ContainerRollback] Starte Container "${matchedContainer.containerName}" mit vorheriger Version...`);
    await recreateContainerWithImage(targetHostIp, inspectData, configuredImage);

    server.installedVersion = server.rollbackVersion || 'Vorherige Version';
    server.lastRolledBackAt = new Date().toISOString();
    await writeServers(servers);

    console.log(`[ContainerRollback] Rollback für "${matchedContainer.containerName}" erfolgreich abgeschlossen!`);
    res.json({
      success: true,
      containerName: matchedContainer.containerName,
      restoredVersion: server.installedVersion
    });
  } catch (error) {
    console.error(`[ContainerRollback] Fehler beim Rollback von Server ${id}:`, error);
    res.status(500).json({ error: error.message || 'Fehler beim Zurücksetzen auf die vorherige Version.' });
  }
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
    icon: cat.icon ? cat.icon.trim() : 'fa-server',
    color: cat.color ? cat.color.trim() : '#a78bfa'
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
    favorite: req.body.favorite || false,
    ignoreUpdates: !!req.body.ignoreUpdates
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
  if (req.body.ignoreUpdates !== undefined) {
    servers[serverIndex].ignoreUpdates = !!req.body.ignoreUpdates;
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

// Wöchentliche Update-Prüfung (prüft alle 6 Stunden, ob 7 Tage seit dem letzten Check vergangen sind)
setInterval(runScheduledWeeklyCheckIfNeeded, 6 * 60 * 60 * 1000);
setTimeout(runScheduledWeeklyCheckIfNeeded, 15 * 1000);

// Beim Start des Servers einmal alle prüfen
checkAllServers();

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Homeserver Monitor läuft auf http://localhost:${PORT}`);
  console.log(`==================================================`);
});
