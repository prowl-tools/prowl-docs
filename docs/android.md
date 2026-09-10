---
sidebar_position: 10
slug: /android
title: Android Target
---

# Android Target (Experimental)

Prowl can drive **native Android apps** on an emulator or a USB-connected device, in addition to the web. You point `target.type` at `android`, write the same portable steps you already know, and Prowl runs them against a real app instead of a browser page.

It follows the same "external agent + JSON protocol" shape as the [macOS target](/macos-target): `adb` handles device lifecycle, and the on-device [`appium-uiautomator2-server`](https://github.com/appium/appium-uiautomator2-server) (Apache-2.0) handles UI interaction over a plain HTTP/JSON API driven with raw `fetch` — no Appium server, no JVM, no gRPC.

:::warning Experimental
The Android target shipped in Prowl **0.1.5** and is **experimental**. Its API, selector dialect, and step coverage may still change.
:::

## Requirements

- **`adb`** on your `PATH` (from the Android SDK platform-tools), plus at least one **booted emulator or USB device** — `adb devices -l` should list it as `device`.
- Android build-tools **`aapt`/`aapt2`** on `PATH` **only if** `target.app` is an `.apk` path: Prowl reads the package name from the APK before installing it. (If you set `target.app` to the package name directly and install the APK yourself, `aapt` is not needed.)

### The on-device agent

UI interaction is handled by [`appium-uiautomator2-server`](https://github.com/appium/appium-uiautomator2-server) (Apache-2.0). Its two prebuilt APKs ship **inside the npm dependency** and are installed onto the device automatically — there is nothing to build.

As of Prowl 0.1.5 this agent is an **`optionalDependency`** (pinned to `appium-uiautomator2-server@10.6.2`). Default `npm install -g prowl-tools` installs it, so the Android target works out of the box. But a lean, web-only install can skip it:

```bash
npm install -g prowl-tools --omit=optional   # skips the mobile agents
```

If an Android hunt runs without the agent present, Prowl fails with a clear message and the exact command to restore it. Reinstall it where Prowl can resolve it:

```bash
# Global install (matches `npm install -g prowl-tools`):
npm install -g appium-uiautomator2-server

# Local project install:
npm install appium-uiautomator2-server
```

## Enabling it

Point your config at an Android target:

```yaml
# .prowl/config.yml
target:
  type: android
  app: "com.example.app"           # a package name, or a path to an .apk to install
  # deviceSerial: "emulator-5554"  # optional; required only when several devices are attached
  # coldStart: true                # optional; `pm clear` before launch for a deterministic start
guardrails:
  allowedApps:                     # optional scope; empty = allow the target app
    - "com.example.app"
```

Then run a hunt exactly as you would for the web:

```bash
prowl run my-android-hunt
```

On launch Prowl selects the device (failing with an actionable error, listing serials, if several are attached and no `deviceSerial` is set), installs the app (when given an `.apk`) and the agent, starts the agent via `am instrument`, and port-forwards it on a **dynamically allocated** local port (via `adb forward tcp:0`) so parallel sessions and CI jobs don't collide. Everything is torn down (agent session, instrumentation, port forward, `am force-stop`) after the run.

## Configuration

The `target` block carries a **discriminant**, `type`. On the Android target:

| Option | Type | Required | Description |
|---|---|---|---|
| `type` | `"android"` | yes | Selects the Android target. |
| `app` | `string` | yes | A **package name** (e.g. `com.example.app`) or a path to an **`.apk`** to install. |
| `deviceSerial` | `string` | no | The `adb` serial (e.g. `emulator-5554`). **Required only when several devices are attached** — otherwise the single device is selected automatically. |
| `coldStart` | `boolean` | no (default `false`) | When `true`, runs `pm clear` before launch for a deterministic, freshly-reset start. |

`url` is **not** accepted on this target. Omitting `type` still selects the web target, so existing web configs are unchanged.

### guardrails.allowedApps

`allowedApps` is the native-scope analog of `allowedDomains` — it restricts which app a hunt may drive.

```yaml
guardrails:
  allowedApps:
    - "com.example.app"           # a package ID…
    - "/abs/path/to/app.apk"      # …or a canonical .apk path
```

- An **empty or omitted** `allowedApps` list leaves the scope unset, and the target app is implicitly allowed — mirroring the way `allowedDomains` auto-includes the web target's own host.
- Entries are **Android package IDs** or **canonical full `.apk` paths**. When `target.app` is an APK, Prowl resolves its package ID (via `aapt`) and **validates it against the allowlist before installing**.
- `forbiddenSelectors` still applies, using the same case-sensitive substring semantics as the web target.

`prowl login` and the `allowedDomains` / URL guardrails do **not** apply on the Android target.

## Selector dialect

Native selectors address `resource-id`, `content-desc`, visible text, and widget class. Semantics match the macOS and iOS targets, so a selector means the same thing across native targets. Prefer `id=` (the native analog of `data-testid`).

| Selector | Matches |
|---|---|
| `id=save` | element whose `resource-id` is `save` — a **bare name is auto-qualified** with the target app's package (`id=save` → `com.pkg:id/save`); ids in other namespaces need the full form (e.g. `id=android:id/title`) |
| `label="Submit"` | element whose `content-desc` equals `Submit` (exact) |
| `role=android.widget.Button` | element of that widget class |
| `role=android.widget.Button[name="Save"]` | that widget class whose visible text contains `Save` |
| `text="Save"` or bare `Save` | element whose visible text contains the text (substring) |

:::note Jetpack Compose caveat
Compose nodes only expose a `resource-id` when the app sets `Modifier.testTag(...)` **and** enables `testTagsAsResourceId = true`. Without that, Compose test tags do **not** surface as resource-ids — match Compose UI with `text=` or `label=` (from `Modifier.semantics { contentDescription = ... }`) instead.
:::

`forbiddenSelectors` still applies on this target (text patterns use the same substring semantics as the other targets).

## Inspecting the UI with `prowl analyze`

Don't guess selectors — dump them. `prowl analyze` works on the Android target the same way it does on the web and macOS: it attaches to the running app on a booted emulator/device, reads the uiautomator UI hierarchy, and prints every interactive element with **ranked selector candidates** (best first). It is read-only, honors `guardrails.allowedApps`, and leaves the app running.

```bash
# Uses the Android target from .prowl/config.yml:
prowl analyze

# …or force the Android target explicitly:
prowl analyze --app com.android.settings --platform android
prowl analyze --app ./app-debug.apk               # an .apk implies Android
prowl analyze --app com.example.app --device emulator-5556   # pick a device

# Machine-readable output for agents:
prowl analyze --app com.android.settings --platform android --json
```

Ranking (best → last resort): `id=` (the package-qualified `resource-id`, the native `data-testid`) > `label=` (content-desc) > `role=<class>[name="<text>"]` > `text=`.

```text
  App Analysis: com.android.settings

  Interactive Elements:
    android.widget.EditText id=com.android.settings:id/search_src_text "Search settings"
    android.widget.LinearLayout text="Network & internet" "Network & internet"
    android.widget.Switch id=com.android.settings:id/switch_widget (disabled)

  3 elements
```

:::note Platform selection for `--app`
An `.apk` implies Android; otherwise pass `--platform android` (a bare package name is ambiguous with the macOS and iOS targets, which default to macOS unless a config `target.type` or `--platform` says otherwise). With an Android `target.type` in `.prowl/config.yml`, a bare `prowl analyze` needs no flag.
:::

## Step compatibility

Portable steps run on the Android target; web-only steps in the top-level hunt are **rejected up front** at validation time — before anything launches — with a clear, Android-labelled error. A `runHunt` step validates its referenced hunt when that step executes, before the nested hunt starts.

| Portable (Android) | Not supported on Android |
|---|---|
| `click`, `fill`, `type`, `press` | `navigate`, `waitForUrl`, `waitForNetworkIdle` |
| `wait`, `waitForSelector` | `mockRoute` / `unmockRoute`, `evalScript`, `runScript` |
| `assert: visible` / `notVisible` | `onDialog`, `select` / `selectOption`, `setInputFiles` |
| `screenshot`, `assertScreenshot`, `assertWithAI` | `waitForDownload`, `assert: urlIncludes` / `urlEquals` |
| `scroll`, `scrollTo` | `hover` (no touch equivalent) |
| `repeat`, `if`, `runHunt`, `copyText` | |

The web-only rejection names the offending step, for example:

```text
Step "navigate" is not supported by the Android target. It is web-only;
use a portable step (click, fill, type, press, wait, assert visible, screenshot, etc.).
```

Notes:

- **`type` and `fill`** set text on the focused / matched field **unicode-safely** (via the agent's `element/value`, not `adb shell input text`).
- **`press`** maps key names (`Enter`, `Tab`, `Backspace`, `Back`, `Home`, arrow keys, …) onto Android key codes and dispatches them to the focused view.
- **`scroll` and `scrollTo`** work as of **0.1.8**, synthesized as touch swipes through the agent's W3C actions endpoint. Directional `scroll`'s optional `amount` is the swipe distance in **device points** (default 75% of the axis; a negative amount reverses direction); `scrollTo` runs a **bounded swipe-loop probe** (downward, then upward) and fails with an error naming the selector and attempt count if the element never appears. See [Step Types](/step-types#scroll).
- **`hover`** has no touch-device equivalent and is rejected with a clear message. (On the macOS target `hover` is portable — the rejection is specific to touch targets.)
- URL assertions (`urlIncludes` / `urlEquals`) are web-only; use inline `assert: visible` / `notVisible` steps for checks on this target.
- Hunt-level `assertions:` blocks **run** on this target as of **0.1.7**: `selectorExists` / `selectorNotExists` are evaluated against the app, while web-only assertion types (`urlIncludes`, `urlEquals`, `noConsoleErrors`, `noNetworkErrors`) are reported as `skipped`. See [Assertions](/assertions#hunt-level-assertions).

## Worked example

Open the Android Settings app, assert a known row is visible, and screenshot it:

```yaml
# .prowl/config.yml
target:
  type: android
  app: "com.android.settings"
guardrails:
  allowedApps:
    - "com.android.settings"
```

```yaml
# .prowl/hunts/settings-smoke.yml
name: settings-smoke
steps:
  - waitForSelector:
      selector: text="Network & internet"
      timeout: 10000
  - assert:
      visible: text="Network & internet"
  - screenshot: settings-home
```

```bash
prowl run settings-smoke
```

## Continuous integration

GitHub's Linux runners support KVM, so a hardware-accelerated emulator boots inside the job via [`reactivecircus/android-emulator-runner`](https://github.com/ReactiveCircus/android-emulator-runner). Prowl installs the uiautomator2 agent APKs from its optional dependency automatically.

```yaml
name: Android E2E
on: [push, pull_request]
jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build

      # KVM must be accessible for a fast emulator.
      - name: Enable KVM
        run: |
          echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666", OPTIONS+="static_node=kvm"' \
            | sudo tee /etc/udev/rules.d/99-kvm4all.rules
          sudo udevadm control --reload-rules
          sudo udevadm trigger --name-match=kvm

      - name: Run hunts against the emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          arch: x86_64
          force-avd-creation: false
          emulator-options: -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect
          disable-animations: true
          # `prowl` is your installed CLI (e.g. `npx prowl` or a global install);
          # the emulator is booted and on adb by the time this runs.
          script: npx prowl ci --junit

      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: android-artifacts
          path: .prowl/runs/**
          if-no-files-found: ignore
```

The Prowl repo also runs a self-hosted end-to-end gate (`.github/workflows/mobile-e2e.yml`) that boots a headless emulator on the Prowl Tools Mac and drives Settings through the real CLI, skipping cleanly for forks.

## What's Next

<div className="card-grid">
  <a className="card" href="/ios">
    <h3>iOS Simulator Target</h3>
    <p>Drive native iOS apps on a booted simulator</p>
  </a>
  <a className="card" href="/selectors">
    <h3>Selectors</h3>
    <p>Selector strategy across web and native targets</p>
  </a>
  <a className="card" href="/configuration">
    <h3>Configuration</h3>
    <p>The full <code>target</code> and guardrails reference</p>
  </a>
  <a className="card" href="/step-types">
    <h3>Step Types</h3>
    <p>Every step, and which targets each one runs on</p>
  </a>
</div>
