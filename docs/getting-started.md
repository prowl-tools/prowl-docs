---
sidebar_position: 1
slug: /
title: Getting Started
---

<div className="docs-hero">
  <div>
    <div className="docs-hero__eyebrow">Prowl Documentation</div>
    <h1>Deterministic QA Hunts From Your CLI</h1>
    <div className="docs-hero__subtitle">
      Prowl drives native macOS apps (experimental) and web apps from the same declarative YAML — repeatable
      hunts you can run locally, in CI, or hand to an AI agent. This page gets you from zero to a passing
      smoke test quickly.
    </div>
    <div className="docs-hero__actions">
      <a className="button button--primary button--lg" href="#install">Start In 60 Seconds</a>
      <a className="button button--secondary button--lg" href="/step-types">Browse Step Types</a>
    </div>
  </div>
  <div className="docs-hero__art">
    <img src="/img/prowl-mascot.png" alt="Prowl mascot with magnifying glass" />
  </div>
</div>

<div className="docs-quickstart">
  <div className="docs-quickstart__row">
    <img src="/img/prowl-logo.png" alt="" aria-hidden="true" className="docs-quickstart__logo" />
    <span><strong>Before you start:</strong> Node.js 20+, npm, and a runnable web app. Native <a href="/macos-target">macOS app</a> testing uses the same hunt format, but needs the macOS target setup first.</span>
  </div>
</div>

## Outcome

By the end of this guide, you will run one hunt that validates your homepage and produces artifacts under `.prowl/runs/`.

## Install

```bash
npm install -g prowl-tools
```

Or with Homebrew:

```bash
brew tap prowl-tools/tap
brew install prowl
```

Prowl uses Playwright under the hood. Install the browser:

```bash
npx playwright install chromium
```

## Initialize

```bash
cd your-project
prowl init
```

This creates a `.prowl/` directory with a config file, four starter hunts, and a `.gitignore`:

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

The three web starters (`hello`, `login-flow`, `form`) run against the default web target as soon as you point `config.yml` at your app. `macos-hello` is a desktop-first first-run hunt that drives TextEdit through the Accessibility API; the macOS target is experimental and needs a one-time setup — see [macOS Target](./macos-target.md).

`prowl init` finishes by pointing you at the bundled hunts:

```text
  Initialized .prowl directory.
  Run prowl run hello to get started.
  See .prowl/hunts/login-flow.yml (auth) and .prowl/hunts/form.yml (web forms) for fuller examples.
  Desktop-first? .prowl/hunts/macos-hello.yml is a macOS starter (experimental — see its comments to enable).
```

See [Starter Templates](./starter-templates.md) for a walkthrough of each bundled hunt.

## Configure

Edit `.prowl/config.yml` to point at your app:

```yaml
target:
  url: "http://localhost:3000"
```

With your app running at that URL, confirm your setup by running the bundled starter hunt:

```bash
prowl run hello
```

`prowl run <name>` resolves `.prowl/hunts/<name>.yml` by file name, so `prowl run hello` runs `.prowl/hunts/hello.yml`. As of **0.1.7**, a literal hunt path resolves to the same hunt, so `prowl run hello`, `prowl run hunts/hello.yml`, and `prowl run .prowl/hunts/hello.yml` are equivalent (nested paths like `.prowl/hunts/admin/users.yml` → `admin/users` included) — handy for shell tab-completion. The same normalization applies to `prowl watch` and `prowl history`.

If your app uses authentication, capture storage state early with [`prowl login`](/auth) so hunts run as an authenticated user.

## Write Your First Hunt

Create a new file at `.prowl/hunts/smoke-test.yml`:

```yaml
name: smoke-test
description: "Validates homepage loads correctly"
tags:
  - smoke
steps:
  - navigate: "/"
  - wait: "Welcome"
  - assert:
      visible: "Sign In"
assertions:
  - noConsoleErrors: true
retry:
  maxRetries: 0
  delay: 1000
```

:::note
- The **file name is the hunt's identity**: `prowl run smoke-test` loads `.prowl/hunts/smoke-test.yml`. The `name:` field is metadata — the file name, not `name:`, must match the command you run.
- **`description`** — a human-readable summary stored in hunt metadata and shown by `prowl list`
- **`tags`** — categorize hunts for filtering with `--include-tags` and `--exclude-tags`
- **`retry`** — configure automatic retries on failure (`maxRetries: 0` means no retries)
:::

## Run

```bash
prowl run smoke-test
```

```text
  ● Running hunt: smoke-test
    ✓ navigate "/" (120ms)
    ✓ wait "Welcome" (85ms)
    ✓ assert visible "Sign In" (15ms)

  PASS smoke-test (220ms) 3/3 steps
  Artifacts: .prowl/runs/2026-02-09_10-30-45
```

You now have a stable smoke test and a run artifact folder you can inspect in CI.

## What's Next

<div className="card-grid">
  <a className="card" href="/assertions">
    <h3>Assertions</h3>
    <p>Fail fast with inline and hunt-level checks</p>
  </a>
  <a className="card" href="/step-types">
    <h3>Step Types</h3>
    <p>All 30 step types available in hunts</p>
  </a>
  <a className="card" href="/configuration">
    <h3>Configuration</h3>
    <p>Tune browser behavior, artifacts, and guardrails</p>
  </a>
  <a className="card" href="/variables">
    <h3>Variables</h3>
    <p>Inject credentials and dynamic runtime values safely</p>
  </a>
</div>
