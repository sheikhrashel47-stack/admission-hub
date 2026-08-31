# AGENT_RESUME — Admission Hub (control PWA)

Mirror of public-product resume. Full detail: `admission-hub-demo/AGENT_RESUME.md`

**Date:** 2026-08-31  
**Live control:** https://sheikhrashel47-stack.github.io/admission-hub/  
**Live public:** https://sheikhrashel47-stack.github.io/admission-hub-demo/

## Status
Phase 1 approved. Phase 2 cloud live. Phase 3 accounts live on public product. **STOP for “PHASE 3 APPROVED”.**

## Control app role
- Source of **global** Question Bank / Vocabulary. Auto-publishes via `cloud-content-sync.js` (`AH_CLOUD_ROLE=control`) to `admission-gk` `/api/cloud/publish`.
- Settings → **Public students** (`public-users-admin.js`) uses admin Bearer token (sessionStorage only).
- Do not put Cloudflare/GitHub secrets in the frontend.

## Android / vocab fix (this commit)
- `android-runtime-fix.js` — 1-finger scroll
- `cloud-content-sync.js` — batched IDB, keep images up to ~900KB
- Open this control PWA once so vocabulary **pictures** go to public KV

## Worker deploy
Upload `gk-agent-worker.js` + `public-worker.js` as modules to script `admission-gk` (`main_module`: gk-agent-worker.js). Keep secret_text bindings. Also update `ah-public` with `public-worker.js`.
