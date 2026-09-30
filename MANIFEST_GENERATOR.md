# 📝 Manifest Generator for TriliumNext Scripts

Fill out the sections below and paste into an AI chat (Claude, ChatGPT, etc.) or use as a manual checklist to generate your script's `manifest.json`.

---

## How to use

1. Fill every `[FILL]` section with your script's data
2. Paste the complete prompt into an AI chat
3. The AI will return a ready-to-use `manifest.json`
4. Save it in your script's folder inside the Toolkit

---

## Prompt

```
Create a manifest.json file for a TriliumNext script with the following characteristics:

## Script Data (registry)
- ID: [FILL — e.g. my-plugin]
- Name: [FILL — e.g. My Plugin]
- Version: [FILL — e.g. 0.1.0]
- Author: [FILL — e.g. Your Name]
- Description: [FILL — e.g. Does something amazing]
- Homepage (repo/docs URL): [FILL — e.g. https://github.com/youruser/yourrepo]
- Tags: [FILL — e.g. ["tag1", "tag2"]]

## Base URL for source files (raw.githubusercontent.com)
[Paste the base URL where .js/.jsx files will be hosted]
Example: https://raw.githubusercontent.com/youruser/yourrepo/main/My-Plugin/

## Script Notes (fill one table per note)

### Note 1 — Render Note (main)
- Title: [FILL — e.g. My Plugin]
- Type: text
- Content: [FILL — e.g. "Open this note to use the script."]
- Labels: [FILL — leave empty if none]
- Relation ~renderNote points to which note?: [FILL — e.g. My Plugin Code]

### Note 2 — Code (JS Frontend)
- Title: [FILL — e.g. My Plugin Code]
- Type: code
- MIME: application/javascript;env=frontend
- sourceUrl (filename): [FILL — e.g. plugin.js]
- Labels: [FILL — e.g. readOnly, widget, etc]

### Note 3 — Code (JS Backend) — if applicable
- Title: [FILL — e.g. My Plugin Handler]
- Type: code
- MIME: application/javascript;env=backend
- sourceUrl (filename): [FILL — e.g. handler.js]
- Labels: [FILL — e.g. customRequestHandler=my-endpoint]

### Note 4 — Config/Data — if applicable
- Title: [FILL — e.g. My Plugin Config]
- Type: text or code
- MIME: [FILL — e.g. application/json]
- Content: [FILL — e.g. "{}" for JSON, or instructions text]
- Labels: [FILL — e.g. myPluginConfig]

[Repeat for as many notes as your script needs]

## Important rules
1. sourceUrl inside the manifest must be an ABSOLUTE URL (https://raw.githubusercontent.com/...) or RELATIVE to the manifest
2. If the filename has spaces, use %20 (e.g. AI%20Code.js)
3. Labels with empty value should be an empty string ""
4. Relations are optional — include only if your script uses ~renderNote
5. The first note in the manifest automatically gets pluginId, pluginVersion, pluginName labels

Output only the JSON manifest, no explanations.
```

---

## Filled example

Use this as reference:

```
Create a manifest.json file for a TriliumNext script with the following characteristics:

## Script Data (registry)
- ID: shared-notes
- Name: Shared Notes
- Version: 0.6.0
- Author: ricolandia
- Description: Share notes between TriliumNext instances via invite strings
- Homepage: https://github.com/ricolandia/TriliumNext-Toolkit/tree/main/Shared-Notes
- Tags: ["share", "comment"]

## Base URL for source files
https://raw.githubusercontent.com/ricolandia/TriliumNext-Toolkit/main/Shared-Notes/

## Script Notes

### Note 1 — Render Note
- Title: Shared Notes
- Type: text
- Content: "Share notes between TriliumNext instances. Open this note to use it."
- Labels: none
- Relation ~renderNote: shared-notes-widget

### Note 2 — Widget (JS Frontend)
- Title: shared-notes-widget
- Type: code
- MIME: application/javascript;env=frontend
- sourceUrl: shared-notes-widget.js
- Labels: widget, originalFileName=shared-notes-widget.js, readOnly

### Note 3 — Handler (JS Backend)
- Title: shared-notes-handler
- Type: code
- MIME: application/javascript;env=backend
- sourceUrl: shared-notes-handler.js
- Labels: customRequestHandler=shared-notes-reply, originalFileName=shared-notes-handler.js, readOnly

### Note 4 — Config
- Title: Shared Notes Config
- Type: text
- Content: "Configure #myName and #myEndpoint on this note's labels."
- Labels: sharedNotesConfig, myName=yourname, myEndpoint=http://yoururl/
```

---

## Validation checklist

After generating the manifest, verify:

- [ ] Valid JSON (use jsonlint.com or similar)
- [ ] `sourceUrl` points to raw.githubusercontent.com (not github.com/blob)
- [ ] Source files exist at the specified paths
- [ ] Filenames with spaces use %20 (e.g. `AI%20Code.js`)
- [ ] Labels with values use `"name": "value"`
- [ ] Labels without values use `"name": ""`
- [ ] `~renderNote` FROM exists in the notes array
- [ ] `~renderNote` TO exists in the notes array
- [ ] First note does NOT need pluginId/pluginVersion/pluginName (these are automatic)
