// ════════════════════════════════════════════════════════════════
//  TriliumNext Plugin Manager — Render Note (JS Frontend)
// ════════════════════════════════════════════════════════════════
//  Modo de usar:
//    1. Crie uma nota do tipo "Code" com MIME "application/javascript;env=frontend"
//    2. Cole este código
//    3. Adicione ~renderNote apontando para a nota onde quer exibir o painel
//    4. Abra a nota de destino (ou a nota Render, se for nota separada)
// ════════════════════════════════════════════════════════════════

const $root = $container;

// CSS próprio do manager, injetado no <head> — imune a sanitização de render
// notes e a temas sem regras de card (ex.: instâncias sem o tema Folio).
const PM_CSS = `
  /* ── Variáveis: herda o tema do Trilium, com fallbacks ── */
#pm-root {
    --bg:       var(--main-background-color,   #16161e);
    --surface:  var(--accented-background-color, #1f1f2e);
    --border:   var(--main-border-color,         #2e2e42);
    --text:     var(--main-text-color,           #c0caf5);
    --muted:    var(--muted-text-color,          #565f89);
    --accent:   #7aa2f7;
    --green:    #9ece6a;
    --red:      #f7768e;
    --yellow:   #e0af68;
    --r:        8px;
    --mono:     'JetBrains Mono', 'Fira Mono', monospace;
  }

#pm-root *, #pm-root *::before, #pm-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

#pm-root {
    font-family: var(--font-family, 'Segoe UI', system-ui, sans-serif);
    background: transparent;
    color: var(--text);
    padding: 20px 24px 40px;
    font-size: 14px;
  }

  /* ── Header ── */
#pm-root .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
  }
#pm-root .header-left h1 {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
#pm-root .header-left p {
    color: var(--muted);
    font-size: 0.8rem;
    margin-top: 3px;
  }
#pm-root .btn-refresh {
    padding: 5px 12px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--r);
    color: var(--muted);
    font-size: 0.8rem;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
#pm-root .btn-refresh:hover { color: var(--text); border-color: var(--accent); }

  /* ── Config banner ── */
#pm-root .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--r);
    margin-bottom: 20px;
    font-size: 0.82rem;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    transition: all 0.2s;
  }
#pm-root .banner.ok { border-color: var(--green); color: var(--green); }
#pm-root .banner.warn { border-color: var(--yellow); color: var(--yellow); }
#pm-root .banner.error { border-color: var(--red);   color: var(--red); }
#pm-root .banner .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* ── Grid de cards ── */
#pm-root .cat-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
#pm-root .cat-pill {
    padding: 4px 12px;
    border-radius: 99px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-size: 0.78rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
#pm-root .cat-pill:hover { border-color: var(--accent); color: var(--text); }
#pm-root .cat-pill.active { border-color: var(--accent); background: var(--accent); color: #16161e; font-weight: 600; }

#pm-root .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 14px;
  }

#pm-root .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.15s, transform 0.1s;
  }
#pm-root .card:hover { border-color: var(--accent); transform: translateY(-1px); }
#pm-root .card.is-installed { border-color: var(--green); }

#pm-root .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
#pm-root .card-name {
    font-weight: 600;
    font-size: 0.95rem;
  }
#pm-root .card-version {
    font-family: var(--mono);
    font-size: 0.72rem;
    color: var(--muted);
    background: var(--bg);
    padding: 2px 8px;
    border-radius: 99px;
    white-space: nowrap;
    border: 1px solid var(--border);
  }
#pm-root .card-author {
    font-size: 0.78rem;
    color: var(--muted);
  }
#pm-root .card-desc {
    font-size: 0.85rem;
    line-height: 1.55;
    color: var(--text);
    flex-grow: 1;
  }
#pm-root .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
#pm-root .tag {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 99px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--muted);
  }
#pm-root .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }
#pm-root .badge-ok {
    font-size: 0.75rem;
    color: var(--green);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ── Botões ── */
#pm-root .btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: none;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
#pm-root .btn:hover:not(:disabled) { opacity: 0.85; transform: scale(0.98); }
#pm-root .btn:disabled { opacity: 0.45; cursor: not-allowed; }

#pm-root .btn-install {
    background: var(--accent);
    color: #16161e;
  }
#pm-root .btn-reinstall {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.75rem;
  }
#pm-root .btn-reinstall:hover { border-color: var(--accent); color: var(--accent); }
#pm-root .btn-download {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--muted);
  }
#pm-root .btn-download:hover { border-color: var(--accent); color: var(--accent); }
#pm-root .btn-howto {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.75rem;
    padding: 4px 8px;
    float: left;
  }
#pm-root .btn-howto:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Estados ── */
#pm-root .state-center {
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
  }
#pm-root .state-center .icon { font-size: 2rem; margin-bottom: 12px; }
#pm-root .state-center p { font-size: 0.85rem; line-height: 1.6; }
#pm-root .state-center code {
    font-family: var(--mono);
    background: var(--surface);
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid var(--border);
    color: var(--yellow);
  }

  /* ── Toast ── */
#pm-root .toast {
    position: fixed;
    bottom: 18px; right: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 10px 16px;
    font-size: 0.82rem;
    z-index: 9999;
    max-width: 280px;
    animation: toastIn 0.2s cubic-bezier(.22,1,.36,1);
  }
#pm-root .toast.ok { border-color: var(--green); color: var(--green); }
#pm-root .toast.error { border-color: var(--red);   color: var(--red); }
  @keyframes toastIn {
#pm-root from { transform: translateY(14px); opacity: 0; }
#pm-root to { transform: translateY(0);    opacity: 1; }
  }

  /* ── Source pill (remote/local) ── */
#pm-root .source-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    font-size: 0.78rem;
    color: var(--muted);
  }
#pm-root .source-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 10px;
    border-radius: 99px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-family: var(--mono);
    font-size: 0.72rem;
    color: var(--muted);
  }
#pm-root .source-pill.remote { border-color: var(--accent); color: var(--accent); }
#pm-root .source-pill.local { border-color: var(--yellow); color: var(--yellow); }
#pm-root .source-pill.error { border-color: var(--red);    color: var(--red); }
#pm-root .source-pill .icon-s { font-style: normal; }

#pm-root .badge-update {
    font-size: 0.75rem;
    color: var(--yellow);
    display: flex;
    align-items: center;
    gap: 5px;
  }
#pm-root .btn-update {
    background: var(--yellow);
    color: #16161e;
    font-size: 0.82rem;
  }
#pm-root .card.has-update { border-color: var(--yellow); }

#pm-root .btn-uninstall {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--red);
    font-size: 0.75rem;
    padding: 6px 10px;
  }
#pm-root .btn-uninstall:hover { border-color: var(--red); background: color-mix(in srgb, var(--red) 10%, transparent); }

  /* ── Spinner inline ── */
#pm-root .spinner {
    display: inline-block;
    width: 10px; height: 10px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 4px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

try {
  if (typeof document !== 'undefined') {
    const pmStyle = document.createElement('style');
    pmStyle.id = 'pm-manager-css';
    pmStyle.textContent = PM_CSS;
    document.head.appendChild(pmStyle);
  }
} catch (e) { console.warn('[PluginManager] css inject failed:', e); }

$root.html(`


<div id="pm-root" class="pm-container">

<div class="header">
  <div class="header-left">
    <h1>🧩 Plugin Manager</h1>
    <p>Gerencie plugins do TriliumNext</p>
  </div>
  <button class="btn-refresh">↻ Atualizar</button>
</div>

<div id="banner" class="banner">
  <div class="dot"></div>
  <span>Inicializando...</span>
</div>

<div id="source-bar" class="source-bar" style="display:none">
  <span>Registry:</span>
  <span id="source-pill" class="source-pill"></span>
  <span id="source-ts"></span>
</div>

<div id="content">
  <div class="state-center"><div class="icon">⏳</div><p>Carregando registry...</p></div>
</div>

</div>
`);

// ════════════════════════════════════════════════════════════════
//  CONFIG — atributos (labels) necessários no Trilium:
//
//  Na nota com #pluginRegistry:
//    #etapiToken    → token gerado em Options > ETAPI  (opcional — só necessário se o registry usar zipUrl)
//    #triliumPort   → porta do Trilium (padrão: 37840) (opcional)
//    #registryUrl   → URL remota do JSON do registry   (opcional)
//                     ex: https://gist.githubusercontent.com/user/id/raw/registry.json
//                     Se ausente, usa o conteúdo local da nota como fallback.
//
//  Notas com esses atributos:
//    #installedPlugins  → nota "Installed" (recebe os imports de ZIP)
//    #pluginRegistry    → nota com JSON local + labels de config
// ════════════════════════════════════════════════════════════════

let CFG = {};
let installedMap = new Map();
let pluginsMap = {};
let activeCategory = 'all';
let allPlugins = [];

const CATEGORIES = [
  { id: 'all',      label: 'Todos' },
  { id: 'widget',   label: 'Widget',   match: ['widget', 'pomodoro', 'timer', 'word', 'counter', 'ai', 'chat', 'openrouter'] },
  { id: 'canvas',   label: 'Canvas',   match: ['canvas', 'excalidraw', 'visual', 'templates'] },
  { id: 'writing',  label: 'Escrita',  match: ['writing', 'screenplay', 'comics', 'render', 'export', 'longform'] },
  { id: 'ui',       label: 'UI',       match: ['kanban', 'planning', 'board', 'productivity'] },
  { id: 'tools',    label: 'Ferramentas', match: ['notes', 'cleaner', 'attribute', 'share', 'comment', 'network'] },
];

// ── INIT ─────────────────────────────────────────────────────────
async function init() {
  setBanner('Conectando ao backend...', '');
  setContent('<div class="state-center"><div class="icon">⏳</div><p>Carregando...</p></div>');
  $root.find('#source-bar').hide();

  try {
    const data = await api.runAsyncOnBackendWithManualTransactionHandling(async () => {
      const registryNote  = api.getNoteWithLabel('pluginRegistry');
      const installedNote = api.getNoteWithLabel('installedPlugins');

      if (!registryNote)  throw new Error('Nota com #pluginRegistry não encontrada.');
      if (!installedNote) throw new Error('Nota com #installedPlugins não encontrada.');

      const etapiToken  = registryNote.getAttribute('label', 'etapiToken')?.value;
      const port        = parseInt(registryNote.getAttribute('label', 'triliumPort')?.value || '0') || 37840;
      const registryUrl = registryNote.getAttribute('label', 'registryUrl')?.value || null;

      // Plugins já instalados — retorna { id → version }
      const installedChildren = await installedNote.getChildNotes();
      const installedVersions = {};
      for (const n of installedChildren) {
        const id  = n.getAttribute('label', 'pluginId')?.value;
        const ver = n.getAttribute('label', 'pluginVersion')?.value || '0.0.0';
        if (id) installedVersions[id] = ver;
      }

      // ── Fetch do registry: remoto com fallback local ──────────
      let registryContent = null;
      let source          = 'local';    // 'remote' | 'local' | 'fallback'
      let fetchError      = null;
      let fetchedAt       = new Date().toISOString();

      if (registryUrl) {
        try {
          const resp = await fetch(registryUrl, {
            headers: { 'Cache-Control': 'no-cache' }   // sempre busca versão fresca
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          registryContent = await resp.text();
          source = 'remote';
        } catch (err) {
          fetchError = err.message;
          source = 'fallback';
          // cai no conteúdo local abaixo
        }
      }

      if (!registryContent) {
        registryContent = await registryNote.getContent();
        if (source !== 'fallback') source = 'local';
      }

      return {
        etapiToken,
        port,
        registryUrl,
        installedNoteId: installedNote.noteId,
        installedVersions,
        registry: registryContent,
        source,
        fetchError,
        fetchedAt,
        serverOrigin: registryNote.getAttribute('label', 'serverOrigin')?.value || null
      };
    }, []);

    CFG = {
      etapiToken:      data.etapiToken,
      port:            data.port,
      installedNoteId: data.installedNoteId,
      serverOrigin:    data.serverOrigin || window.location.origin
    };
    installedMap = new Map(Object.entries(data.installedVersions));

    // Valida token (opcional — só necessário para registry com zipUrl)
    if (!CFG.etapiToken) {
      setBanner('Token ETAPI não configurado. Instalação via sourceUrl funciona sem ele, mas plugins zipUrl exigem token em Options > ETAPI.', 'warn');
    }

    // Parse plugins para contar updates antes do banner
    let plugins = [];
    try { plugins = JSON.parse(data.registry).plugins || []; }
    catch { setBanner('Erro ao parsear o JSON do registry.', 'error'); return; }

    const updateCount = plugins.filter(p =>
      installedMap.has(p.id) && semverGt(p.version, installedMap.get(p.id))
    ).length;

    const updateNote = updateCount > 0 ? ` · 🔔 ${updateCount} update(s) disponível(is)` : '';
    setBanner(
      `Conectado · porta ${CFG.port} · ${installedMap.size} plugin(s) instalado(s)${updateNote}`,
      updateCount > 0 ? 'warn' : 'ok'
    );

    setSourcePill(data.source, data.registryUrl, data.fetchedAt, data.fetchError);
    allPlugins = plugins;
    activeCategory = 'all';
    renderCategoryBar();
    renderPlugins(plugins);

  } catch (err) {
    setBanner('Erro: ' + err.message, 'error');
    setContent('<div class="state-center"><div class="icon">⚠</div><p>' + escHtml(err.message) + '</p></div>');
    console.error('[PluginManager]', err);
  }
}

// ── SOURCE PILL ──────────────────────────────────────────────────
function setSourcePill(source, url, fetchedAt, fetchError) {
  const bar  = $root.find('#source-bar');
  const pill = $root.find('#source-pill');
  const ts   = $root.find('#source-ts');

  const labels = {
    remote:   { icon: '🌐', text: url ? shortenUrl(url) : 'remoto',    cls: 'remote' },
    local:    { icon: '📄', text: 'nota local',                         cls: 'local'  },
    fallback: { icon: '⚠', text: 'fallback local (fetch falhou)',       cls: 'error'  }
  };
  const cfg = labels[source] || labels.local;

  pill.attr('class', 'source-pill ' + cfg.cls);
  pill.html('<i class="icon-s">' + cfg.icon + '</i> ' + escHtml(cfg.text));

  const d = new Date(fetchedAt);
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  ts.text('· atualizado às ' + hm + (fetchError ? ' · erro: ' + fetchError : ''));

  bar.css('display', 'flex');
}

function shortenUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 30 ? u.pathname.slice(0, 28) + '…' : u.pathname;
    return u.hostname + path;
  } catch { return url.slice(0, 40) + '…'; }
}

// ── RENDER ───────────────────────────────────────────────────────
function getPluginCategory(p) {
  const tags = (p.tags || []).map(t => t.toLowerCase());
  for (const cat of CATEGORIES) {
    if (cat.id === 'all') continue;
    if (tags.some(t => cat.match.includes(t))) return cat.id;
  }
  return 'other';
}

function renderCategoryBar() {
  if (!allPlugins.length) { $root.find('#cat-bar').remove(); return; }
  let html = '<div id="cat-bar" class="cat-bar">';
  for (const cat of CATEGORIES) {
    const count = cat.id === 'all'
      ? allPlugins.length
      : allPlugins.filter(p => getPluginCategory(p) === cat.id).length;
    if (count === 0 && cat.id !== 'all') continue;
    const active = cat.id === activeCategory ? ' active' : '';
    html += `<button class="cat-pill${active}" data-cat="${cat.id}">${cat.label} (${count})</button>`;
  }
  html += '</div>';
  const existing = $root.find('#cat-bar');
  if (existing.length) existing.replaceWith(html); else $root.find('#source-bar').after(html);
}

function filterByCategory(plugins) {
  if (activeCategory === 'all') return plugins;
  return plugins.filter(p => getPluginCategory(p) === activeCategory);
}

function renderPlugins(plugins) {
  pluginsMap = {};
  for (const p of plugins) pluginsMap[p.id] = p;
  const filtered = filterByCategory(plugins);
  if (!filtered.length) {
    setContent(`<div class="state-center">
      <div class="icon">📭</div>
      <p>Nenhum plugin nesta categoria.<br>
      ${activeCategory !== 'all' ? 'Tente outra categoria.' : 'Edite a nota <code>#pluginRegistry</code> para adicionar plugins.'}</p>
    </div>`);
    return;
  }
  setContent('<div class="grid">' + filtered.map(p => cardHTML(p)).join('') + '</div>');
}

function cardHTML(p) {
  const installedVer = installedMap.get(p.id);
  const isInstalled  = installedVer !== undefined;
  const hasUpdate    = isInstalled && semverGt(p.version, installedVer);
  const hasSourceUrl = !!p.sourceUrl || !!p.manifestUrl;
  const btnLabel     = hasSourceUrl ? 'Instalar' : 'Baixar ZIP';
  const btnClass     = hasSourceUrl ? 'btn-install' : 'btn-download';

  const tagsHtml = (p.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('');
  const hasHowto = !!p.homepage;

  let howtoHtml = hasHowto
    ? `<button class="btn btn-howto" data-plugin-id="${escHtml(p.id)}">📖 How to</button>`
    : '';

  let cardClass  = 'card';
  let footerHtml = '';

  if (!isInstalled) {
    cardClass  = 'card';
    footerHtml = `${howtoHtml}
      <span></span>
      <button class="btn ${btnClass}" data-plugin-id="${escHtml(p.id)}">${btnLabel}</button>`;
  } else if (hasUpdate) {
    cardClass  = 'card has-update';
    footerHtml = `${howtoHtml}
      <span class="badge-update">↑ v${escHtml(installedVer)} → v${escHtml(p.version)}</span>
      <div style="display:flex;gap:6px">
        <button class="btn ${btnClass}" data-plugin-id="${escHtml(p.id)}">${btnLabel}</button>
        <button class="btn btn-uninstall" data-plugin-id="${escHtml(p.id)}">✕</button>
      </div>`;
  } else {
    cardClass  = 'card is-installed';
    footerHtml = `${howtoHtml}
      <span class="badge-ok">✓ v${escHtml(installedVer)}</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-reinstall" data-plugin-id="${escHtml(p.id)}">↺</button>
        <button class="btn btn-uninstall" data-plugin-id="${escHtml(p.id)}">✕</button>
      </div>`;
  }

  return `
    <div class="${cardClass}" id="card-${p.id}">
      <div class="card-top">
        <div class="card-name">${escHtml(p.name)}</div>
        <div class="card-version">v${escHtml(p.version)}</div>
      </div>
      <div class="card-author">por ${escHtml(p.author || '—')}</div>
      <div class="card-desc">${escHtml(p.description || '')}</div>
      ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
      <div class="card-footer">${footerHtml}</div>
    </div>`;
}

// ── HELPER: httpGet (reusable) ──────────────────────────────────
// Nota: esta função é definida dentro dos callbacks backend,
// mas precisamos dela em múltiplos lugares. Vamos manter inline.

// ── INSTALL ──────────────────────────────────────────────────────
async function installPlugin(p, btn) {
  if (!btn) btn = $root.find(`[data-plugin-id="${p.id}"]`).first();
  if (btn.length) { btn.prop('disabled', true); btn.html('<span class="spinner"></span>Instalando...'); }

  try {
    if (p.manifestUrl) {
      // ── Fluxo manifestUrl: baixa manifest + cria múltiplas notas ──
      btn.html('<span class="spinner"></span>Instalando...');
      const result = await api.runAsyncOnBackendWithManualTransactionHandling(
        async (manifestUrl, parentNoteId, pluginId, pluginVersion, pluginName) => {
          function httpGet(url, depth) {
            // fetch é o caminho permitido no sandbox de scripts (0.105+ bloqueia require('https'))
            if ((depth || 0) > 5) return Promise.reject(new Error('Muitos redirects'));
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 30000);
            return fetch(url, { redirect: 'follow', signal: controller.signal })
              .then((res) => {
                if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
                return res.text();
              })
              .catch((e) => {
                if (e && e.name === 'AbortError') throw new Error('Timeout (30s)');
                throw e;
              })
              .finally(() => clearTimeout(timer));
          }

          // 1. Baixa o manifest
          const manifestRaw = await httpGet(manifestUrl);
          let manifest;
          try { manifest = JSON.parse(manifestRaw.toString('utf-8')); }
          catch (e) { throw new Error('Manifest inválido: ' + e.message); }

          if (!manifest.notes || !manifest.notes.length) throw new Error('Manifest sem notas');

          const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/') + 1);
          const noteMap = {};

          // 2. Cria cada nota do manifest
          for (const def of manifest.notes) {
            let content = def.content || '';
            if (def.sourceUrl) {
              const srcUrl = def.sourceUrl.match(/^https?:\/\//) ? def.sourceUrl : baseUrl + def.sourceUrl;
              const srcBuf = await httpGet(srcUrl);
              content = srcBuf.toString('utf-8');
            }
            const created = await api.createNewNote({
              parentNoteId,
              title: def.title,
              content,
              type: def.type || 'text',
              mime: def.mime || undefined
            });
            noteMap[def.title] = created.note.noteId;
          }

          // 3. Aplica labels do manifest
          if (manifest.labels) {
            for (const lbl of manifest.labels) {
              const noteId = noteMap[lbl.note];
              if (!noteId) continue;
              const note = api.getNote(noteId);
              if (note) {
                await note.setAttribute('label', lbl.name, lbl.value || '');
              }
            }
          }

          // 4. Cria relations do manifest
          if (manifest.relations) {
            for (const rel of manifest.relations) {
              const fromId = noteMap[rel.from];
              const toId = noteMap[rel.to];
              if (fromId && toId) {
                const fromNote = api.getNote(fromId);
                if (fromNote) {
                  fromNote.setRelation(rel.type, toId);
                }
              }
            }
          }

          // 5. Marca a primeira nota com os metadados do plugin
          const firstTitle = manifest.notes[0].title;
          const firstNote = api.getNote(noteMap[firstTitle]);
          if (firstNote) {
            await firstNote.setAttribute('label', 'pluginId',      pluginId);
            await firstNote.setAttribute('label', 'pluginVersion', pluginVersion);
            await firstNote.setAttribute('label', 'pluginName',    pluginName);
          }

          return { noteId: noteMap[firstTitle] };
        },
        [p.manifestUrl, CFG.installedNoteId, p.id, p.version, p.name]
      );

      installedMap.set(p.id, p.version);
      showToast(`✓ ${p.name} v${p.version} instalado!`, 'ok');

    } else if (p.sourceUrl) {
      // ── Fluxo sourceUrl: baixa o .js/.jsx e cria nota code diretamente ──
      btn.html('<span class="spinner"></span>Baixando...');
      const result = await api.runAsyncOnBackendWithManualTransactionHandling(
        async (sourceUrl, parentNoteId, pluginId, pluginVersion, pluginName, labels) => {
          function httpGet(url, depth) {
            // fetch é o caminho permitido no sandbox de scripts (0.105+ bloqueia require('https'))
            if ((depth || 0) > 5) return Promise.reject(new Error('Muitos redirects'));
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 30000);
            return fetch(url, { redirect: 'follow', signal: controller.signal })
              .then((res) => {
                if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
                return res.text();
              })
              .catch((e) => {
                if (e && e.name === 'AbortError') throw new Error('Timeout (30s)');
                throw e;
              })
              .finally(() => clearTimeout(timer));
          }
          const buf = await httpGet(sourceUrl);
          if (!buf.length) throw new Error('Source vazio: ' + sourceUrl);
          const source = buf.toString('utf-8');

          const created = await api.createNewNote({
            parentNoteId,
            title: pluginName,
            content: source,
            type: 'code',
            mime: 'application/javascript;env=frontend'
          });
          const note = created.note;
          await note.setAttribute('label', 'pluginId',      pluginId);
          await note.setAttribute('label', 'pluginVersion', pluginVersion);
          await note.setAttribute('label', 'pluginName',    pluginName);
          if (Array.isArray(labels)) {
            for (const l of labels) {
              if (l && l.name) await note.setAttribute('label', l.name, l.value || '');
            }
          }
          return { noteId: note.noteId };
        },
        [p.sourceUrl, CFG.installedNoteId, p.id, p.version, p.name, p.labels || null]
      );

      installedMap.set(p.id, p.version);
      showToast(`✓ ${p.name} v${p.version} instalado!`, 'ok');

    } else if (p.zipUrl) {
      // ── Fluxo zipUrl: download do ZIP para o usuário instalar manualmente ──
      const a = document.createElement('a');
      a.href = p.zipUrl;
      a.download = (p.name || 'plugin') + '.zip';
      a.target = '_blank';
      a.rel = 'noopener';
      a.click();
      showToast(`📥 ${p.name} — ZIP baixado. Importe manualmente em Options > Import`, 'ok');
      if (btn.length) { btn.prop('disabled', false); btn.text('Baixar'); }
      return;

    } else {
      throw new Error('Plugin sem manifestUrl, sourceUrl ou zipUrl');
    }

    // Atualiza o card para estado "instalado"
    const card = $root.find('#card-' + p.id);
    if (card.length) {
      card.attr('class', 'card is-installed');
      card.find('.card-footer').html(
        `<span class="badge-ok">✓ v${escHtml(p.version)}</span>
         <div style="display:flex;gap:6px">
           <button class="btn btn-reinstall" data-plugin-id="${escHtml(p.id)}">↺</button>
           <button class="btn btn-uninstall" data-plugin-id="${escHtml(p.id)}">✕</button>
         </div>`
      );
    }

  } catch (err) {
    showToast(`✗ ${p.name}: ${err.message || err || 'Erro desconhecido'}`, 'error');
    if (btn.length) { btn.prop('disabled', false); btn.text('Instalar'); }
    console.error('[PluginManager] install error:', err);
  }
}

// ── UNINSTALL ────────────────────────────────────────────────────
async function uninstallPlugin(p, btn) {
  if (!btn) btn = $root.find(`[data-plugin-id="${p.id}"]`).first();
  if (btn.length) { btn.prop('disabled', true); btn.html('<span class="spinner"></span>'); }

  try {
    await api.runAsyncOnBackendWithManualTransactionHandling(async (installedNoteId, pluginId) => {
      try {
        const installedNote   = await api.getNote(installedNoteId);
        const children = await installedNote.getChildNotes();
        const target   = children.find(n => n.getAttribute('label', 'pluginId')?.value === pluginId);
        if (!target) throw new Error(`Nota do plugin "${pluginId}" não encontrada em Installed.`);
        await target.delete();
      } catch (err) {
        console.error('[PluginManager] backend uninstall err:', err);
        throw new Error(String(err?.message || err || 'Erro desconhecido no backend'));
      }
    }, [CFG.installedNoteId, p.id]);

    installedMap.delete(p.id);
    showToast(`🗑 ${p.name} removido.`, 'ok');

    // Volta o card ao estado "não instalado"
    const card = $root.find('#card-' + p.id);
    if (card.length) {
      const hasSrc = !!p.sourceUrl || !!p.manifestUrl;
      card.attr('class', 'card');
      card.find('.card-footer').html(
        `<span></span>
         <button class="btn ${hasSrc ? 'btn-install' : 'btn-download'}" data-plugin-id="${escHtml(p.id)}">${hasSrc ? 'Instalar' : 'Baixar ZIP'}</button>`
      );
    }

  } catch (err) {
    showToast(`✗ ${err.message || err || 'Erro desconhecido'}`, 'error');
    if (btn.length) { btn.prop('disabled', false); btn.text('✕'); }
    console.error('[PluginManager] uninstall error:', err);
  }
}

// ── UTILS ────────────────────────────────────────────────────────
function semverGt(a, b) {
  const parse = v => String(v || '0').split('.').map(n => parseInt(n) || 0);
  const [a1, a2, a3] = parse(a);
  const [b1, b2, b3] = parse(b);
  if (a1 !== b1) return a1 > b1;
  if (a2 !== b2) return a2 > b2;
  return a3 > b3;
}

function setBanner(msg, type) {
  const el = $root.find('#banner');
  el.attr('class', 'banner ' + (type || ''));
  el.html('<div class="dot"></div><span>' + escHtml(msg) + '</span>');
}

function setContent(html) {
  $root.find('#content').html(html);
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type) {
  const t = Object.assign(document.createElement('div'), {
    className: 'toast ' + type,
    textContent: msg
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ── EVENT DELEGATION ─────────────────────────────────────────────
$root.find('.btn-refresh').on('click', init);

$root.on('click', '.btn-install, .btn-update, .btn-reinstall, .btn-download', function(e) {
  const $btn = $(this);
  const p = pluginsMap[$btn.data('plugin-id')];
  if (p) installPlugin(p, $btn);
});

$root.on('click', '.btn-uninstall', function(e) {
  const $btn = $(this);
  const p = pluginsMap[$btn.data('plugin-id')];
  if (p) uninstallPlugin(p, $btn);
});

$root.on('click', '.btn-howto', function(e) {
  e.preventDefault();
  const p = pluginsMap[$(this).data('plugin-id')];
  if (p && p.homepage) window.open(p.homepage, '_blank', 'noopener');
});

$root.on('click', '.cat-pill', function(e) {
  activeCategory = $(this).data('cat');
  renderCategoryBar();
  renderPlugins(allPlugins);
});

// ── START ─────────────────────────────────────────────────────────
init();
