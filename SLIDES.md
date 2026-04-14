## Slide 1 — TypeScript: AI's First Line of Defense

**AI writes fast. TypeScript makes it write correctly.**

AI-generated tests cover the happy path. Bugs live in the edges — the cases nobody thought to test.

TypeScript closes the gap before tests even run:

- Any bug, mismatch, or wrong shape → **compile error, not a production incident**
- AI runs `tsc` and knows instantly if its output is valid — **no test suite needed for the first check**

> The type system is the cheapest feedback loop that exists. Use it first.

---

## Slide 2 — One Project. AI Sees Everything.

**Split projects don't just slow humans down — they blind AI too.**

When backend and frontend live in separate repos, AI can only see half the picture. It generates code that _looks_ right
but breaks at the seam.

One TypeScript project changes this:

- **Full context in one pass** — AI reads server logic, client code, and shared types together
- **No guessing across the boundary** — the type that leaves the server is the exact type that arrives in the component
- **Less code, better code** — no duplicate type definitions, no translation layer, no defensive `any`

> The fewer moving parts AI has to imagine, the fewer mistakes it makes.

---

## Slide 3 — The Stack: tRPC + Vike

**One project. No lock-in. Minimum surface area.**

**tRPC** — type-safe server/client calls, built on React Query, zero codegen **Vike** — file-based routing, runs tRPC
directly, no separate backend project needed

**Why Vike and not Next.js:**

- Next.js is a platform. Vike is a tool. You own the deployment, the infra, the release cycle.
- No Vercel dependency. Runs anywhere Node runs.

**What you get:**

- One repo · one `tsc` run · one place where AI reads the whole truth
- AI generates a new page → route, handler, types, and component — correctly, in one shot
- Less code to write. Less code to maintain. Less for AI to get wrong.

> Smallest possible surface area for a full-stack TypeScript SPA that stays type-safe end-to-end.

## Slide 4 — AI Closes the Loop with E2E Tests

Two layers of AI self-validation, both living in the same repo:

Because everything — server, client, types, tests — lives in the same project, AI can generate the e2e test from the same context it used to write the feature.

One prompt:

> _"Write a Playwright test that creates a product and verifies it appears in the list."_

AI already knows the routes, the form fields, the expected response shape. It doesn't guess. It reads the types.
