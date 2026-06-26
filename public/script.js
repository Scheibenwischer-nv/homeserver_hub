/**
 * HOMESERVER DASHBOARD - FRONTEND LOGIC
 */

const TRANSLATIONS = {
  de: {
    // Header & Stats
    app_title: "HomeServer Hub",
    app_subtitle: "Live Status & Link-Verzeichnis",
    stats_total: "Gesamt:",
    stats_online: "Online:",
    stats_offline: "Offline:",
    tooltip_scan: "Lokales Netzwerk nach Diensten durchsuchen",
    btn_scan: "Netzwerk scannen",
    tooltip_refresh: "Status jetzt aktualisieren",
    btn_refresh: "Jetzt prüfen",
    tooltip_settings: "Kategorien verwalten",
    btn_settings: "Einstellungen",
    tooltip_help: "Hilfe & Anleitung anzeigen",
    btn_help: "Hilfe",
    btn_add_server: "Server hinzufügen",
    loading_servers: "Lade Server...",
    footer_text: "Automatische Aktualisierung alle 30 Sekunden. Entworfen für deinen Homeserver.",
    
    // Status & Cards
    status_online: "Online",
    status_offline: "Offline",
    status_checking: "Prüft...",
    status_never: "Nie",
    status_no_response: "Keine Antwort",
    tooltip_favorite_add: "Als Favorit markieren",
    tooltip_favorite_remove: "Als Favorit entfernen",
    tooltip_edit: "Bearbeiten",
    tooltip_delete: "Löschen",
    favorites_title: "Favoriten",
    empty_servers_text: "Noch keine Server eingerichtet.",
    btn_add_first_server: "Ersten Server hinzufügen",
    fallback_category: "Sonstige",
    
    // Add/Edit Dialog
    dialog_add_title: "Server hinzufügen",
    dialog_edit_title: "Server bearbeiten",
    label_server_name: "Server-Name",
    placeholder_server_name: "z. B. Plex Media Server",
    label_server_url: "URL / IP-Adresse",
    placeholder_server_url: "z. B. http://192.168.1.100:32400",
    help_server_url: "Mit http:// oder https:// (z. B. https://plex.tv)",
    label_category: "Kategorie",
    btn_cancel: "Abbrechen",
    btn_save: "Speichern",
    
    // Settings Dialog - General
    settings_title: "Einstellungen & Hilfe",
    tab_categories: "Kategorien",
    tab_telegram: "Telegram",
    tab_help: "Hilfe & Anleitung",
    btn_close: "Schließen",
    btn_save_changes: "Änderungen speichern",
    btn_saving: "Speichert...",
    
    // Settings - Categories Tab
    add_category_title: "Kategorie hinzufügen",
    placeholder_new_cat: "z. B. Smart Home",
    help_new_cat: "Wähle ein passendes Icon für deine Kategorie.",
    existing_categories_title: "Bestehende Kategorien",
    
    // Settings - Telegram Tab
    telegram_notifications_title: "Telegram Benachrichtigungen",
    telegram_notifications_desc: "Lass dich sofort per Telegram informieren, wenn ein überwachter Server offline geht.",
    telegram_enable_label: "Ausfall-Benachrichtigungen aktivieren",
    telegram_token_label: "Telegram Bot-Token",
    placeholder_telegram_token: "z. B. 123456789:ABCdefGhIJK...",
    telegram_chatid_label: "Deine Chat-ID",
    placeholder_telegram_chatid: "z. B. 987654321",
    telegram_test_btn: "Verbindung testen",
    telegram_testing_btn: "Sende Test...",
    
    // Settings - Help Tab
    help_intro: "Willkommen beim <strong>HomeServer Hub</strong>! Hier findest du eine einfache Schritt-für-Schritt-Anleitung, wie du deine Geräte verwaltest und Benachrichtigungen einrichtest.",
    help_sec1_title: "<i class=\"fa-solid fa-play\"></i> 1. Erste Schritte",
    help_sec1_desc: "Das Dashboard prüft alle 30 Sekunden automatisch den Status deiner Geräte. Drücke auf <strong>„Jetzt prüfen“</strong> im Header, um einen manuellen Check auszulösen.",
    help_sec2_title: "<i class=\"fa-solid fa-magnifying-glass\"></i> 2. Geräte suchen (Netzwerk-Scan)",
    help_sec2_desc1: "Du musst Adressen nicht manuell eintippen! Klicke oben auf <strong>„Netzwerk scannen“</strong> und dann auf <strong>„Scan starten“</strong>.",
    help_sec2_desc2: "Wähle nach dem Scan die gefundenen Dienste (wie Home Assistant, Plex oder Docker-Container) aus und importiere sie mit einem Klick.",
    help_sec3_title: "<i class=\"fa-solid fa-bell\"></i> 3. Telegram-Ausfallwarnung einrichten",
    help_sec3_desc: "Du kannst dich per Telegram informieren lassen, wenn ein Server offline geht. So erstellst du den dafür nötigen Bot:",
    help_sec3_a_title: "A. Bot erstellen (Bot-Token erhalten):",
    help_sec3_a_li1: "Suche in Telegram nach dem Kontakt <strong>@BotFather</strong> (offizielles Profil mit blauem Haken).",
    help_sec3_a_li2: "Sende ihm den Befehl <code>/newbot</code>.",
    help_sec3_a_li3: "Gib einen Anzeigenamen ein (z. B. <i>Mein Server Wächter</i>).",
    help_sec3_a_li4: "Gib einen Benutzernamen ein, der auf <i>bot</i> endet (z. B. <i>mein_waechter_hub_bot</i>).",
    help_sec3_a_li5: "Kopiere das angezeigte <strong>Token</strong> (z. B. <code>123456789:ABCdefGh...</code>).",
    help_sec3_b_title: "B. Deine Chat-ID ermitteln:",
    help_sec3_b_li1: "Suche in Telegram nach dem Kontakt <strong>@userinfobot</strong>.",
    help_sec3_b_li2: "Klicke auf <strong>Start</strong>. Er sendet dir sofort deine ID-Nummer zurück (z. B. <code>987654321</code>).",
    help_sec3_c_title: "C. Im Dashboard speichern:",
    help_sec3_c_desc: "Wähle oben den Tab <strong>„Telegram“</strong>, trage Bot-Token und Chat-ID ein, klicke auf <strong>„Verbindung testen“</strong> und speichere danach die Änderungen.",
    help_sec4_title: "<i class=\"fa-solid fa-star\"></i> 4. Favoriten &amp; Einklappen",
    help_sec4_fav_desc: "<strong>Favoriten:</strong> Klicke auf den Stern oben links einer Kachel. Sie wird dann ganz oben im Schnellzugriff-Bereich angeheftet.",
    help_sec4_collapse_desc: "<strong>Einklappen:</strong> Klicke auf den Titel einer Kategorie (z. B. „Media“), um sie einzuklappen. Der Zustand wird automatisch gespeichert.",
    
    // Scanner Dialog
    scan_dialog_title: "Netzwerk scannen",
    scan_status_ready: "Scan bereit. Klicke auf \"Scan starten\".",
    scan_status_scanning: "Suche nach aktiven Geräten und Diensten... Bitte warten (ca. 5-10 Sekunden).",
    scan_status_finished: "Scan abgeschlossen! Subnetz {subnet}.x durchsucht. {count} Dienst(e)/Container gefunden.",
    scan_status_error: "Fehler beim Scannen des Netzwerks.",
    scan_select_all: "Alle auswählen",
    scan_info_desc: "Es wird dein lokales IP-Subnetz nach typischen Homeserver-Webdiensten (Home Assistant, Plex, Synology, Proxmox etc. sowie Docker-Containern) gescannt.",
    scan_info_scanning: "Subnetz wird gescannt. Ports werden geprüft...",
    scan_no_services: "Keine aktiven Webdienste gefunden.",
    scan_no_services_help: "Gescannte Ports: 80, 443, 8080, 8123 (Home Assistant), 32400 (Plex), 8006 (Proxmox), 9000 (Portainer), 5001 (Synology), 2375 (Docker)",
    btn_start_scan: "Scan starten",
    btn_start_scan_loading: "Scanne...",
    btn_start_scan_again: "Erneut scannen",
    btn_import_selected: "Ausgewählte hinzufügen",
    btn_import_selected_loading: "Hinzufügen...",
    
    // JS Alerts & Confirms
    alert_delete_server: "Möchtest du den Server \"{name}\" wirklich löschen?",
    alert_delete_server_error: "Fehler beim Löschen des Servers.",
    alert_save_favorite_error: "Fehler beim Speichern des Favoriten-Status.",
    alert_save_server_error: "Fehler beim Speichern des Servers.",
    alert_telegram_test_empty: "Bitte gib zuerst Bot-Token und Chat-ID ein!",
    alert_telegram_test_success: "Erfolg! Testnachricht gesendet. Bitte prüfe Telegram auf deinem Handy.",
    alert_telegram_test_error: "Fehler: {error}",
    alert_telegram_test_network_error: "Testnachricht fehlgeschlagen. Netzwerkfehler.",
    alert_cat_name_empty: "Name darf nicht leer sein!",
    alert_cat_exists: "Eine Kategorie mit diesem Namen existiert bereits!",
    alert_cat_delete_confirm: "Möchtest du die Kategorie \"{name}\" wirklich löschen?",
    alert_save_settings_error: "Fehler beim Speichern der Einstellungen: {error}",
    alert_backend_connection_failed: "Verbindung zum Server-Backend fehlgeschlagen.",
    btn_retry: "Erneut versuchen",
    
    // Icon Descriptions
    icon_smarthome: "Smart Home (Haus-Signal)",
    icon_media: "Medien / Streaming (Film)",
    icon_network: "Netzwerk (Kabelnetz)",
    icon_nas: "Speicher / NAS (Festplatte)",
    icon_dev: "Entwicklung (Code)",
    icon_tools: "Werkzeuge / Sonstiges (Schraubenschlüssel)",
    icon_security: "Sicherheit / Firewall (Schild)",
    icon_infra: "Infrastruktur (Server)",
    icon_db: "Datenbank (Datenbank-Symbol)",
    icon_cloud: "Cloud / Sync (Wolke)",
    icon_gaming: "Gaming (Gamepad)",
    icon_terminal: "Terminal / CLI (Terminal)",
    icon_monitoring: "Überwachung (Diagramm)",
    icon_music: "Musik / Audio (Note)",
    icon_docs: "Dokumente / Wiki (Buch)",
    icon_mail: "E-Mail / Kommunikation (Brief)",
    icon_downloads: "Downloads (Download-Pfeil)"
  },
  en: {
    // Header & Stats
    app_title: "HomeServer Hub",
    app_subtitle: "Live Status & Link Directory",
    stats_total: "Total:",
    stats_online: "Online:",
    stats_offline: "Offline:",
    tooltip_scan: "Scan local network for services",
    btn_scan: "Scan Network",
    tooltip_refresh: "Refresh status now",
    btn_refresh: "Check Now",
    tooltip_settings: "Manage categories",
    btn_settings: "Settings",
    tooltip_help: "Show Help & Instructions",
    btn_help: "Help",
    btn_add_server: "Add Server",
    loading_servers: "Loading servers...",
    footer_text: "Automatic update every 30 seconds. Designed for your home server.",
    
    // Status & Cards
    status_online: "Online",
    status_offline: "Offline",
    status_checking: "Checking...",
    status_never: "Never",
    status_no_response: "No response",
    tooltip_favorite_add: "Mark as favorite",
    tooltip_favorite_remove: "Remove from favorites",
    tooltip_edit: "Edit",
    tooltip_delete: "Delete",
    favorites_title: "Favorites",
    empty_servers_text: "No servers set up yet.",
    btn_add_first_server: "Add First Server",
    fallback_category: "Other",
    
    // Add/Edit Dialog
    dialog_add_title: "Add Server",
    dialog_edit_title: "Edit Server",
    label_server_name: "Server Name",
    placeholder_server_name: "e.g. Plex Media Server",
    label_server_url: "URL / IP Address",
    placeholder_server_url: "e.g. http://192.168.1.100:32400",
    help_server_url: "With http:// or https:// (e.g. https://plex.tv)",
    label_category: "Category",
    btn_cancel: "Cancel",
    btn_save: "Save",
    
    // Settings Dialog - General
    settings_title: "Settings & Help",
    tab_categories: "Categories",
    tab_telegram: "Telegram",
    tab_help: "Help & Instructions",
    btn_close: "Close",
    btn_save_changes: "Save Changes",
    btn_saving: "Saving...",
    
    // Settings - Categories Tab
    add_category_title: "Add Category",
    placeholder_new_cat: "e.g. Smart Home",
    help_new_cat: "Choose a suitable icon for your category.",
    existing_categories_title: "Existing Categories",
    
    // Settings - Telegram Tab
    telegram_notifications_title: "Telegram Notifications",
    telegram_notifications_desc: "Get notified immediately via Telegram if a monitored server goes offline.",
    telegram_enable_label: "Enable offline notifications",
    telegram_token_label: "Telegram Bot Token",
    placeholder_telegram_token: "e.g. 123456789:ABCdefGhIJK...",
    telegram_chatid_label: "Your Chat ID",
    placeholder_telegram_chatid: "e.g. 987654321",
    telegram_test_btn: "Test Connection",
    telegram_testing_btn: "Sending Test...",
    
    // Settings - Help Tab
    help_intro: "Welcome to the <strong>HomeServer Hub</strong>! Here you will find a simple step-by-step guide on how to manage your devices and set up notifications.",
    help_sec1_title: "<i class=\"fa-solid fa-play\"></i> 1. Getting Started",
    help_sec1_desc: "The dashboard automatically checks the status of your devices every 30 seconds. Press <strong>\"Check Now\"</strong> in the header to trigger a manual check.",
    help_sec2_title: "<i class=\"fa-solid fa-magnifying-glass\"></i> 2. Scan Devices (Network Scan)",
    help_sec2_desc1: "You don't need to type addresses manually! Click <strong>\"Scan Network\"</strong> at the top and then <strong>\"Start Scan\"</strong>.",
    help_sec2_desc2: "After the scan, select the found services (like Home Assistant, Plex, or Docker containers) and import them with one click.",
    help_sec3_title: "<i class=\"fa-solid fa-bell\"></i> 3. Set Up Telegram Downtime Warning",
    help_sec3_desc: "You can be notified via Telegram if a server goes offline. Here is how to create the necessary bot:",
    help_sec3_a_title: "A. Create Bot (Get Bot Token):",
    help_sec3_a_li1: "Search for the contact <strong>@BotFather</strong> in Telegram (official profile with a blue checkmark).",
    help_sec3_a_li2: "Send him the command <code>/newbot</code>.",
    help_sec3_a_li3: "Enter a display name (e.g., <i>My Server Guardian</i>).",
    help_sec3_a_li4: "Enter a username that ends in <i>bot</i> (e.g., <i>my_guardian_hub_bot</i>).",
    help_sec3_a_li5: "Copy the displayed <strong>token</strong> (e.g., <code>123456789:ABCdefGh...</code>).",
    help_sec3_b_title: "B. Determine Your Chat ID:",
    help_sec3_b_li1: "Search for the contact <strong>@userinfobot</strong> in Telegram.",
    help_sec3_b_li2: "Click <strong>Start</strong>. It will immediately send you your ID number (e.g., <code>987654321</code>).",
    help_sec3_c_title: "C. Save in the Dashboard:",
    help_sec3_c_desc: "Select the <strong>\"Telegram\"</strong> tab above, enter the Bot Token and Chat ID, click <strong>\"Test Connection\"</strong>, and then save the changes.",
    help_sec4_title: "<i class=\"fa-solid fa-star\"></i> 4. Favorites &amp; Collapse",
    help_sec4_fav_desc: "<strong>Favorites:</strong> Click the star in the top-left corner of a tile. It will be pinned to the quick access area at the very top.",
    help_sec4_collapse_desc: "<strong>Collapse:</strong> Click the title of a category (e.g., \"Media\") to collapse it. The state is saved automatically.",
    
    // Scanner Dialog
    scan_dialog_title: "Scan Network",
    scan_status_ready: "Scan ready. Click \"Start Scan\".",
    scan_status_scanning: "Searching for active devices and services... Please wait (approx. 5-10 seconds).",
    scan_status_finished: "Scan finished! Subnet {subnet}.x scanned. {count} service(s)/container found.",
    scan_status_error: "Error scanning network.",
    scan_select_all: "Select all",
    scan_info_desc: "Your local IP subnet will be scanned for typical home server web services (Home Assistant, Plex, Synology, Proxmox, etc. as well as Docker containers).",
    scan_info_scanning: "Subnet is being scanned. Ports are being checked...",
    scan_no_services: "No active web services found.",
    scan_no_services_help: "Scanned ports: 80, 443, 8080, 8123 (Home Assistant), 32400 (Plex), 8006 (Proxmox), 9000 (Portainer), 5001 (Synology), 2375 (Docker)",
    btn_start_scan: "Start Scan",
    btn_start_scan_loading: "Scanning...",
    btn_start_scan_again: "Scan Again",
    btn_import_selected: "Add Selected",
    btn_import_selected_loading: "Adding...",
    
    // JS Alerts & Confirms
    alert_delete_server: "Are you sure you want to delete server \"{name}\"?",
    alert_delete_server_error: "Error deleting server.",
    alert_save_favorite_error: "Error saving favorite status.",
    alert_save_server_error: "Error saving server.",
    alert_telegram_test_empty: "Please enter Bot Token and Chat ID first!",
    alert_telegram_test_success: "Success! Test message sent. Please check Telegram on your phone.",
    alert_telegram_test_error: "Error: {error}",
    alert_telegram_test_network_error: "Test message failed. Network error.",
    alert_cat_name_empty: "Name cannot be empty!",
    alert_cat_exists: "A category with this name already exists!",
    alert_cat_delete_confirm: "Are you sure you want to delete category \"{name}\"?",
    alert_save_settings_error: "Error saving settings: {error}",
    alert_backend_connection_failed: "Connection to server backend failed.",
    btn_retry: "Try again",
    
    // Icon Descriptions
    icon_smarthome: "Smart Home (House Signal)",
    icon_media: "Media / Streaming (Film)",
    icon_network: "Network (Wired)",
    icon_nas: "Storage / NAS (Hard Drive)",
    icon_dev: "Development (Code)",
    icon_tools: "Tools / Other (Wrench)",
    icon_security: "Security / Firewall (Shield)",
    icon_infra: "Infrastructure (Server)",
    icon_db: "Database (Database)",
    icon_cloud: "Cloud / Sync (Cloud)",
    icon_gaming: "Gaming (Gamepad)",
    icon_terminal: "Terminal / CLI (Terminal)",
    icon_monitoring: "Monitoring (Chart)",
    icon_music: "Music / Audio (Note)",
    icon_docs: "Documents / Wiki (Book)",
    icon_mail: "Email / Communication (Letter)",
    icon_downloads: "Downloads (Download Arrow)"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const bgCanvas = document.getElementById('bg-canvas');
  const tilesGrid = document.getElementById('tiles-grid');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnAddServer = document.getElementById('btn-add-server');
  
  // Stats Elements
  const statsTotal = document.getElementById('stats-total');
  const statsOnline = document.getElementById('stats-online');
  const statsOffline = document.getElementById('stats-offline');

  // Dialog Elements
  const serverDialog = document.getElementById('server-dialog');
  const btnCloseDialog = document.getElementById('btn-close-dialog');
  const btnCancelDialog = document.getElementById('btn-cancel-dialog');
  const serverForm = document.getElementById('server-form');
  const dialogTitle = document.getElementById('dialog-title');
  
  // Form Inputs
  const inputId = document.getElementById('server-id');
  const inputName = document.getElementById('server-name');
  const inputUrl = document.getElementById('server-url');
  const inputCategory = document.getElementById('server-category');

  // Scanner DOM Elements
  const btnScan = document.getElementById('btn-scan');
  const scanDialog = document.getElementById('scan-dialog');
  const btnCloseScanDialog = document.getElementById('btn-close-scan-dialog');
  const btnCancelScan = document.getElementById('btn-cancel-scan');
  const btnStartScan = document.getElementById('btn-start-scan');
  const scanStatusText = document.getElementById('scan-status-text');
  const scanProgressContainer = document.getElementById('scan-progress-container');
  const scanProgressBar = document.getElementById('scan-progress-bar');
  const scanResultsArea = document.getElementById('scan-results-area');

  // New Select-All & Batch-Import DOM elements
  const scanSelectAllBar = document.getElementById('scan-select-all-bar');
  const chkSelectAll = document.getElementById('chk-select-all');
  const selectedCountText = document.getElementById('selected-count');
  const totalScannedCountText = document.getElementById('total-scanned-count');
  const btnImportSelected = document.getElementById('btn-import-selected');

  // Settings DOM Elements
  const settingsDialog = document.getElementById('settings-dialog');
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettingsDialog = document.getElementById('btn-close-settings-dialog');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const addCategoryForm = document.getElementById('add-category-form');
  const categoriesListArea = document.getElementById('categories-list-area');
  const newCatNameInput = document.getElementById('new-cat-name');
  const newCatIconInput = document.getElementById('new-cat-icon');
  const telegramEnabled = document.getElementById('telegram-enabled');
  const telegramToken = document.getElementById('telegram-token');
  const telegramChatId = document.getElementById('telegram-chatid');
  const btnTestTelegram = document.getElementById('btn-test-telegram');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Help Button
  const btnHelp = document.getElementById('btn-help');

  // State
  let servers = [];
  let scannedServices = [];
  let categories = [];
  let localCategoriesCopy = [];
  let editingCategoryIndex = null;

  const PREDEFINED_ICONS = [
    { class: 'fa-house-signal', key: 'icon_smarthome' },
    { class: 'fa-film', key: 'icon_media' },
    { class: 'fa-network-wired', key: 'icon_network' },
    { class: 'fa-hard-drive', key: 'icon_nas' },
    { class: 'fa-code', key: 'icon_dev' },
    { class: 'fa-screwdriver-wrench', key: 'icon_tools' },
    { class: 'fa-shield-halved', key: 'icon_security' },
    { class: 'fa-server', key: 'icon_infra' },
    { class: 'fa-database', key: 'icon_db' },
    { class: 'fa-cloud', key: 'icon_cloud' },
    { class: 'fa-gamepad', key: 'icon_gaming' },
    { class: 'fa-terminal', key: 'icon_terminal' },
    { class: 'fa-chart-line', key: 'icon_monitoring' },
    { class: 'fa-music', key: 'icon_music' },
    { class: 'fa-book-open', key: 'icon_docs' },
    { class: 'fa-envelope', key: 'icon_mail' },
    { class: 'fa-download', key: 'icon_downloads' }
  ];

  // Language (i18n) setup
  let currentLang = localStorage.getItem('lang') || 'de';

  function translate(key, replaces = {}) {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS['de'];
    let text = langDict[key] || TRANSLATIONS['de'][key] || key;
    
    // Replace placeholders like {name} or {count} or {subnet}
    Object.keys(replaces).forEach(replaceKey => {
      text = text.replace(new RegExp(`{${replaceKey}}`, 'g'), replaces[replaceKey]);
    });
    
    return text;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update active class on buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key.startsWith('help_sec') || key === 'help_intro') {
        el.innerHTML = translate(key);
      } else {
        el.textContent = translate(key);
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', translate(key));
    });

    // Translate titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', translate(key));
    });
  }

  function populateIconSelect(selectElement, selectedValue = '') {
    selectElement.innerHTML = '';
    PREDEFINED_ICONS.forEach(icon => {
      const option = document.createElement('option');
      option.value = icon.class;
      option.textContent = translate(icon.key);
      if (icon.class === selectedValue) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });
  }

  // ==========================================================================
  // 1. Wabernder Hintergrund (Canvas Fluid Animation)
  // ==========================================================================
  const ctx = bgCanvas.getContext('2d');
  let animationFrameId;

  // Anpassung der Canvas-Größe
  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Blob Definitionen für die Waber-Animation
  const blobs = [
    {
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.min(bgCanvas.width, bgCanvas.height) * 0.25,
      baseRadius: Math.min(bgCanvas.width, bgCanvas.height) * 0.25,
      pulseSpeed: 0.001,
      pulsePhase: Math.random() * Math.PI,
      color: 'rgba(139, 92, 246, 0.15)' // Weiches Violett
    },
    {
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.min(bgCanvas.width, bgCanvas.height) * 0.3,
      baseRadius: Math.min(bgCanvas.width, bgCanvas.height) * 0.3,
      pulseSpeed: 0.0008,
      pulsePhase: Math.random() * Math.PI,
      color: 'rgba(6, 182, 212, 0.12)' // Weiches Cyan
    },
    {
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.min(bgCanvas.width, bgCanvas.height) * 0.2,
      baseRadius: Math.min(bgCanvas.width, bgCanvas.height) * 0.2,
      pulseSpeed: 0.0015,
      pulsePhase: Math.random() * Math.PI,
      color: 'rgba(236, 72, 153, 0.08)' // Weiches Rosa
    },
    {
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.min(bgCanvas.width, bgCanvas.height) * 0.28,
      baseRadius: Math.min(bgCanvas.width, bgCanvas.height) * 0.28,
      pulseSpeed: 0.0006,
      pulsePhase: Math.random() * Math.PI,
      color: 'rgba(79, 70, 229, 0.1)' // Weiches Indigo
    }
  ];

  function drawAnimation() {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Dunkler Basis-Verlauf
    const baseGradient = ctx.createRadialGradient(
      bgCanvas.width / 2, bgCanvas.height / 2, 0,
      bgCanvas.width / 2, bgCanvas.height / 2, Math.max(bgCanvas.width, bgCanvas.height)
    );
    baseGradient.addColorStop(0, '#0c0a21');
    baseGradient.addColorStop(1, '#04030a');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Blobs zeichnen und animieren
    blobs.forEach(blob => {
      // Position aktualisieren
      blob.x += blob.vx;
      blob.y += blob.vy;

      // Pulse-Effekt auf Radius
      blob.pulsePhase += blob.pulseSpeed;
      blob.radius = blob.baseRadius + Math.sin(blob.pulsePhase) * (blob.baseRadius * 0.15);

      // An den Rändern abprallen (weich umkehren)
      if (blob.x - blob.radius < 0) {
        blob.x = blob.radius;
        blob.vx *= -1;
      } else if (blob.x + blob.radius > bgCanvas.width) {
        blob.x = bgCanvas.width - blob.radius;
        blob.vx *= -1;
      }

      if (blob.y - blob.radius < 0) {
        blob.y = blob.radius;
        blob.vy *= -1;
      } else if (blob.y + blob.radius > bgCanvas.height) {
        blob.y = bgCanvas.height - blob.radius;
        blob.vy *= -1;
      }

      // Blob als weichen Gradienten zeichnen
      const radGrad = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      
      // Weicher Farbübergang für wabernden Effekt
      radGrad.addColorStop(0, blob.color);
      radGrad.addColorStop(0.5, blob.color.replace(/[\d\.]+\)$/, '0.04)'));
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fillStyle = radGrad;
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(drawAnimation);
  }

  // Animation starten
  drawAnimation();


  // ==========================================================================
  // 2. Dynamic Category Mappings & Logos
  // ==========================================================================
  function getCategoryIcon(categoryName) {
    const cat = categories.find(c => c.name === categoryName);
    return cat ? cat.icon : 'fa-folder';
  }

  // Intelligente Logo-Erkennung für Homeserver-Dienste
  function getNamedLogoUrl(server) {
    const nameLower = server.name.toLowerCase();
    const urlLower = server.url.toLowerCase();

    // 1. Lokale Zuordnungen über das walksxcode jsDelivr CDN (sehr populäre Dashboard-Icons)
    if (nameLower.includes('home assistant') || nameLower.includes('homeassistant') || nameLower.includes('hass')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/home-assistant.png';
    }
    if (nameLower.includes('plex')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/plex.png';
    }
    if (nameLower.includes('pi-hole') || nameLower.includes('pihole') || nameLower.includes('pi.hole')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/pi-hole.png';
    }
    if (nameLower.includes('nextcloud')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nextcloud.png';
    }
    if (nameLower.includes('portainer')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/portainer.png';
    }
    if (nameLower.includes('proxmox')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/proxmox.png';
    }
    if (nameLower.includes('openmediavault') || nameLower.includes('omv')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/openmediavault.png';
    }
    if (nameLower.includes('unifi')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/unifi.png';
    }
    if (nameLower.includes('synology')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/synology.png';
    }
    if (nameLower.includes('google')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google.png';
    }
    if (nameLower.includes('adguard')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/adguard-home.png';
    }
    if (nameLower.includes('iobroker')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/iobroker.png';
    }
    if (nameLower.includes('node-red') || nameLower.includes('nodered')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/node-red.png';
    }
    if (nameLower.includes('fritz') || nameLower.includes('router')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/fritzbox.png';
    }
    if (nameLower.includes('docker')) {
      return 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/docker.png';
    }

    // 2. Öffentliche Domains via Google Favicon-API
    try {
      const url = new URL(server.url);
      const host = url.hostname;
      
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host);
      const isLocalHost = host === 'localhost' || host.endsWith('.local');
      
      if (!isIP && !isLocalHost) {
        return `https://www.google.com/s2/favicons?sz=128&domain=${host}`;
      }
    } catch (e) {
      // Ignorieren bei URL-Fehlern
    }

    return null;
  }


  // ==========================================================================
  // 3. Render Logik (Gruppiert nach Kategorien)
  // ==========================================================================
  function updateStats() {
    const total = servers.length;
    const online = servers.filter(s => s.status === 'online').length;
    const offline = servers.filter(s => s.status === 'offline').length;

    statsTotal.textContent = total;
    statsOnline.textContent = online;
    statsOffline.textContent = offline;
  }

  function createServerCard(server) {
    const card = document.createElement('a');
    card.className = `server-card status-${server.status}`;
    
    // Protokoll-Check für den Link, falls in alten Daten kein http/https definiert war
    let cardUrl = server.url || '';
    if (cardUrl && !/^https?:\/\//i.test(cardUrl.trim())) {
      cardUrl = `http://${cardUrl.trim()}`;
    }
    card.href = cardUrl;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    
    let timeString = translate('status_never');
    if (server.lastChecked) {
      const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
      timeString = new Date(server.lastChecked).toLocaleTimeString(locale);
    }

    let latencyHtml = `<span class="text-dimmed">${translate('status_no_response')}</span>`;
    if (server.status === 'online' && server.latency !== null) {
      const latencyClass = server.latency > 200 ? 'latency-high' : '';
      latencyHtml = `<i class="fa-solid fa-gauge-high ${latencyClass}"></i> <span class="${latencyClass}">${server.latency} ms</span>`;
    } else if (server.status === 'checking') {
      latencyHtml = `<i class="fa-solid fa-spinner fa-spin"></i> ${translate('status_checking')}`;
    }

    const statusText = server.status === 'online' ? translate('status_online') : (server.status === 'checking' ? translate('status_checking') : translate('status_offline'));
    const statusBadgeClass = server.status === 'online' ? 'status-online-badge' : (server.status === 'checking' ? 'status-checking-badge' : 'status-offline-badge');
    
    const categoryIcon = getCategoryIcon(server.category);
    
    // Logo HTML ermitteln
    const primaryLogo = server.favicon;
    const fallbackLogo = getNamedLogoUrl(server);
    let logoHtml = '';
    const firstChar = server.name.trim().charAt(0).toUpperCase();

    if (primaryLogo && fallbackLogo) {
      logoHtml = `
        <div class="server-logo-container">
          <img class="server-logo-img" src="${primaryLogo}" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <img class="server-logo-img" src="${fallbackLogo}" alt="Fallback Logo" style="display: none;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="server-logo-fallback" style="display: none; font-weight: 800; font-size: 1.3rem;">${firstChar}</div>
        </div>
      `;
    } else if (primaryLogo) {
      logoHtml = `
        <div class="server-logo-container">
          <img class="server-logo-img" src="${primaryLogo}" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="server-logo-fallback" style="display: none; font-weight: 800; font-size: 1.3rem;">${firstChar}</div>
        </div>
      `;
    } else if (fallbackLogo) {
      logoHtml = `
        <div class="server-logo-container">
          <img class="server-logo-img" src="${fallbackLogo}" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="server-logo-fallback" style="display: none; font-weight: 800; font-size: 1.3rem;">${firstChar}</div>
        </div>
      `;
    } else {
      logoHtml = `
        <div class="server-logo-container">
          <div class="server-logo-fallback" style="font-weight: 800; font-size: 1.3rem;">${firstChar}</div>
        </div>
      `;
    }

    const isFav = server.favorite === true;
    const favTitle = isFav ? translate('tooltip_favorite_remove') : translate('tooltip_favorite_add');
    const editTitle = translate('tooltip_edit');
    const deleteTitle = translate('tooltip_delete');
    
    card.innerHTML = `
      <!-- Actions -->
      <div class="card-actions">
        <button type="button" class="btn-icon favorite-btn ${isFav ? 'is-favorite' : ''}" title="${favTitle}" data-id="${server.id}">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
        </button>
        <button type="button" class="btn-icon edit-btn" title="${editTitle}" data-id="${server.id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button type="button" class="btn-icon delete-btn" title="${deleteTitle}" data-id="${server.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>

      <div class="card-header">
        <span class="category-badge">
          <i class="fa-solid ${categoryIcon}"></i> ${server.category}
        </span>
        <span class="status-badge ${statusBadgeClass}">
          <span class="indicator-dot ${server.status}-dot"></span> ${statusText}
        </span>
      </div>

      <div class="card-content-wrapper">
        ${logoHtml}
        <div class="server-card-info">
          <h3 class="server-title">${escapeHTML(server.name)}</h3>
          <span class="server-url">${escapeHTML(server.url)}</span>
        </div>
      </div>

      <div class="card-details">
        <div class="server-latency">
          ${latencyHtml}
        </div>
        <div class="server-last-checked">
          <i class="fa-solid fa-clock"></i> <span>${timeString}</span>
        </div>
      </div>
    `;

    // Event Listener für Buttons auf der Kachel hinzufügen
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const favBtn = card.querySelector('.favorite-btn');

    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavoriteHandler(server.id);
    });

    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openEditDialog(server.id);
    });

    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteServerHandler(server.id, server.name);
    });

    return card;
  }

  function renderServersList() {
    if (servers.length === 0) {
      tilesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-server-slash"></i>
          <p>${translate('empty_servers_text')}</p>
          <button class="btn btn-primary" id="btn-add-first-server">
            <i class="fa-solid fa-plus"></i> ${translate('btn_add_first_server')}
          </button>
        </div>
      `;
      
      document.getElementById('btn-add-first-server')?.addEventListener('click', () => {
        openDialog();
      });
      updateStats();
      return;
    }

    tilesGrid.innerHTML = '';

    // 1. Favoriten-Bereich ganz oben rendern (ohne Kategorie-Überschrift)
    const favoriteServers = servers.filter(s => s.favorite === true);
    if (favoriteServers.length > 0) {
      const favSection = document.createElement('section');
      favSection.className = 'favorites-section';

      const favHeader = document.createElement('div');
      favHeader.className = 'favorites-header';
      favHeader.innerHTML = `<i class="fa-solid fa-star"></i> ${translate('favorites_title')}`;
      favSection.appendChild(favHeader);

      const favGrid = document.createElement('div');
      favGrid.className = 'favorites-grid';

      favoriteServers.forEach(server => {
        const card = createServerCard(server);
        favGrid.appendChild(card);
      });

      favSection.appendChild(favGrid);
      tilesGrid.appendChild(favSection);
    }

    // Server nach Kategorie gruppieren
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat.name] = [];
    });
    
    const fallbackCategoryName = translate('fallback_category');
    grouped[fallbackCategoryName] = [];

    servers.forEach(server => {
      const catExists = categories.some(c => c.name === server.category);
      const targetCat = catExists ? server.category : fallbackCategoryName;
      grouped[targetCat].push(server);
    });

    // Sektionen für belegte Kategorien rendern (inkl. Fallback)
    const renderOrder = [...categories, { id: 'fallback', name: fallbackCategoryName, icon: 'fa-screwdriver-wrench' }];
    
    // Eingeklappte Zustände aus localStorage lesen
    const collapsedStates = JSON.parse(localStorage.getItem('collapsed-categories') || '{}');

    renderOrder.forEach(cat => {
      const catServers = grouped[cat.name] || [];
      if (catServers.length === 0) return; // Leere Sektionen ausblenden

      // Sektion erstellen
      const section = document.createElement('section');
      section.className = 'category-section';
      
      const isCollapsed = collapsedStates[cat.name] === true;
      if (isCollapsed) {
        section.classList.add('is-collapsed');
      }

      // Titel
      const sectionTitle = document.createElement('h2');
      sectionTitle.className = 'category-section-title';
      sectionTitle.innerHTML = `
        <i class="fa-solid ${cat.icon}"></i> 
        ${cat.name}
        <i class="fa-solid fa-chevron-down collapse-arrow"></i>
      `;
      
      // Klick-Event für Auf-/Zuklappen
      sectionTitle.addEventListener('click', () => {
        const currentlyCollapsed = section.classList.toggle('is-collapsed');
        const states = JSON.parse(localStorage.getItem('collapsed-categories') || '{}');
        states[cat.name] = currentlyCollapsed;
        localStorage.setItem('collapsed-categories', JSON.stringify(states));
      });

      section.appendChild(sectionTitle);

      // Grid
      const grid = document.createElement('div');
      grid.className = 'tiles-grid';

      catServers.forEach(server => {
        const card = createServerCard(server);
        grid.appendChild(card);
      });

      section.appendChild(grid);
      tilesGrid.appendChild(section);
    });

    updateStats();
  }

  // Helper zum Schutz vor XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }


  // ==========================================================================
  // 4. API Operationen
  // ==========================================================================
  async function fetchServers() {
    try {
      const response = await fetch('/api/servers');
      if (!response.ok) throw new Error('API-Fehler beim Laden');
      servers = await response.ok ? await response.json() : [];
      renderServersList();
    } catch (error) {
      console.error('Fehler beim Abrufen der Server:', error);
      tilesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation" style="color: var(--color-offline);"></i>
          <p>${translate('alert_backend_connection_failed')}</p>
          <button class="btn btn-secondary" onclick="window.location.reload()">
            <i class="fa-solid fa-arrows-rotate"></i> ${translate('btn_retry')}
          </button>
        </div>
      `;
    }
  }

  async function triggerStatusCheck() {
    btnRefresh.disabled = true;
    const originalContent = btnRefresh.innerHTML;
    btnRefresh.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${translate('status_checking')}`;
    
    // Status in der UI temporär auf 'checking' setzen
    servers = servers.map(s => ({ ...s, status: 'checking' }));
    renderServersList();

    try {
      const response = await fetch('/api/servers/check', { method: 'POST' });
      if (!response.ok) throw new Error('Prüfung fehlgeschlagen');
      servers = await response.json();
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      // Fallback: Erneut laden
      await fetchServers();
    } finally {
      renderServersList();
      btnRefresh.innerHTML = originalContent;
      btnRefresh.disabled = false;
    }
  }

  async function deleteServerHandler(id, name) {
    if (confirm(translate('alert_delete_server', { name: name }))) {
      try {
        const response = await fetch(`/api/servers/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Löschen fehlgeschlagen');
        
        servers = servers.filter(s => s.id !== id);
        renderServersList();
      } catch (error) {
        alert(translate('alert_delete_server_error'));
        console.error(error);
      }
    }
  }

  async function toggleFavoriteHandler(id) {
    const server = servers.find(s => s.id === id);
    if (!server) return;

    const updatedFavorite = !server.favorite;
    
    // UI sofort anpassen (Optimistisches UI-Update)
    server.favorite = updatedFavorite;
    renderServersList();

    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ favorite: updatedFavorite })
      });

      if (!response.ok) throw new Error('Favorit-Status konnte nicht gespeichert werden');
      const savedServer = await response.json();
      servers = servers.map(s => s.id === id ? savedServer : s);
      renderServersList();
    } catch (error) {
      console.error(error);
      // Rollback bei Fehler
      server.favorite = !updatedFavorite;
      renderServersList();
      alert(translate('alert_save_favorite_error'));
    }
  }


  // ==========================================================================
  // 5. Dialog / Modal Management
  // ==========================================================================
  function openDialog() {
    dialogTitle.setAttribute('data-i18n', 'dialog_add_title');
    applyLanguage(currentLang);
    serverForm.reset();
    inputId.value = '';
    
    serverDialog.showModal();
  }

  function openEditDialog(id) {
    const server = servers.find(s => s.id === id);
    if (!server) return;

    dialogTitle.setAttribute('data-i18n', 'dialog_edit_title');
    applyLanguage(currentLang);
    inputId.value = server.id;
    inputName.value = server.name;
    inputUrl.value = server.url;
    inputCategory.value = server.category;

    serverDialog.showModal();
  }

  function closeDialog() {
    serverDialog.close();
  }

  // Submit Handler
  serverForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = inputId.value;
    const serverData = {
      name: inputName.value.trim(),
      url: inputUrl.value.trim(),
      category: inputCategory.value
    };

    const isEdit = id && id !== '';
    const url = isEdit ? `/api/servers/${id}` : '/api/servers';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serverData)
      });

      if (!response.ok) throw new Error('Speichern fehlgeschlagen');

      const savedServer = await response.json();
      
      if (isEdit) {
        servers = servers.map(s => s.id === id ? savedServer : s);
      } else {
        servers.push(savedServer);
      }

      renderServersList();
      closeDialog();
    } catch (error) {
      alert(translate('alert_save_server_error'));
      console.error(error);
    }
  });

  // ==========================================================================
  // 5b. Netzwerk-Scanner Logik (Frontend)
  // ==========================================================================
  function openScanDialog() {
    scanDialog.showModal();
    // Zurücksetzen auf Standard-Ansicht
    scanStatusText.textContent = translate('scan_status_ready');
    scanProgressBar.className = 'progress-bar-fill';
    scanProgressBar.style.width = '0%';
    scanProgressContainer.style.display = 'none';
    scanSelectAllBar.style.display = 'none';
    btnImportSelected.style.display = 'none';
    scanResultsArea.innerHTML = `
      <div class="scan-info-text">
        <i class="fa-solid fa-circle-info" style="font-size: 2rem; color: var(--color-accent); margin-bottom: 0.75rem;"></i>
        <p>${translate('scan_info_desc')}</p>
      </div>
    `;
    btnStartScan.disabled = false;
    btnStartScan.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> ${translate('btn_start_scan')}`;
  }

  function closeScanDialog() {
    scanDialog.close();
  }

  async function startNetworkScan() {
    btnStartScan.disabled = true;
    btnStartScan.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${translate('btn_start_scan_loading')}`;
    scanStatusText.textContent = translate('scan_status_scanning');
    
    // Fortschrittsbalken vorbereiten und Animation starten
    scanProgressContainer.style.display = 'block';
    scanProgressBar.className = 'progress-bar-fill scanning';
    scanSelectAllBar.style.display = 'none';
    btnImportSelected.style.display = 'none';
    
    scanResultsArea.innerHTML = `
      <div class="scan-info-text">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.75rem;"></i>
        <p>${translate('scan_info_scanning')}</p>
      </div>
    `;

    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      if (!response.ok) throw new Error('Netzwerkscan fehlgeschlagen');
      
      const data = await response.json();
      
      // Fortschritt auf 100% setzen
      scanProgressBar.className = 'progress-bar-fill';
      scanProgressBar.style.width = '100%';
      
      scanStatusText.textContent = translate('scan_status_finished', { subnet: data.subnet, count: data.services.length });
      renderScanResults(data.services);
    } catch (error) {
      console.error(error);
      scanProgressBar.className = 'progress-bar-fill';
      scanProgressBar.style.width = '0%';
      scanStatusText.textContent = translate('scan_status_error');
      scanResultsArea.innerHTML = `
        <div class="scan-info-text">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--color-offline); margin-bottom: 0.75rem;"></i>
          <p>${translate('scan_status_error')}</p>
        </div>
      `;
    } finally {
      btnStartScan.disabled = false;
      btnStartScan.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> ${translate('btn_start_scan_again')}`;
    }
  }

  function renderScanResults(services) {
    scannedServices = services;
    chkSelectAll.checked = false;
    selectedCountText.textContent = '0';
    totalScannedCountText.textContent = services.length;
    btnImportSelected.disabled = true;

    if (services.length === 0) {
      scanSelectAllBar.style.display = 'none';
      btnImportSelected.style.display = 'none';
      scanResultsArea.innerHTML = `
        <div class="scan-info-text">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--text-dimmed); margin-bottom: 0.75rem;"></i>
          <p>${translate('scan_no_services')}</p>
          <span style="font-size: 0.8rem; color: var(--text-dimmed);">${translate('scan_no_services_help')}</span>
        </div>
      `;
      return;
    }

    scanSelectAllBar.style.display = 'flex';
    btnImportSelected.style.display = 'inline-flex';
    scanResultsArea.innerHTML = '';
    
    services.forEach((service, index) => {
      const row = document.createElement('div');
      row.className = 'scan-result-row';
      
      const categoryIcon = service.isDocker ? 'fa-brands fa-docker' : getCategoryIcon(service.category);
      
      row.innerHTML = `
        <label class="custom-checkbox-container">
          <input type="checkbox" class="chk-service-item" data-index="${index}">
          <span class="checkbox-checkmark"></span>
          
          <div class="scan-result-info">
            <div class="scan-result-icon" style="${service.isDocker ? 'background: rgba(6, 182, 212, 0.1); color: var(--color-accent);' : ''}">
              <i class="${service.isDocker ? 'fa-brands fa-docker' : 'fa-solid ' + categoryIcon}"></i>
            </div>
            <div class="scan-result-text">
              <div class="scan-result-title">
                ${escapeHTML(service.name)}
                ${service.isDocker ? `<span style="font-size: 0.65rem; background: rgba(6, 182, 212, 0.2); border: 1px solid rgba(6, 182, 212, 0.4); padding: 2px 6px; border-radius: 4px; color: var(--color-accent); margin-left: 5px; font-weight: 700;">DOCKER</span>` : ''}
              </div>
              <span class="scan-result-url">${escapeHTML(service.url)}</span>
            </div>
          </div>
        </label>
      `;
      
      scanResultsArea.appendChild(row);
    });

    // Checkbox Event-Listeners registrieren
    const itemCheckboxes = scanResultsArea.querySelectorAll('.chk-service-item');
    itemCheckboxes.forEach(cb => {
      cb.addEventListener('change', updateSelectionCount);
    });
  }

  function updateSelectionCount() {
    const itemCheckboxes = scanResultsArea.querySelectorAll('.chk-service-item');
    const checkedCount = Array.from(itemCheckboxes).filter(cb => cb.checked).length;
    
    selectedCountText.textContent = checkedCount;
    btnImportSelected.disabled = checkedCount === 0;
    
    // Status von "Alle auswählen" anpassen
    chkSelectAll.checked = checkedCount === itemCheckboxes.length;
  }

  // Sammelimport ausgewählter Server
  async function importSelectedServices() {
    const itemCheckboxes = scanResultsArea.querySelectorAll('.chk-service-item');
    const selectedIndices = Array.from(itemCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.getAttribute('data-index'), 10));

    if (selectedIndices.length === 0) return;

    const servicesToImport = selectedIndices.map(idx => scannedServices[idx]);

    btnImportSelected.disabled = true;
    const originalContent = btnImportSelected.innerHTML;
    btnImportSelected.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${translate('btn_import_selected_loading')}`;

    try {
      const response = await fetch('/api/servers/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ servers: servicesToImport })
      });

      if (!response.ok) throw new Error('Sammelimport fehlgeschlagen');

      const imported = await response.json();
      console.log(`Erfolgreich ${imported.length} Server importiert.`);
      
      // Liste neu laden
      await fetchServers();
      closeScanDialog();
    } catch (error) {
      alert(translate('alert_save_server_error'));
      console.error(error);
      btnImportSelected.disabled = false;
      btnImportSelected.innerHTML = originalContent;
    }
  }

  // Modal Fallback für Klick außerhalb (Light Dismiss in Safari / älteren Browsern)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    serverDialog.addEventListener('click', (event) => {
      if (event.target !== serverDialog) return;

      const rect = serverDialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isDialogContent) {
        closeDialog();
      }
    });
  }

  // Dialog-Events registrieren
  btnAddServer.addEventListener('click', openDialog);
  btnCloseDialog.addEventListener('click', closeDialog);
  btnCancelDialog.addEventListener('click', closeDialog);
  btnRefresh.addEventListener('click', triggerStatusCheck);

  // Scan-Dialog-Events registrieren
  btnScan.addEventListener('click', openScanDialog);
  btnCloseScanDialog.addEventListener('click', closeScanDialog);
  btnCancelScan.addEventListener('click', closeScanDialog);
  btnStartScan.addEventListener('click', startNetworkScan);
  btnImportSelected.addEventListener('click', importSelectedServices);

  // Settings-Dialog-Events registrieren
  btnSettings.addEventListener('click', () => openSettingsDialog('categories'));
  btnHelp.addEventListener('click', () => openSettingsDialog('help'));
  btnCloseSettingsDialog.addEventListener('click', closeSettingsDialog);
  btnCancelSettings.addEventListener('click', closeSettingsDialog);

  // Sprachauswahl-Events registrieren
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      applyLanguage(lang);
      renderServersList();
    });
  });

  // Tab-Events registrieren
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  btnTestTelegram.addEventListener('click', async () => {
    const token = telegramToken.value.trim();
    const chatId = telegramChatId.value.trim();

    if (!token || !chatId) {
      alert(translate('alert_telegram_test_empty'));
      return;
    }

    btnTestTelegram.disabled = true;
    const originalText = btnTestTelegram.innerHTML;
    btnTestTelegram.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${translate('telegram_testing_btn')}`;

    try {
      const response = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: token, chatId: chatId })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(translate('alert_telegram_test_success'));
      } else {
        alert(translate('alert_telegram_test_error', { error: result.error || 'Unknown error' }));
      }
    } catch (err) {
      alert(translate('alert_telegram_test_network_error'));
      console.error(err);
    } finally {
      btnTestTelegram.disabled = false;
      btnTestTelegram.innerHTML = originalText;
    }
  });

  // Check-All Event-Listener registrieren
  chkSelectAll.addEventListener('change', () => {
    const isChecked = chkSelectAll.checked;
    const itemCheckboxes = scanResultsArea.querySelectorAll('.chk-service-item');
    itemCheckboxes.forEach(cb => {
      cb.checked = isChecked;
    });
    updateSelectionCount();
  });

  // ==========================================================================
  // 5c. Kategorie-Einstellungen Logik (Settings Modal)
  // ==========================================================================
  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Kategorien konnten nicht geladen werden');
      categories = await response.json();
      populateCategorySelects();
    } catch (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error);
    }
  }

  function populateCategorySelects() {
    const select = document.getElementById('server-category');
    select.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  }

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        telegramEnabled.checked = !!settings.telegram?.enabled;
        telegramToken.value = settings.telegram?.botToken || '';
        telegramChatId.value = settings.telegram?.chatId || '';
      }
    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
    }
  }

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.getAttribute('data-tab') === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  async function openSettingsDialog(defaultTab = 'categories') {
    editingCategoryIndex = null;
    localCategoriesCopy = JSON.parse(JSON.stringify(categories));
    renderSettingsCategories();
    await fetchSettings();
    switchTab(defaultTab);
    settingsDialog.showModal();
  }

  function closeSettingsDialog() {
    settingsDialog.close();
  }

  function renderSettingsCategories() {
    categoriesListArea.innerHTML = '';
    
    localCategoriesCopy.forEach((cat, index) => {
      const row = document.createElement('div');
      row.className = 'category-settings-row';
      
      if (index === editingCategoryIndex) {
        // Inline-Editor rendern
        row.innerHTML = `
          <form class="category-edit-form">
            <input type="text" class="category-edit-input" id="edit-cat-name-${index}" value="${escapeHTML(cat.name)}" required autocomplete="off">
            <select class="category-edit-select" id="edit-cat-icon-${index}"></select>
            <div class="category-edit-actions">
              <button type="submit" class="btn-icon save-btn-cat" title="${translate('btn_save')}" style="color: var(--color-online);">
                <i class="fa-solid fa-check"></i>
              </button>
              <button type="button" class="btn-icon cancel-btn-cat" title="${translate('btn_cancel')}" style="color: var(--text-dimmed);">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </form>
        `;
        
        const selectEl = row.querySelector('.category-edit-select');
        populateIconSelect(selectEl, cat.icon);
        
        row.querySelector('.category-edit-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const newName = document.getElementById(`edit-cat-name-${index}`).value.trim();
          const newIcon = document.getElementById(`edit-cat-icon-${index}`).value;
          
          if (newName === '') {
            alert(translate('alert_cat_name_empty'));
            return;
          }

          const nameExists = localCategoriesCopy.some((c, idx) => idx !== index && c.name.toLowerCase() === newName.toLowerCase());
          if (nameExists) {
            alert(translate('alert_cat_exists'));
            return;
          }
          
          localCategoriesCopy[index].name = newName;
          localCategoriesCopy[index].icon = newIcon;
          editingCategoryIndex = null;
          renderSettingsCategories();
        });
        
        row.querySelector('.cancel-btn-cat').addEventListener('click', () => {
          editingCategoryIndex = null;
          renderSettingsCategories();
        });
        
      } else {
        // Normale Zeile rendern
        row.innerHTML = `
          <div class="category-settings-info">
            <div class="category-settings-icon-preview">
              <i class="fa-solid ${cat.icon}"></i>
            </div>
            <span class="category-settings-name">${escapeHTML(cat.name)}</span>
          </div>
          <div class="category-settings-actions">
            <button type="button" class="btn-icon edit-btn-cat" title="${translate('tooltip_edit')}" data-index="${index}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn-icon delete-btn-cat" title="${translate('tooltip_delete')}" data-index="${index}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        row.querySelector('.edit-btn-cat').addEventListener('click', () => {
          editingCategoryIndex = index;
          renderSettingsCategories();
        });

        row.querySelector('.delete-btn-cat').addEventListener('click', () => {
          if (confirm(translate('alert_cat_delete_confirm', { name: cat.name }))) {
            localCategoriesCopy.splice(index, 1);
            if (editingCategoryIndex === index) {
              editingCategoryIndex = null;
            } else if (editingCategoryIndex > index) {
              editingCategoryIndex--;
            }
            renderSettingsCategories();
          }
        });
      }

      categoriesListArea.appendChild(row);
    });
  }

  // Hinzufügen-Formular in den Einstellungen
  addCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = newCatNameInput.value.trim();
    const icon = newCatIconInput.value.trim() || 'fa-server';

    if (localCategoriesCopy.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert(translate('alert_cat_exists'));
      return;
    }

    localCategoriesCopy.push({
      id: `cat-${Date.now()}`,
      name,
      icon
    });

    renderSettingsCategories();
    addCategoryForm.reset();
  });

  // Einstellungen speichern
  btnSaveSettings.addEventListener('click', async () => {
    btnSaveSettings.disabled = true;
    const originalContent = btnSaveSettings.innerHTML;
    btnSaveSettings.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${translate('btn_saving')}`;

    try {
      // 1. Kategorien speichern
      const responseCat = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categories: localCategoriesCopy })
      });

      if (!responseCat.ok) throw new Error('Speichern der Kategorien fehlgeschlagen');
      categories = await responseCat.json();
      populateCategorySelects();

      // 2. Telegram-Einstellungen speichern
      const responseSettings = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram: {
            enabled: telegramEnabled.checked,
            botToken: telegramToken.value.trim(),
            chatId: telegramChatId.value.trim()
          }
        })
      });

      if (!responseSettings.ok) throw new Error('Speichern der Einstellungen fehlgeschlagen');

      renderServersList();
      closeSettingsDialog();
    } catch (error) {
      alert(translate('alert_save_settings_error', { error: error.message }));
      console.error(error);
    } finally {
      btnSaveSettings.disabled = false;
      btnSaveSettings.innerHTML = originalContent;
    }
  });

  // Fallbacks für Klick außerhalb
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    scanDialog.addEventListener('click', (event) => {
      if (event.target !== scanDialog) return;
      const rect = scanDialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) closeScanDialog();
    });

    settingsDialog.addEventListener('click', (event) => {
      if (event.target !== settingsDialog) return;
      const rect = settingsDialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) closeSettingsDialog();
    });
  }

  // ==========================================================================
  // 6. Initialisierung
  // ==========================================================================
  async function init() {
    applyLanguage(currentLang); // Sprachsteuerung anwenden
    populateIconSelect(newCatIconInput); // Befülle das Dropdown in den Einstellungen
    await fetchCategories(); // Zuerst Kategorien laden (wichtig für Formular und Kachelgruppierung)
    await fetchServers();    // Dann Server laden
  }
  
  init();

  // Polling: Alle 30 Sekunden im Hintergrund neu laden
  setInterval(async () => {
    try {
      const response = await fetch('/api/servers');
      if (response.ok) {
        const newServers = await response.json();
        
        // Prüfen, ob sich der Status eines Servers geändert hat (online <-> offline)
        let statusChanged = false;
        if (servers && servers.length > 0) {
          for (const newS of newServers) {
            const oldS = servers.find(s => s.id === newS.id);
            if (oldS && 
                oldS.status !== 'checking' && 
                newS.status !== 'checking' && 
                oldS.status !== newS.status) {
              statusChanged = true;
              break;
            }
          }
        }
        
        servers = newServers;
        renderServersList();
        
        if (statusChanged) {
          console.log('Statusänderung erkannt! Seite wird neu geladen...');
          window.location.reload();
        }
      }
    } catch (err) {
      console.warn('Hintergrund-Aktualisierung fehlgeschlagen', err);
    }
  }, 30 * 1000);
});
