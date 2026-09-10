---
sidebar_position: 3
slug: /assertions
title: Assertions
---

# Assertions

Prowl supports two kinds of assertions: **inline assertions** (mid-flow checks as steps) and **hunt-level assertions** (evaluated after all steps complete).

## Inline Assertions

Use `assert` steps anywhere in your hunt for mid-flow checks. The hunt fails immediately if an inline assertion fails.

### visible

Assert that text is visible on the page.

```yaml
- assert:
    visible: "Welcome back"
```

:::note
`visible` and `notVisible` accept either plain text or a CSS selector. Prose values — including those with punctuation like `"Name:"` or a sentence ending in `.` — are matched as **text**. Values with a clear selector signature (a leading `.`, `#`, or `[`, an attribute bracket, or an engine prefix like `css=` / `xpath=` / `text=`) are matched as **selectors**, e.g. `visible: "img[alt='Logo']"`.
:::

### notVisible

Assert that text is NOT visible on the page.

```yaml
- assert:
    notVisible: "Error"
```

### urlIncludes

Assert the current URL contains a substring.

```yaml
- assert:
    urlIncludes: "/dashboard"
```

### urlEquals

Assert the current URL matches exactly.

```yaml
- assert:
    urlEquals: "https://example.com/dashboard"
```

## Hunt-Level Assertions

These run after all steps complete. Define them in the `assertions` block at the top level of your hunt YAML. Assertions run even when a step failed.

```yaml
name: smoke-test
steps:
  - navigate: "/"
assertions:
  - selectorExists: "h1"
  - noConsoleErrors: true
  - noNetworkErrors: true
```

:::note Hunt-level assertions on native targets
As of **0.1.7**, hunt-level assertions run on the experimental [macOS](/macos-target), [Android](/android), and [iOS](/ios) targets too — they are no longer silently skipped. The **`selectorExists` / `selectorNotExists`** types resolve their selector against the app (and pass through `guardrails.forbiddenSelectors` first, just like step selectors). The web-only types — **`urlIncludes`, `urlEquals`, `noConsoleErrors`, `noNetworkErrors`** — are reported per-assertion with a **`skipped`** status (shown as `[SKIPPED]` in `summary.md`, `skipped` in `result.json`, and `<skipped/>` in JUnit) rather than dropped or errored. A console warning names the target for any web-only assertion a hunt explicitly authored.
:::

### selectorExists

Assert that an element matching the selector exists on the page.

```yaml
assertions:
  - selectorExists: "h1"
  - selectorExists: "[data-testid='main-content']"
```

### selectorNotExists

Assert that no element matching the selector exists on the page.

```yaml
assertions:
  - selectorNotExists: ".error-banner"
  - selectorNotExists: "[data-testid='error-message']"
```

### urlIncludes / urlEquals

Same as inline versions, but evaluated after all steps complete.

```yaml
assertions:
  - urlIncludes: "/dashboard"
  - urlEquals: "https://example.com/"
```

### noConsoleErrors

Fail if any `console.error` messages were logged during the hunt.

```yaml
assertions:
  - noConsoleErrors: true
```

### noNetworkErrors

Fail if any HTTP responses with status >= 400 were received during the hunt.

```yaml
assertions:
  - noNetworkErrors: true
```

:::tip
Use `networkIgnorePatterns` in your config to exclude known noisy endpoints (analytics, third-party scripts) from network error checks.

```yaml
# .prowl/config.yml
assertions:
  networkIgnorePatterns:
    - "analytics.google.com"
    - "hotjar.com"
```
:::

## AI-Powered Assertions

For checks that are hard to express as a selector — layout, rendered content, visual state — the [`assertWithAI`](/step-types#assertwithai) step (0.1.6) screenshots the page and asks a vision LLM to verdict a natural-language claim. It runs on **your own API key** (BYOK), degrades to a non-fatal skip when no key is configured, and is a deliberate, non-deterministic exception to Prowl's determinism principle. See the [step reference](/step-types#assertwithai) for the shape, config, and caveats.

## What's Next

<div className="card-grid">
  <a className="card" href="/variables">
    <h3>Variables</h3>
    <p>Dynamic values, credentials, and env vars</p>
  </a>
  <a className="card" href="/configuration">
    <h3>Configuration</h3>
    <p>Browser settings, timeouts, and guardrails</p>
  </a>
  <a className="card" href="/troubleshooting">
    <h3>Troubleshooting</h3>
    <p>Common issues and debugging tips</p>
  </a>
</div>
