# Project MVP TODO List

This list outlines the tasks required to implement the Weekly Time Allocation Pie-Chart project based on the PRD and Cursor Rules.

## Phase 0: Setup & Foundation

- [x] Initialize Next.js 15.3 project: `bun create next-app@latest`
- [x] Create `docs` directory with a TODO list.
- [x] Install UI component library
    - [x] `shadcn-ui` (CLI: `bunx --bun shadcn@latest init`)
    - [x] Add necessary `shadcn-ui` components (CLI: `bunx --bun shadcn@latest add button`)
- [x] For charting use shadcn-ui (`bunx --bun shadcn@latest add chart`)
- [x] Install Backend & Data Dependencies:
    - [x] `drizzle-orm`, `drizzle-kit`
    - [x] `@neondatabase/serverless`, `pg`
    - [x] `@upstash/redis` (for rate limiting)
    - [x] `zod` (for validation)
    - [x] `better-auth` (core package and providers: X, GitHub, Google)
- [x] Install Vercel Integration Dependencies:
    - [x] `@vercel/analytics`
    - [x] `@vercel/og`
- [x] Configure Tailwind CSS v4.x (`globals.css`, not `tailwind.config.js` file).
- [x] Initialize `shadcn` components (e.g., button, input, label, card).
- [x] Set up Vercel project.
- [x] Create Neon database project and obtain connection string.
- [x] Create Upstash Redis database and obtain URL/token.
- [x] Set up BetterAuth application configurations for X, GitHub, Google.
- [x] Store secrets (Neon, Upstash, Auth providers) securely in Vercel environment variables (local `.env.local` for dev).
- [x] Create initial `README.md` with basic setup instructions.
- [x] Create `.env.example` with all the required environment variables.

## Phase 1: MVP Core Functionality

- [x] **App Layout:**
    - [x] Create root layout (`/app/layout.tsx`) with basic structure, theme provider (default dark), and Vercel Analytics integration (`@vercel/analytics/react`).
    - [x] Create main page (`/app/page.tsx`).
- [x] **State Management:**
    - [x] Define state structure for activities (id, name, value, color) using React hooks (`useState`, `useReducer`).
    - [x] Define state for input mode (hours/percentage).
- [x] **Input Form Component (`components/input-form.tsx`):**
    - [x] Implement `ActivityRow` sub-component (`components/activity-row.tsx`) with inputs (name, value), color picker (`react-colorful`), remove button, drag handle.
    - [x] Map activity state to render rows.
    - [x] Implement "Add Activity" button functionality.
    - [x] Implement "Remove Activity" button functionality per row.
    - [x] Implement logic for updating activity name and value state.
    - [x] Implement Hours/Percentage toggle button/switch group.
    - [x] Implement value conversion logic when toggling mode (AC-3).
    - [x] Implement input validation (numeric, ≤ 1 decimal, total <= 100% or 168h). Display inline errors if needed.
- [x] **Pie Chart Component (`components/pie-chart.tsx`):**
    - [x] Integrate Recharts `<PieChart>`, `<Pie>`, `<Cell>`.
    - [x] Set `innerRadius={0}`.
    - [x] Pass activity data (name, value, color) from state to the chart.
    - [x] Ensure chart updates in real-time as form values change.
    - [x] Use `<Cell>` for applying individual slice colors based on activity state.
- [x] **Progress Bar Component (`components/progress-bar.tsx`):**
    - [x] Calculate total hours/percentage from activity state.
    - [x] Determine quota (168h or 100%).
    - [x] Render visual progress bar.
    - [x] Implement color coding: amber (< quota), green (= quota), red (> quota) (AC-6).
    - [x] Ensure bar updates based on mode (Hours/Percentage) and values.
- [x] **Basic Sharing (URL Encoding):**
    - [x] Define JSON structure for chart data.
    - [x] Implement serialization function (`lib/encoding.ts`?): `JSON.stringify` -> compress -> `base64url`.
    - [x] Implement deserialization function.
    - [x] Implement "Generate Link" button:
        - [x] Serialize current activity state.
        - [x] Navigate user to `/share/[encodedData]`.
    - [x] Create share page (`/app/share/[id]/page.tsx`):
        - [x] Read `id` param (treat as encoded data for now).
        - [x] Deserialize data.
        - [x] Pass deserialized data to `PieChart` and `ChartLegend` components.
        - [x] Add a "Create your own" CTA linking back to `/`.
- [x] **Basic Legend Component (`components/chart-legend.tsx`):**
    - [x] Display list/grid of activities with color swatch and name.
    - [x] Fetch data from activity state.

## Phase 2: Polishing & UX Refinements

- [x] **Chart Enhancements:**
    - [x] Implement external labels with leader lines for slices ≥ 3%.
    - [x] Implement hover effect to highlight slices.
    - [x] Implement tooltip showing activity name, absolute value (hours), and percentage on hover.
- [~] **Input Form Enhancements:**
    - [~] Integrate drag-and-drop reordering (AC-4). // Implemented with @dnd-kit.
        - [x] Ensure visual feedback during drag (placeholder). // opacity/z-index via isDragging in ActivityRow.
        - [x] Update activity state order on drop. // Done via onDragEnd in InputForm.
        - [ ] Test on desktop (mouse). // Needs verification post @dnd-kit implementation.
        - [ ] Test and ensure functionality on mobile (long-press). // Needs verification post @dnd-kit implementation.
    - [x] Ensure color picker changes update slice/legend color immediately (AC-5).
- [x] **UI/UX:**
    - [x] Implement responsive layout (form below chart on `md+` screens).
    - [x] Ensure tap targets ≥ 44px.
    - [x] Implement sticky "Generate Link" button on small screens.
    - [x] Apply project aesthetic (rounded corners, subtle background?).
    - [x] Add dark/light mode toggle and ensure components adapt.
    - [x] Animate progress bar width changes.
- [~] **Accessibility (Initial Pass):**
    - [~] Basic keyboard navigation for form, buttons.
    - [~] Semantic HTML review.
    - [~] Check initial color contrasts.

## Phase 3: Sharing & OG Image

- [x] **Vercel OG Image Generation:**
    - [x] Create API route for OG images (`/app/api/og/route.tsx`).
    - [x] Design React component(s) to render the pie chart visually for Satori (`@vercel/og`). // SVG chart, legend, and basic in-slice labels implemented.
    - [x] Implement logic in API route to:
        - [x] Accept chart data (encoded string or potentially DB ID later). // Done via searchParam 'data'
        - [x] Deserialize/fetch data. // Done
        - [x] Pass data to the OG rendering component. // Done
        - [x] Return image response using `ImageResponse`. // Done
- [x] **Dynamic OG Tags:**
    - [x] Implement `generateMetadata` in `/app/share/[id]/page.tsx`. // Done
    - [x] Construct `og:image` URL pointing to the `/api/og` route with appropriate data param. // Done in generateMetadata
    - [x] Add other relevant meta tags (`og:title`, `og:description`, `twitter:card`, etc.). (AC-8) // Done in generateMetadata
- [x] **Share Functionality:**
    - [x] Implement "Share on X" button:
        - [x] Generate the correct share URL (`/share/[idOrEncodedData]`). // Done
        - [x] Construct X intent URL (`https://twitter.com/intent/tweet?...`) with pre-populated text and URL. // Done
    - [x] Implement "Copy Link" button functionality. // Done

## Phase 4: Analytics & Error Handling

- [~] Verify Vercel Analytics integration is capturing page views. // (<Analytics /> component is in layout.tsx; verification post-deployment)
- [x] Add basic client-side error boundary (`error.tsx`) for key areas (e.g., chart rendering). // Global app/error.tsx created
- [x] Add specific event tracking via Vercel Analytics (e.g., `add_category`, `value_change`, `mode_switch`, `share_click`, `application_error`).

## Phase 5: Database Persistence & Auth

- [x] **Database Schema & Migrations:**
    - [x] Define Drizzle schema (`db/schema.ts`) for `charts` table (id, user_id/session_id, data JSON, createdAt). Consider userAgentHash if sticking strictly to PRD v2 spec.
    - [x] Set up `drizzle-kit` configuration (`drizzle.config.ts`).
    - [x] Generate initial migration: `bun drizzle-kit generate`.
    - [x] Apply migration to Neon DB: `bun drizzle-kit push`.
- [x] **BetterAuth Integration:**
    - [x] Set up BetterAuth provider components and hooks.
    - [x] Implement Login/Logout UI elements.
    - [x] Protect relevant actions/API routes if user is not authenticated (e.g., saving a chart to DB).
- [x] **API Endpoints:**
    - [x] Implement `POST /api/charts` route (`/app/api/charts/route.ts`):
        - [x] Integrate Upstash Redis client for rate limiting (IP-based, ≤ 10/hour). Return 429 on limit exceeded (AC-9).
        - [x] Add check for user authentication status via BetterAuth.
        - [x] Validate request body (chart data JSON) using Zod.
        - [x] If authenticated, use Drizzle client to insert chart data into Neon DB (AC-10). Return the new chart's numeric ID.
        - [x] Handle potential DB errors.
    - [x] Implement `GET /api/charts/[id]` route (`/app/api/charts/[id]/route.ts`):
        - [x] Validate `id` parameter (must be numeric).
        - [x] Use Drizzle client to fetch chart data by ID from Neon DB.
        - [x] Return JSON data or 404 if not found.
- [x] **Update Frontend Logic:**
    - [x] Modify "Generate Link" button:
        - [x] Check auth status.
        - [x] If authenticated, `POST` to `/api/charts`, then navigate to `/share/[numericId]`.
        - [x] If guest, fallback to generating `/share/[encodedData]` URL (as per Rule 2).
    - [x] Modify `/app/share/[id]/page.tsx`:
        - [x] Check if `id` param is numeric or string.
        - [x] If numeric, fetch data via `GET /api/charts/[id]`. Handle loading/error states.
        - [x] If string, deserialize data from URL.
    - [x] Modify `/app/api/og/route.ts`:
        - [x] Accept both numeric ID and encoded data string.
        - [x] Fetch from DB if ID is numeric, otherwise deserialize.

## Phase 6: Final Polish & Testing

- [x] **Interesting Facts Engine:**
    - [x] Implement calculation logic (`lib/facts.ts`) for default facts (largest/smallest slice, sleep/work/productive totals - define categories).
    - [x] Implement display component (`components/interesting-facts.tsx`).
    - [x] Display facts on the `/share/[id]` page. // Done via SharePageClient.tsx
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
