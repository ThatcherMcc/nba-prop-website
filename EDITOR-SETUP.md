# Fixing Red Underlines on JSX (TypeScript not seeing React types)

If you see red underlines on **every** JSX tag (`<div>`, `<span>`, `<header>`, etc.) with errors like  
`Property 'div' does not exist on type 'JSX.IntrinsicElements'`, the editor is using the wrong TypeScript or project context, so it never loads the app’s React/JSX types.

**Root cause (if you’ve seen this in this project):** A small version skew between **types** and **dependencies** (e.g. `@types/react` and `react` off by 0.0.2) can break JSX type resolution. Keeping `@types/react` / `@types/react-dom` in sync with the installed `react` / `react-dom`, and using the **workspace** TypeScript version so the editor and the project use the same versions, fixes it.

---

## Fix that usually works: Use the workspace TypeScript version

**In VS Code / Cursor:**

1. Open the **Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).
2. Run: **`TypeScript: Select TypeScript Version`**.
3. Choose **“Use Workspace Version”** (the TypeScript from this project’s `node_modules`).

The red underlines should disappear. If they don’t, run **“Developer: Reload Window”** and check again.

**If you only see “Use VS Code’s Version” (e.g. 5.9.2)** — the current workspace root doesn’t have TypeScript in its `package.json`, so there is no workspace version to select. **Open this app as the workspace:** **File → Open Folder…** and choose the **`nba-prop-website`** folder (the one that contains this file and has `typescript` in `package.json`). Then run **TypeScript: Select TypeScript Version** again; **“Use Workspace Version”** will appear and will use this app’s TypeScript and types.

**Why this works:** The editor can use its built-in TypeScript instead of the project’s. Built-in TS may resolve types differently (e.g. from a parent folder or different `node_modules`). Using the workspace version forces the editor to use this app’s `tsconfig.json` and `node_modules`, where React’s full JSX types live.

*Reference: [microsoft/TypeScript#52396](https://github.com/microsoft/TypeScript/issues/52396)*

---

## If that doesn’t fix it: Open the app folder as the workspace

Make the **workspace root** this folder (`nba-prop-website`), not the parent repo:

1. **File → Open Folder…**
2. Open the **`nba-prop-website`** folder (the one with `package.json`, `src/`, `next.config.ts`, `tsconfig.json`).
3. Confirm the sidebar shows **`nba-prop-website`** as the root. Red underlines should clear.

To keep the rest of the repo in the same window: **File → Add Folder to Workspace…** and add the other folders; keep `nba-prop-website` as one of the roots.

---

## Optional: Confirm which project is used

- **TypeScript: Go to Project Configuration** (Command Palette) — opens the `tsconfig.json` that the editor is using for the current file. It should be `nba-prop-website/tsconfig.json` when you’re in this app.

## Avoiding the issue: keep types and deps aligned

After `pnpm install` (or npm/yarn), if JSX underlines come back, check that `@types/react` and `@types/react-dom` match the installed `react` / `react-dom` (e.g. same minor). Pinning or using `pnpm overrides` for those type packages can prevent small version drifts that break JSX resolution.
