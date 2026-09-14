---
sidebar_position: 11
slug: /starter-templates
title: Starter Templates
---

# Starter Templates

Prowl ships starter hunts **inside the CLI**. Running `prowl init` scaffolds a `.prowl/` directory with a config file and four ready-to-edit hunts, so a new project has a concrete pattern to copy from the moment it's initialized — no external registry to fetch from.

:::note
The community Prowl Hub was retired in 2026. Starter hunts now live in the CLI itself and are written into your project by `prowl init`. There is no hub website or API to call.
:::

## What `prowl init` writes

```bash
prowl init
```

```text
.prowl/
├── config.yml          # Target URL, browser settings, guardrails
├── .gitignore          # Keeps runs/, auth-state.json, and .env out of git
└── hunts/
    ├── hello.yml        # Minimal smoke test — verifies the app loads
    ├── login-flow.yml   # Auth example — fill credentials, verify redirect
    ├── form.yml         # Forms example — fill, select, submit, assert
    └── macos-hello.yml  # Desktop starter — drive TextEdit (macOS, experimental)
```

Re-run with `prowl init --force` to recreate the config and starter hunts. `--force` overwrites existing `.prowl` configuration and starter hunt files, so commit or back up custom changes before using it.

### `hello.yml` — the minimal smoke test

A tiny "does the page load?" check — the fastest way to confirm your setup works:

```bash
prowl run hello
```

### `login-flow.yml` — a real-world auth example

A commented, fill-in template for the most common flow there is: signing in. It demonstrates the patterns you'll reuse across most hunts:

- **Email/password fill** via the label shorthand (`fill: { "Email": "…" }`).
- **`waitForUrl`** to confirm navigation after submit.
- **Mid-flow and hunt-level assertions** to verify the authenticated state.
- **Secret handling** — `{{VAR}}` interpolation from `.prowl/.env`, with automatic [redaction](/variables#automatic-redaction) of interpolated values in reports.
- A pointer to [`prowl login`](/auth) for capturing reusable authentication state.

Customize the URL and selectors for your app, then run it like any other hunt:

```bash
prowl run login-flow
```

See [Variables](/variables) for interpolation precedence and secret handling, and [Authentication](/auth) for capturing login state.

### `form.yml` — the forms pattern {#formyml}

A commented walkthrough of the other flow almost every app has: fill a form, pick an option, submit, and confirm the success state. It leans on Prowl's **shorthand selectors**, which find an element by its visible label, placeholder, or text — no CSS to write:

- **`fill: { "Full name": "Ada Lovelace" }`** finds the input by its label or placeholder text.
- **`select: { "Plan": "Pro" }`** finds the `<select>` by its label and picks the option by its visible text.
- **`click: "I agree to the terms"`** finds a checkbox or button by its text content.
- A **mid-flow `assert: visible`** plus hunt-level `urlIncludes` / `noConsoleErrors` checks confirm the form went through.

Each shorthand step carries a commented **explicit-selector equivalent** so you can drop to a precise selector when a label is ambiguous — for example:

```yaml
# Shorthand
- fill:
    "Full name": "Ada Lovelace"

# Equivalent explicit form
- fill:
    selector: "input[name='name']"
    value: "Ada Lovelace"
```

Prefer stable selectors — an accessible label or a `data-testid` — over brittle CSS, and run [`prowl analyze`](/step-types) to dump ranked selector candidates for a page. Point the `navigate` step at your form's path, update the field labels and button text, then run it:

```bash
prowl run form
```

### `macos-hello.yml` — a desktop-first first-run hunt {#macos-helloyml}

Prowl is **desktop-first**: it drives native macOS apps through Apple's Accessibility API from the same YAML as web hunts. This starter targets **TextEdit** — present on every Mac — so you can try the desktop target without wiring up your own app first. It types a line into a fresh document and asserts the text appears, using only portable steps (`type`, `assert: visible`) that run on both the web and macOS targets.

:::warning Experimental
The macOS target is **experimental** (see the [macOS Target](/macos-target) page). The selector dialect and step coverage may still change, and web-only steps (`navigate`, `waitForUrl`, …) are rejected on it.
:::

Because this hunt drives a native app, it needs a one-time setup before it will run — the starter's own inline comments walk through each step, and they mirror the [macOS Target](/macos-target) page:

1. **Install the helper:** `prowl macdriver install`. Until the first signed `prowl-macdriver` release ships, `install` returns a clear "no release yet" error (a 404 against GitHub Releases) — build from source instead, which needs a checkout of the [prowl repo](https://github.com/prowl-tools/prowl) and the Swift toolchain / Xcode CLT:

   ```bash
   git clone https://github.com/prowl-tools/prowl.git
   cd prowl/macdriver && swift build -c release
   ```

   `prowl macdriver status` prints the resolved binary and the same guidance.
2. **Grant Accessibility permission** to the app that hosts your terminal (Terminal, iTerm, VS Code, …): **System Settings → Privacy & Security → Accessibility**.
3. **Point the config at a macOS target.** `init`'s default `config.yml` targets the web, so replace its `target:` block and scope the app under guardrails:

   ```yaml
   target:
     type: macos
     app: "com.apple.TextEdit"   # bundle id, or an absolute /path/to/App.app
   guardrails:
     allowedApps:
       - "com.apple.TextEdit"
   ```

Then run it like any other hunt:

```bash
prowl run macos-hello
```

TextEdit's controls aren't ours, so treat the starter's steps as a starting point and adjust to what `prowl analyze --app com.apple.TextEdit` reports on your macOS version. See the [macOS Target](/macos-target) page for the full setup, selector dialect, permissions, and CI guidance.

## Building your own hunts

The starters are a jumping-off point. To go further:

1. Copy a starter (`hello.yml`, `login-flow.yml`, `form.yml`, or `macos-hello.yml`) to a new file — the **file name is the hunt's identity**, so `.prowl/hunts/checkout.yml` runs as `prowl run checkout`.
2. Swap in your app's URL, selectors, and assertions. Use [`prowl analyze`](/step-types) to dump ranked selector candidates instead of guessing them.
3. Reference the [Step Types](/step-types) and [Assertions](/assertions) pages for the full vocabulary.

For agent-driven generation, an agent can produce hunt YAML and validate it with the exported `huntSchema` before running — see [Prowl for Agents](/agents).

## Contributing a template

Want to share a reusable pattern? Because starters ship inside the CLI, they're contributed the same way as any other change — by **pull request to the [`prowl`](https://github.com/prowl-tools/prowl) repository**. Add a well-commented hunt under the CLI's bundled `examples/hunts/` directory, keep it self-contained and fill-in-ready (parameterize app-specifics with `{{VAR}}` placeholders), and open a PR.

<div className="card-grid">
  <a className="card" href="/getting-started">
    <h3>Getting Started</h3>
    <p>Install, initialize, and run your first hunt</p>
  </a>
  <a className="card" href="/agents">
    <h3>Prowl for Agents</h3>
    <p>CLI integration, library API, and agent workflow patterns</p>
  </a>
  <a className="card" href="/variables">
    <h3>Variables</h3>
    <p>Interpolation, precedence, and redaction</p>
  </a>
</div>
