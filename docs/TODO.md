# Project TODO List

This list outlines the tasks required to implement the Weekly Time Allocation Pie-Chart project based on the PRD and Cursor Rules.

## Phase 0: Setup & Foundation (Day 1 Target)

- [x] Initialize Next.js 15.3 project: `bun create next-app@latest`
- [x] Create `docs` directory with a TODO list.
- [ ] Install UI component library
    - [ ] `shadcn-ui` (CLI: `bunx --bun shadcn@latest init`)
    - [ ] Add necessary `shadcn-ui` components (CLI: `bunx --bun shadcn@latest add button`)
- [ ] For charting use shadcn-ui (`bunx --bun shadcn@latest add chart`)
- [ ] Install Backend & Data Dependencies:
    - [ ] `drizzle-orm`, `drizzle-kit`
    - [ ] `@neondatabase/serverless`, `pg`
    - [ ] `@upstash/redis` (for rate limiting)
    - [ ] `zod` (for validation)
    - [ ] `better-auth` (core package and providers: X, GitHub, Google)
- [ ] Install Vercel Integration Dependencies:
    - [ ] `@vercel/analytics`
    - [ ] `@vercel/og`
- [ ] Configure Tailwind CSS v4.x (`globals.css`, not `tailwind.config.js` file).
- [ ] Initialize `shadcn-ui` components (e.g., button, input, label, card).
- [ ] Set up Vercel project.
- [ ] Create Neon database project and obtain connection string.
- [ ] Create Upstash Redis database and obtain URL/token.
- [ ] Set up BetterAuth application configurations for X, GitHub, Google.
- [ ] Store secrets (Neon, Upstash, Auth providers) securely in Vercel environment variables (local `.env.local` for dev).
- [ ] Create initial `README.md` with basic setup instructions.

## Phase 1: MVP Core Functionality (Day 3 Target)

- [ ] **App Layout:**
    - [ ] Create root layout (`/app/layout.tsx`) with basic structure, theme provider (default dark), and Vercel Analytics integration (`@vercel/analytics/react`).
    - [ ] Create main page (`/app/page.tsx`).
- [ ] **State Management:**
    - [ ] Define state structure for activities (id, name, value, color) using React hooks (`useState`, `useReducer`).
    - [ ] Define state for input mode (hours/percentage).
- [ ] **Input Form Component (`components/input-form.tsx`):**
    - [ ] Implement `ActivityRow` sub-component (`components/activity-row.tsx`) with inputs (name, value), color picker (`react-colorful`), remove button, drag handle.
    - [ ] Map activity state to render rows.
    - [ ] Implement "Add Activity" button functionality.
    - [ ] Implement "Remove Activity" button functionality per row.
    - [ ] Implement logic for updating activity name and value state.
    - [ ] Implement Hours/Percentage toggle button/switch group.
    - [ ] Implement value conversion logic when toggling mode (AC-3).
    - [ ] Implement input validation (numeric, ≤ 1 decimal, total <= 100% or 168h). Display inline errors if needed.
- [ ] **Pie Chart Component (`components/pie-chart.tsx`):**
    - [ ] Integrate Recharts `<PieChart>`, `<Pie>`, `<Cell>`.
    - [ ] Set `innerRadius={0}`.
    - [ ] Pass activity data (name, value, color) from state to the chart.
    - [ ] Ensure chart updates in real-time as form values change.
    - [ ] Use `<Cell>` for applying individual slice colors based on activity state.
- [ ] **Progress Bar Component (`components/progress-bar.tsx`):**
    - [ ] Calculate total hours/percentage from activity state.
    - [ ] Determine quota (168h or 100%).
    - [ ] Render visual progress bar.
    - [ ] Implement color coding: amber (< quota), green (= quota), red (> quota) (AC-6).
    - [ ] Ensure bar updates based on mode (Hours/Percentage) and values.
- [ ] **Basic Sharing (URL Encoding):**
    - [ ] Define JSON structure for chart data.
    - [ ] Implement serialization function (`lib/encoding.ts`?): `JSON.stringify` -> compress -> `base64url`.
    - [ ] Implement deserialization function.
    - [ ] Implement "Generate Link" button:
        - [ ] Serialize current activity state.
        - [ ] Navigate user to `/share/[encodedData]`.
    - [ ] Create share page (`/app/share/[id]/page.tsx`):
        - [ ] Read `id` param (treat as encoded data for now).
        - [ ] Deserialize data.
        - [ ] Pass deserialized data to `PieChart` and `ChartLegend` components.
        - [ ] Add a "Create your own" CTA linking back to `/`.
- [ ] **Basic Legend Component (`components/chart-legend.tsx`):**
    - [ ] Display list/grid of activities with color swatch and name.
    - [ ] Fetch data from activity state.

## Phase 2: Polishing & UX Refinements (Day 5 Target)

- [ ] **Chart Enhancements:**
    - [ ] Implement external labels with leader lines for slices ≥ 3%.
    - [ ] Implement hover effect to highlight slices.
    - [ ] Implement tooltip showing activity name, absolute value (hours), and percentage on hover.
- [ ] **Input Form Enhancements:**
    - [ ] Integrate drag-and-drop reordering (AC-4).
        - [ ] Ensure visual feedback during drag (placeholder).
        - [ ] Update activity state order on drop.
        - [ ] Test on desktop (mouse) and mobile (touch/long-press).
    - [ ] Ensure color picker changes update slice/legend color immediately (AC-5).
- [ ] **UI/UX:**
    - [ ] Implement responsive layout (form below chart on `md+` screens).
    - [ ] Ensure tap targets ≥ 44px.
    - [ ] Implement sticky "Generate Link" button on small screens.
    - [ ] Apply project aesthetic (rounded corners, subtle background?).
    - [ ] Add dark/light mode toggle and ensure components adapt.
    - [ ] Animate progress bar width changes.
- [ ] **Accessibility (Initial Pass):**
    - [ ] Basic keyboard navigation for form, buttons.
    - [ ] Semantic HTML review.
    - [ ] Check initial color contrasts.

## Phase 3: Sharing & OG Image (Day 6 Target)

- [ ] **Vercel OG Image Generation:**
    - [ ] Create API route for OG images (`/app/api/og/route.ts`?).
    - [ ] Design React component(s) to render the pie chart visually for Satori (`@vercel/og`).
    - [ ] Implement logic in API route to:
        - [ ] Accept chart data (encoded string or potentially DB ID later).
        - [ ] Deserialize/fetch data.
        - [ ] Pass data to the OG rendering component.
        - [ ] Return image response using `ImageResponse`.
- [ ] **Dynamic OG Tags:**
    - [ ] Implement `generateMetadata` in `/app/share/[id]/page.tsx`.
    - [ ] Construct `og:image` URL pointing to the `/api/og` route with appropriate data param.
    - [ ] Add other relevant meta tags (`og:title`, `og:description`, `twitter:card`, etc.). (AC-8)
- [ ] **Share Functionality:**
    - [ ] Implement "Share on X" button:
        - [ ] Generate the correct share URL (`/share/[idOrEncodedData]`).
        - [ ] Construct X intent URL (`https://twitter.com/intent/tweet?...`) with pre-populated text and URL.
    - [ ] Implement "Copy Link" button functionality.

## Phase 4: Analytics & Error Handling (Day 7 Target)

- [ ] Verify Vercel Analytics integration is capturing page views.
- [ ] Add basic client-side error boundary (`error.tsx`) for key areas (e.g., chart rendering).
- [ ] (Stretch) Add specific event tracking if Vercel Analytics isn't sufficient (e.g., `share_click`, `mode_switch`). Consider Posthog if needed.
- [ ] (Stretch) Integrate Sentry or similar for error monitoring.

## Phase 5: Database Persistence & Auth (Optional - Day 9 Target)

- [ ] **Database Schema & Migrations:**
    - [ ] Define Drizzle schema (`db/schema.ts`) for `charts` table (id, user\_id/session\_id, data JSON, createdAt). Consider userAgentHash if sticking strictly to PRD v2 spec.
    - [ ] Set up `drizzle-kit` configuration (`drizzle.config.ts`).
    - [ ] Generate initial migration: `bun drizzle-kit generate`.
    - [ ] Apply migration to Neon DB: `bun drizzle-kit push` (or integrate with Vercel deployment).
- [ ] **BetterAuth Integration:**
    - [ ] Set up BetterAuth provider components and hooks.
    - [ ] Add Login/Logout buttons/UI elements.
    - [ ] Protect relevant actions/pages based on auth state.
- [ ] **API Endpoints:**
    - [ ] Implement `POST /api/charts` route (`/app/api/charts/route.ts`):
        - [ ] Integrate Upstash Redis client for rate limiting (IP-based, ≤ 10/hour). Return 429 on limit exceeded (AC-9).
        - [ ] Add check for user authentication status via BetterAuth.
        - [ ] Validate request body (chart data JSON) using Zod.
        - [ ] If authenticated, use Drizzle client to insert chart data into Neon DB (AC-10). Return the new chart's numeric ID.
        - [ ] Handle potential DB errors.
    - [ ] Implement `GET /api/charts/[id]` route (`/app/api/charts/[id]/route.ts`):
        - [ ] Validate `id` parameter (must be numeric).
        - [ ] Use Drizzle client to fetch chart data by ID from Neon DB.
        - [ ] Return JSON data or 404 if not found.
- [ ] **Update Frontend Logic:**
    - [ ] Modify "Generate Link" button:
        - [ ] Check auth status.
        - [ ] If authenticated, `POST` to `/api/charts`, then navigate to `/share/[numericId]`.
        - [ ] If guest, fallback to generating `/share/[encodedData]` URL (as per Rule 2).
    - [ ] Modify `/app/share/[id]/page.tsx`:
        - [ ] Check if `id` param is numeric or string.
        - [ ] If numeric, fetch data via `GET /api/charts/[id]`. Handle loading/error states.
        - [ ] If string, deserialize data from URL.
    - [ ] Modify `/app/api/og/route.ts`:
        - [ ] Accept both numeric ID and encoded data string.
        - [ ] Fetch from DB if ID is numeric, otherwise deserialize.

## Phase 6: Final Polish & Testing

- [ ] **Interesting Facts Engine:**
    - [ ] Implement calculation logic (`lib/facts.ts`?) for default facts (largest/smallest slice, sleep/work/productive totals - define categories).
    - [ ] Implement display component (`components/interesting-facts.tsx`).
    - [ ] Display facts on the `/share/[id]` page.
- [ ] **Testing:**
    - [ ] Execute "Happy Path Test Plan" from Cursor Rules.
    - [ ] Manual testing across target browsers (latest 2 versions + mobile webview).
    - [ ] Test drag-and-drop thoroughly on mobile.
    - [ ] Test rate limiting for `POST /api/charts`.
    - [ ] Test OG image generation by pasting links in X/Discord/Slack.
- [ ] **Accessibility (Final Pass):**
    - [ ] Full keyboard navigation audit.
    - [ ] Screen reader testing (VoiceOver/NVDA).
    - [ ] Run accessibility checkers (e.g., Axe DevTools).
    - [ ] Address any remaining contrast issues. Target A11y ≥ 90 (AC-2).
- [ ] **Performance:**
    - [ ] Run Lighthouse audits on `/` and `/share/[id]` (mobile). Target Performance ≥ 90 (AC-2).
    - [ ] Optimize component rendering (memoization).
    - [ ] Analyze bundle size.
- [ ] **Code Quality:**
    - [ ] Ensure all code passes ESLint and Prettier checks (AC-3).
    - [ ] Ensure strict TypeScript compliance (`noImplicitAny`, etc.).
    - [ ] Review code for clarity, maintainability, and adherence to Conventional Commits.
    - [ ] Ensure no secrets are committed (AC-11).
- [ ] **Documentation:**
    - [ ] Update `README.md` with final setup, run, and deployment instructions.
    - [ ] Update `docs/TODO.md` (this file) by checking off completed items.

## Post-Launch / Future

- [ ] Address Open Questions from PRD.
- [ ] Implement Stretch Ideas (Leaderboard, Compare Mode, Export, AI Coach, Embed).
- [ ] Add i18n framework.
- [ ] Implement light theme OG images if decided.
- [ ] Add legal copy if needed. 
