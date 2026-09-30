# 📦 Script Developer Guide

How to create scripts and widgets compatible with the TriliumNext Script Manager.

> **Terminology note:** TriliumNext uses the official Trilium terms *scripts*, *custom widgets*, *launch bar widgets*, *render notes*, *backend scripts* and *themes* — there is no official "plugin" concept. This guide was previously called "Plugin Developer Guide".

---

## Two script formats

| Format | File type | MIME | Best for |
|--------|-----------|------|----------|
| **JS Frontend** | `.js` | `application/javascript;env=frontend` | Widgets, scripts, right-panel tools |
| **JSX Preact** | `.jsx` | `application/javascript;env=frontend` | Complex UI components, render notes |

Both formats are single-file, self-contained, and hosted at a public URL. No ZIP archives, no build step, no packaging.

---

## Format A: JS Frontend script

A plain JavaScript file that runs in TriliumNext's frontend context. It has access to `api` (the FrontendScriptApi) and `$container` (a jQuery element).

### Boilerplate

```javascript
// my-plugin.js
// MIME: application/javascript;env=frontend

const $root = $container;

$root.html(`
  <style>
    .my-plugin { padding: 16px; }
  </style>
  <div class="my-plugin">
    <h2>My Plugin</h2>
    <button id="my-btn">Click me</button>
  </div>
`);

// jQuery event delegation
$root.on('click', '#my-btn', () => {
  alert('Hello from my plugin!');
});

// Access Trilium API directly
async function init() {
  const notes = await api.searchForNotes('#myLabel');
  console.log('Found notes:', notes.length);
}

init();
```

### Key rules

1. **Self-contained** — all HTML, CSS, and JS in one file
2. **Use `$container`** as the root element for your HTML
3. **Use `api` directly** — it's injected as a global variable (no `window.parent.api`)
4. **Event delegation** — use `$root.on('click', '.selector', handler)` instead of inline `onclick`
5. **No external dependencies** — you can load CDN scripts, but prefer to keep it self-contained

### When to use this format

- Simple UI widgets (word counter, timer, status panel)
- Scripts that run on note open (auto-format, spell check)
- Tools that interact with the note tree

---

## Format B: JSX Preact script

A Preact component written in JSX. TriliumNext renders it as a React/Preact component inside the note.

### Boilerplate

```jsx
// my-plugin.jsx
// MIME: application/javascript;env=frontend
// ~renderNote target (add this relation to use as a render note)

import { useEffect, useState } from "trilium:preact";
import { runOnBackend, activateNote } from "trilium:api";

function MyPlugin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await runOnBackend(() => {
          // Backend code — synchronous, no await inside here
          const note = api.getNoteWithLabel('myLabel');
          return note ? note.getContent() : null;
        }, []);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>My Plugin</h2>
      <p>Data: {data}</p>
    </div>
  );
}

export default MyPlugin;
```

### Key rules

1. **Import from `"trilium:preact"`** for Preact hooks
2. **Import from `"trilium:api"`** for `runOnBackend`, `runAsyncOnBackendWithManualTransactionHandling`, `activateNote`, etc.
3. **Export default** your component — TriliumNext renders it
4. **Backend callbacks must be synchronous** — use `runOnBackend` for synchronous code. For async backend code, use `runAsyncOnBackendWithManualTransactionHandling`
5. **Avoid inline `onclick`** — use Preact's `onClick` handler

### When to use this format

- Full-page UI components (planner boards, dashboards)
- Complex interactive tools
- Any script that benefits from React/Preact state management

---

## Publishing your script

### 1. Host the source file

Upload your `.js` or `.jsx` file to a public URL. GitHub is recommended:

```
https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/path/to/plugin.jsx
```

> **Important:** Use the **Raw** URL — the Plugin Manager downloads the raw source code, not a web page.

### 2. Add your script to a registry

Create or update a `registry.json` with your plugin entry:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "What your script does.",
  "tags": ["tool", "productivity"],
  "sourceUrl": "https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/plugin.jsx"
}
```

### 3. Host the registry

Options:
- **GitHub Gist** → create a secret Gist with `registry.json`, copy the **Raw** URL
- **Your own server** → serve the JSON at any public URL
- **Local only** → paste the JSON directly into the `#pluginRegistry` note

### 4. Share your registry URL

Users add your registry URL as `#registryUrl` on their `plugin-registry` note.

---

## Registry field reference

```json
{
  "plugins": [
    {
      "id": "unique-id",
      "name": "Display Name",
      "version": "1.0.0",
      "author": "Author Name",
      "description": "Short description shown on the card.",
      "tags": ["tag1", "tag2"],
      "sourceUrl": "https://raw.githubusercontent.com/.../plugin.jsx",
      "labels": [ { "name": "widget" }, { "name": "readOnly" } ],
      "zipUrl": "https://github.com/.../archive.zip"
    }
  ]
}
```

| Field | Required | Description |
|-------|:--------:|-------------|
| `id` | ✅ | Unique identifier. Used to track installed version. |
| `name` | ✅ | Display name shown on the script card. |
| `version` | ✅ | Semver string. Compared against installed `#pluginVersion`. |
| `author` | | Shown on the card. |
| `description` | | Short text shown below the name. |
| `tags` | | Array of tag strings shown as pills. |
| `homepage` | | URL to docs or repository — shows a "How to" button on the card |
| `sourceUrl` | | Raw URL to the `.js`/`.jsx` source. |
| `labels` | | Array of `{ "name", "value" }` applied to the created note in the single-file flow — e.g. `widget`, `readOnly`. |
| `manifestUrl` | | Raw URL to a `manifest.json` for multi-note plugins. |
| `zipUrl` | | Legacy fallback. URL to a Trilium export ZIP. |

At least one of `sourceUrl`, `manifestUrl` or `zipUrl` is required.

---

## Multi-note scripts with `manifestUrl`

For scripts that need more than one note (e.g., a render note + widget + config), use a `manifest.json` file.

### File structure

```
my-plugin/
├── manifest.json
├── widget.js
└── handler.js
```

### Manifest format

```json
{
  "notes": [
    {
      "title": "My Plugin",
      "type": "text",
      "content": "Open this note to use My Plugin.",
      "children": [
        {
          "title": "My Plugin Widget",
          "type": "code",
          "mime": "application/javascript;env=frontend",
          "sourceUrl": "widget.js"
        },
        {
          "title": "My Plugin Handler",
          "type": "code",
          "mime": "application/javascript;env=backend",
          "sourceUrl": "handler.js"
        },
        {
          "title": "My Plugin Config",
          "type": "text",
          "content": "Configure the plugin here."
        }
      ]
    }
  ],
  "relations": [
    { "type": "renderNote", "from": "My Plugin", "to": "My Plugin Widget" }
  ],
  "labels": [
    { "note": "My Plugin Widget", "name": "widget", "value": "" },
    { "note": "My Plugin Widget", "name": "readOnly", "value": "" },
    { "note": "My Plugin Handler", "name": "customRequestHandler", "value": "my-plugin-endpoint" }
  ]
}
```

### Note definition

| Field | Required | Description |
|-------|:--------:|-------------|
| `title` | ✅ | Note title |
| `type` | | Note type: `text`, `code` (default: `text`) |
| `mime` | | MIME type (required if `type: "code"`) |
| `content` | | Static text content |
| `sourceUrl` | | URL to download source (relative to the manifest) |
| `children` | | Recursive array of note definitions — the note is created as a **parent** and the children are created inside it (real tree, e.g. render note → code/config notes) |

### Hosting

Upload the manifest and all source files to a public folder. The `manifestUrl` in the registry is the raw URL to `manifest.json`. Source URLs are resolved relative to the manifest:

| Manifest URL | Source URL | Resolves to |
|---|---|---|
| `https://raw.githubusercontent.com/user/repo/main/plugin/manifest.json` | `widget.js` | `https://raw.githubusercontent.com/user/repo/main/plugin/widget.js` |

---

## Manifest Generator

Use o **[Manifest Generator](./MANIFEST_GENERATOR.md)** para criar o `manifest.json` do seu script preenchendo um formulario simples. O prompt pode ser colado em um chat de IA (Claude, ChatGPT) ou usado como checklist manual.

---

## Best practices

1. **One file, one plugin** — keep the entire plugin in a single `.js` or `.jsx` file
2. **Self-contained** — no external dependencies beyond what TriliumNext provides
3. **Clean up on uninstall** — use labels to mark your notes so the Plugin Manager can find them
4. **Version your releases** — use git tags and meaningful semver
5. **Test with both light and dark themes** — use Trilium's CSS variables (`var(--main-text-color)`, etc.)
6. **Handle errors** — backend callbacks should wrap errors in `try/catch` so the frontend can display them
7. **No ETAPI calls from backend** — calling the HTTP API from inside a backend callback causes a SQLite deadlock

---

## FAQ

### Why not just use ZIP exports?

ZIP exports require importing via ETAPI, which needs an API token and causes a SQLite deadlock when called from inside a backend callback. The `sourceUrl` approach avoids all of this by creating a code note directly.

### Can my script use the ETAPI?

ETAPI is available from the **frontend** (browser context) since it runs on the same origin. From the backend, use `api` methods instead.

### How do I add settings to my script?

Create a config note using `api.createNewNote()` in your init code. Use labels like `#pluginConfig` to mark it. The user can edit it like any other note.

### How do I provide a custom render UI?

For JSX plugins, export a default Preact component and add a `~renderNote` relation pointing to the target note. TriliumNext will render your component there.

For JS plugins, use `$container` to build your UI directly.

### Can I have multiple files?

Yes. Use the `manifestUrl` format — create a `manifest.json` that lists each note with its own `sourceUrl`. The Plugin Manager creates all notes and applies labels and relations automatically.

If you need dynamic notes (created at runtime), use `api.createNewNote()` in your script's init code.
