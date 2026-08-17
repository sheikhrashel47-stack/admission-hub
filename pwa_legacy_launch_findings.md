# PWA legacy launch findings

Date: 2026-08-17

The live static assets are deployed at commit b6ad1c5. Both manifests use `./?source=pwa#progress/plan`; the live service worker is `v24-routine90-route-20260817`; live `index.html` contains the final-coordinator branch `p === 'progress/plan'` that calls `window.Routine90?.render()`.

A fresh browser navigation to the live app initially showed the legacy `Master Plan` / `90-Day Master Plan` screen, even though the active controller was `sw.js?v=v24-routine90-route-20260817` and `window.Routine90.render` existed. Calling `window.Routine90.render()` directly changed the DOM to the blue `90 Day Planner` shell. Calling `window.__admissionRenderRoute()` also changed it to the blue Routine90 shell. After waiting, the page remained Routine90 and showed exactly one card with a `More Cards` button; pressing `More Cards` expanded it to 90 cards.

This proves the remaining user-visible problem is an initial/early legacy repaint before Routine90's final render, not a wrong manifest route. The core `render()` function at index.html lines 822 onward has no `progress/plan` branch and can fall through to the legacy `renderPlan()` path through later wrappers. Boot sets `__admissionBootStatus='ready'` at line 3614 and later scripts/coordinator schedule final rendering. The safe fix should prevent any legacy `progress/plan` render from painting at all before Routine90 is ready, while retaining the loading gate and all data stores.

No IndexedDB or user data was changed during investigation. The browser-only test changed only the sandbox browser's isolated Routine90 `showAll` state by pressing More Cards.
