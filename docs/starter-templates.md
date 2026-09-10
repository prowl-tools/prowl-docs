---
sidebar_position: 11
slug: /starter-templates
title: Starter Templates
---

# Starter Templates

Prowl ships starter hunts **inside the CLI**. Running `prowl init` scaffolds a `.prowl/` directory with a config file and two ready-to-edit hunts, so a new project has a concrete pattern to copy from the moment it's initialized — no external registry to fetch from.

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
├── hunts/
│   ├── hello.yml       # Minimal "does the page load?" smoke test
│   └── login-flow.yml  # Commented, real-world auth example
└── .gitignore          # Keeps runs/, auth-state.json, and .env out of git
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

## Building your own hunts

The starters are a jumping-off point. To go further:

1. Copy a starter (`hello.yml` or `login-flow.yml`) to a new file — the **file name is the hunt's identity**, so `.prowl/hunts/checkout.yml` runs as `prowl run checkout`.
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
