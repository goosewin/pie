# V1 TODO List: Enhancing Viral Factor

This TODO list focuses on implementing features to increase the app's virality and user engagement, building upon the initial MVP.

## I. Core Authentication & User Experience

- [ ] **Fix Sign-In Functionality (High Priority)**
    - [ ] Diagnose and resolve issues with BetterAuth integration (X, GitHub, Google).
    - [ ] Ensure users can reliably sign in and out.
- [ ] **Mandatory Sign-In**
    - [ ] Modify application flow to require user sign-in before accessing core chart creation features.
    - [ ] Gate the main page (`/`) or relevant components, redirecting unauthenticated users to a sign-in page.
    - [ ] Review and remove guest fallback for URL-encoded sharing if sign-in becomes strictly mandatory for chart creation/sharing (PRD implies guest fallback, this is a change).
- [ ] **Personalized Chart Display**
    - [ ] Fetch authenticated user's nickname/handle (e.g., from BetterAuth profile).
    - [ ] Update the chart panel UI to display "@nickname's week" instead of "Your Week".
- [ ] **Force Light Theme**
    - [ ] Remove dark mode option and theme toggle (PRD mentions dark mode default + toggle, this is a change).
    - [ ] Set light theme as the default and only theme in `globals.css` and theme provider.
    - [ ] Ensure all components render correctly in light theme.

## II. Enhanced Sharing Mechanics

- [ ] **Revamp "Share" Functionality & UI**
    - [ ] Change button text from "Generate Share Link" to "Share".
    - [ ] On "Share" click, instead of direct navigation, open a modal or dedicated "Share Configuration" view. This view will:
        - [ ] Display the final chart preview.
        - [ ] Offer the option to copy the shareable link.
        - [ ] Include the "Download Chart Image" button (see section III).
        - [ ] Provide quick share buttons for social platforms (e.g., "Share on X").
        - [ ] Potentially allow minor edits to the chart *before* finalizing the share (this addresses "editing a shared page" by allowing edits *before* the immutable link is widely distributed).
- [ ] **Improved Shareable Links (Human-Readable & Short)**
    - [ ] Ensure all shared charts are persisted to the Neon database, associated with the authenticated user. This is critical as sign-in is now mandatory.
    - [ ] Use short, stable, and clean URLs for shared charts (e.g., `/s/[numericChartId]` or `/pie/[numericChartId]`). The PRD mentions `/share/[id]`.
    - [ ] Update the share page (e.g., `/app/s/[id]/page.tsx` or `/app/pie/[id]/page.tsx`) to fetch chart data based on the numeric ID from the DB. This page is for consumption.
    - [ ] Ensure `generateMetadata` for the share page uses the new URL structure for OG tags.
- [ ] **"Share on X" Button**
    - [ ] Ensure this button uses the newly generated short, persisted URL.
    - [ ] Pre-populate tweet text as per PRD: `"Here's how I spend my week ⬇️  Make yours ➡️ {appURL}"` (where `{appURL}` is the shareable link to their chart).

## III. Chart Download & Branding

- [ ] **Download Chart Image Functionality**
    - [ ] Implement functionality to download the current pie chart view (as rendered on screen) as an image (e.g., PNG).
    - [ ] Add a "Download Chart" button:
        - [ ] On the main chart creation interface.
        - [ ] In the new "Share Configuration" view/modal.
- [ ] **Chart Image Watermark**
    - [ ] Define watermark style: "PIE.GOOSEWIN.COM" using app title typography, placed subtly.
    - [ ] Integrate watermark into the downloaded chart image.
    - [ ] **Primary Method**: Modify Vercel OG image generation (`/app/api/og/route.tsx`) to include this watermark. This ensures the OG image shared on social media *also* has the watermark.
    - [ ] **Fallback/Client-side Download**: If client-side rendering is used for the "Download Chart" button (e.g. html2canvas), implement watermark addition there too. Consistency with OG image is key.

## IV. System Updates & Refinements

- [ ] **API Endpoint Adjustments (`/api/charts`)**
    - [ ] `POST /api/charts`:
        - [ ] Must require authentication.
        - [ ] Associate chart with `userId` from BetterAuth.
        - [ ] Return the new numeric ID for the chart.
    - [ ] `GET /api/charts/[id]`:
        - [ ] Fetch by numeric ID.
        - [ ] This endpoint will be used by the share page (`/s/[id]`).
- [ ] **Vercel OG Image Generation (`/app/api/og/route.tsx`)**
    - [ ] Update to fetch chart data using the numeric ID.
    - [ ] Incorporate the "PIE.GOOSEWIN.COM" watermark into the generated OG image.
- [ ] **Database (`db/schema.ts`)**
    - [ ] Ensure `charts` table has a clear `userId` field linking to your users table (managed by BetterAuth or a related users table).
    - [ ] Confirm data model supports all information needed for chart rendering and facts.
- [ ] **Rate Limiting (Upstash)**
    - [ ] With mandatory sign-in, `POST /api/charts` should still be rate-limited per user (or by IP if user-specific is too complex initially) to prevent abuse (AC-9: 10 POSTs/IP/hour).

## V. Documentation & Review

- [ ] **Update PRD/Cursor Rules**:
    - [ ] Reflect mandatory sign-in (removes guest fallback).
    - [ ] Reflect light-theme-only decision.
    - [ ] Clarify new "Share" button behavior and share configuration step.
    - [ ] Update share URL structure if changed (e.g. `/s/[id]`).
- [ ] **Code Cleanup**:
    - [ ] Remove any code related to dark mode / theme toggling.
    - [ ] Remove old URL encoding/decoding logic for guest shares if fully deprecated.
- [ ] **Test Plan Update**:
    - [ ] Add test cases for new sign-in flow.
    - [ ] Test new sharing flow, including link generation, OG image, and download with watermark.
    - [ ] Verify light theme is applied consistently.

This list prioritizes the requested viral features and addresses necessary system modifications.
