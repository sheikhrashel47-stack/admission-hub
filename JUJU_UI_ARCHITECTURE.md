# JUJU UI Architecture

## Scope

JUJU is integrated as an isolated `#juju` workspace route in the existing Admission Hub PWA. The route is intentionally additive: it does not alter authentication, IndexedDB stores, API endpoints, service-worker behavior, SSE, agent runners, Browser Use Cloud, or existing admission-study screens.

## Component hierarchy

The shell is composed of `JujuApp`, `Sidebar`, `TopBar`, `ChatWorkspace`, `MessageList`, `Composer`, and an optional `ContextPanel`. The context panel contains `ProgressCard`, `AgentTimeline`, `ChangedFiles`, and `BrowserAgent` surfaces. The command palette is an overlay with keyboard invocation through `Cmd/Ctrl+K`.

## State architecture

Local UI state is kept in a single bounded JUJU state object: active surface, theme, context visibility, command-palette visibility, draft text, attachments, and the currently loaded message window. It is persisted only to the namespaced `juju-workspace-v1` local-storage key. This prototype boundary is separate from Admission Hub application state and is designed for replacement with server-backed chat, agent, project, and task stores without changing the shell contracts.

## Rendering strategy

Messages are rendered from a bounded list and each message has a stable identity. Code is placed in a scroll-contained `<pre>` viewport with `content-visibility: auto`, intrinsic sizing, and no per-token full-application updates. Composer updates are local and auto-growing. The next production phase should replace the bounded in-memory message window with cursor pagination and a dedicated virtual list for 1,000+ conversations and messages.

## Performance strategy

The route avoids global observers and perpetual timers. It uses delegated data attributes for interaction wiring, CSS containment-like viewport behavior for code, lazy file selection, safe object URL cleanup for downloads, and a reduced-motion media query. Large-code production rendering should use a worker-backed tokenizer and viewport virtualization rather than creating one DOM node per line.

## File handling

The composer accepts multiple local files and shows lightweight attachment metadata. It does not base64-encode files or upload them automatically. Existing upload APIs can be connected to the attachment boundary later with progress, retries, chunking, and object URL lifecycle management.

## Code rendering and preview

Code blocks expose copy and download actions and preserve the original string. The preview action is a safe integration point for a sandboxed iframe/preview service; it does not execute untrusted code in the JUJU document. The production preview surface should use an isolated origin and sandbox flags.

## Agent and browser UI

The context panel provides observable phases—repository inspection, architecture mapping, implementation, and verification—plus progress, changed files, and browser-agent status. These are presentation surfaces only until wired to the existing agent/SSE event contracts; no backend completion or test success is fabricated by the route.

## Mobile behavior

Mobile uses an independent layout: the sidebar becomes a drawer, the context panel is hidden from the primary flow, the composer remains keyboard-safe with safe-area padding, and the chat message area owns scrolling. Desktop widths preserve the three-region workspace model.

## Integration contract

`juju-workspace.js` exposes `window.renderJujuWorkspace`. The route dispatcher calls it only for `Router.path === 'juju'`. Navigate with `navigate('juju')` or open `#juju`. All existing routes continue through the original dispatcher.
