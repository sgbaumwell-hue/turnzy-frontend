# Design brief — Host Settings: Properties & Cleaners

**Purpose:** hand this document to Claude Design as input for a redesign of the Properties and Cleaners pages within the host settings area. It describes the current behavior exhaustively so a new design can replace it without missing functionality.

**Product context:** Turnzy is a short-term-rental turnover coordination app. A "host" owns one or more properties, each property is booked on a platform (Airbnb, VRBO, direct), and each property has a cleaner assigned to handle turnovers between guests. The Properties and Cleaners pages are how the host configures that infrastructure.

---

## Shared context (applies to both pages)

### Where they live

- **Routes:** `/settings/properties`, `/settings/cleaners`
- **Parent layout:** `SettingsLayout` at `/settings` (wraps all host settings pages)
- **Settings siblings** (shown in the sidebar under "Settings" group): Properties, Cleaners, Notifications, Billing, Account
- **Auth:** both pages require `role: 'host'` or `role: 'admin'`

### Sidebar entry

- Left sidebar has a "Settings" group with five items: Properties (`Building2` icon), Cleaners (`Users` icon), Notifications (`Bell` icon), Billing (`CreditCard` icon), Account (`User` icon). Each is a 14px sub-nav link with coral-pill active state.

### Settings shell behavior

- **Desktop (≥768px):** `SettingsLayout` renders an `<Outlet />` in a full-height main pane. Most settings sections get a centered `max-w-4xl` content area with `px-8 py-8` padding, but Properties and Cleaners are classified as "full-height pages" — they render edge-to-edge with no outer padding, because they own their own two-pane list+detail layout.
- **Mobile (<768px):** settings root shows a single-column menu with title "Settings" and 5 rows, each with icon + label + description + chevron. Tapping a row navigates into that section. Properties and Cleaners, being full-height pages, also render edge-to-edge on mobile (no default back-arrow header — each page supplies its own).
- Toast provider wraps all settings pages; `useToast()` fires transient success/error notifications from any handler.

### Data source (both pages share one query)

Both pages read from `useQuery({ queryKey: ['properties'], queryFn: propertiesApi.getAll })` and invalidate the same key on every mutation. Property shape from the backend:

```ts
type Property = {
  id: string;
  name: string;
  platform: 'Airbnb' | 'VRBO' | 'Other';
  ical_url: string | null;
  default_checkout_time: string | null; // "HH:MM" 24h
  default_checkin_time: string | null;  // "HH:MM" 24h
  timezone: string | null; // e.g. "America/New_York"

  // Primary cleaner
  cleaner_name: string | null;
  cleaner_email: string | null;
  cleaner_user_id: string | null;  // set when invite is accepted
  cleaner_confirmed: boolean;       // true = Active, false = Invite sent

  // Backup cleaner (same shape, optional)
  backup_cleaner_name: string | null;
  backup_cleaner_email: string | null;
  backup_cleaner_user_id: string | null;
};
```

A **cleaner** is derived from properties — they don't have their own top-level endpoint. The Cleaners page calls `buildCleanerList(properties)` which groups property rows by `cleaner_email` (lowercased) into cleaner records.

### Visual tokens in play

- **Fonts:** `Manrope` sans for everything (Fraunces is loaded but not yet consumed).
- **Palette names:** `coral-*`, `amber-*`, `sage-*`, `sky-*`, `danger-*`, `warm-50`/`100`/`200`/`300`/`400`/`600`/`800`. A lot of the two pages still use generic `gray-*` / `red-*` / `green-*` — this is tech debt; a redesign should normalize onto the warm/coral/etc. palette.
- **Radii:** `rounded`, `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), `rounded-pill` (20px).
- **Shadows:** mostly borderless, `shadow-xl` for the delete modal only.
- **Property color dots:** a shared convention across both pages. 6 fixed Tailwind classes — `bg-coral-400`, `bg-sky-400`, `bg-emerald-400`, `bg-violet-400`, `bg-amber-400`, `bg-rose-400` — selected by `index % 6`. Used as a 2px dot next to every property mention anywhere on either page. Currently the dot palette is duplicated in two files.

---

## Page 1 — Properties settings (`/settings/properties`)

### Purpose

A host lands here to manage the basic configuration of each property they own: its display name, which booking platform feeds it, its calendar (iCal URL), its default check-in/checkout times, timezone, and which cleaner(s) cover it.

### Two-pane layout (desktop ≥1024px)

- **Left column — list pane:** fixed width `280px`, white background, right border `1px` warm-200. Height fills viewport.
- **Right column — detail pane:** fills remaining width. Light warm-50 background when a property is selected; otherwise shows a centered "Select a property to view settings" placeholder.
- Panes are siblings in a flex container; neither scrolls the other. Each has its own internal scroll.

### Mobile (<1024px)

- Only one pane visible at a time.
- List occupies the full viewport by default. Selecting a property mounts the detail pane as `fixed inset-0 z-30` overlay with an explicit back arrow in its header.

### List pane

#### Header
- Fixed header strip: `px-4 pt-5 pb-2`. Title "Properties" — 16px semibold gray-900. No secondary actions.

#### List rows
- Scrollable. Each row is a full-width `button`:
  - `px-4 py-3` padding, `flex items-center gap-2`.
  - 2px color dot on the left (property palette, see above).
  - Property name — 13px medium gray-900, truncated.
  - Right side: calendar-status pill + cleaner-status dot.
    - **Calendar pill** (`text-[10px]` semi-bold, rounded): three states:
      - `⚠ No calendar` — amber-100 bg, amber-700 text (when `ical_url` is falsy)
      - `Test` — amber-100 bg, amber-700 text (when url contains "fake-ical" or "test")
      - `Connected` — green-100 bg, green-700 text (otherwise)
    - **Cleaner dot** — 2px round: green-500 (confirmed primary), amber-bordered (invite sent), gray-200 (no cleaner).
- Active row: left border `2px` coral-500, background coral-50. Inactive: hover gray-50.
- Below the last row, a sticky **"+ Add property"** button — coral-400, 13px, 14px `Plus` icon on left. Clicking opens the `AddPropertyModal`.

#### Empty state (no properties at all)
- Centered, full-pane. 64px circle orange-50 with `Home` icon orange-400. Title "No properties yet". Body "Add your first property to get started." Button "Add property" with `Plus` icon.

#### Loading state
- Plain text "Loading properties..." left-aligned, gray-400, 14px, with `p-6` padding. Nothing fancy; no skeletons used.

### Detail pane (the `PropertyPanel`)

Mounted when a property is selected. If mobile, arrives via `fixed inset-0` overlay.

#### Header (fixed)
- White background, `px-5 py-4`, bottom border gray-100.
- On mobile: back arrow button on left (24px `ArrowLeft`, gray-500).
- **Name area**:
  - Default state: color dot + property name (17px semibold, truncate) + edit pencil icon (12px, gray-400).
  - Edit state: inline `Input` (8-tall, 15px semibold), Save button, X cancel button. Enter saves, Escape cancels.
- **Status chips row** (below name): small Platform pill ("Airbnb" / "VRBO" / "Other" — 11px, gray-100 bg) + Calendar-status pill (same as the list pill).

#### Body (scrollable)

Vertical stack of `section` blocks, each `py-5 px-5`, separated by gray-100 dividers.

Each section starts with a `SectionHead` — 12px semibold gray-400 uppercase-tracking label.

1. **Calendar**
   - **Connected + not editing:** shows URL (truncated, 12px gray-500) + small Copy button (13px `Copy` icon → becomes green `Check` icon for 2 seconds after click). Below: row of three small outline buttons — "Edit URL", "Disconnect" (red-600 text, red-200 border), "Test calendar" (blue-600 text, blue-300 border).
   - **Editing:** `Input` for URL + "Save" primary + "Cancel" outline. On blur, auto-detects platform from URL ("airbnb.com" → Airbnb, "vrbo.com"/"homeaway.com" → VRBO).
   - **Not connected:** single outline button "🔗 Connect calendar".
   - Disconnect uses `window.confirm()` ← UX wart worth redesigning away.

2. **Schedule** — two 28px-tall time inputs side-by-side: "Checkout" (default 11:00), "Check-in" (default 15:00). When either is dirty, a "Save times" button appears below. A `TimeWarning` renders if `check-in ≤ checkout`: amber-600 text, "⚠ The cleaning window between checkout and check-in appears very short or zero…"

3. **Timezone** — single `<select>` showing 7 US timezones (Eastern through Hawaii). Label-less inputs, saves on change. `max-w-xs`.

4. **Platform** — single `<select>`: Airbnb / VRBO / Other. Saves on change. `max-w-xs`.

5. **Cleaning team**
   - **Primary** sub-section:
     - Label "PRIMARY" (10px gray-400).
     - If assigned: name (13px medium) + status chip ("Active" green-100 / "Invite sent" amber-100) + email (11px gray-400) + "Change" link + "Remove" link. "Change" shows `CleanerPicker` (inline dropdown of all other cleaners from the account, each a button with status dot). "Remove" flips to a red-50 inline confirm card.
     - If unassigned: "No cleaner assigned" + "Assign" link → `CleanerPicker`.
   - **Backup** sub-section (only shown if a primary exists):
     - Label "BACKUP" (10px gray-400).
     - If backup assigned: name + "Make primary" link (amber-50 confirm) + "Remove" link (red-50 confirm).
     - If not: "None" + "Add backup" link → `CleanerPicker`.
   - No explicit invite-resend button in this section (resend lives on the Cleaners page).

#### Actions noted as tech debt
- No "Delete property" button anywhere in the detail pane — you can only disconnect the calendar. There's no UX path to remove a property from the host's account.
- The status chip color pair is inconsistent: calendar pill uses `bg-green-100 text-green-700` while cleaner confirmation uses the same, but "Invite sent" uses `bg-amber-100 text-amber-700` (wartily the same in both pages, neither mapped to the design system).

### Add Property modal

Opened from the left-pane "+ Add property" button. A 3-step wizard (stored in `sessionStorage` so it survives reloads):

1. **Step 1 — Name + platform.** Text input for name, radio/select for Airbnb/VRBO/Other.
2. **Step 2 — Connect calendar.** iCal URL input; option to create a test calendar. Skip is allowed.
3. **Step 3 — Assign cleaner.** If the host has no existing cleaners, prompts to invite one. If they have one or more, offers to pick from the list or skip. Has "Add another property" option after save.

Modal chrome: `StepDots` at top (3 dots: current = coral-400, complete = coral-200, future = warm-200), centered on a white card with shadow-xl, click-outside closes.

### Known UX wart on Properties

- Calendar disconnect uses a native `window.confirm()` while cleaner removal uses an inline red-50 card — inconsistent.
- "Test calendar" button is exposed to all hosts in production even though it's a development helper.
- Primary/Backup cleaner language is terse; no indication of what "backup" actually does (it receives the job when the primary declines — unknown to the user).
- The whole page has no concept of property archival, inactive properties, or a "deleted" state.

---

## Page 2 — Cleaners settings (`/settings/cleaners`)

### Purpose

The host manages everyone they've invited as a cleaner. Unlike Properties, cleaners are derived from property assignments — a cleaner record exists because they're assigned to one or more properties. A cleaner can be "Active" (they accepted an invite and have a Turnzy account) or "Invited" (invite pending).

### Two-pane layout (desktop ≥1024px)

Identical structural approach to Properties: `280px` list + filled detail pane. Same mobile overlay model.

### List pane

#### Header
- `px-4 pt-5 pb-2`. Title "Cleaners" — 16px semibold.

#### Rows
- Each row: full-width button, `px-4 py-3 flex items-center gap-2`.
  - Two-line block on left: name (13px medium, truncated) above "{N} properties" / "{N} property" (11px gray-400).
  - Right: **status chip**:
    - "Active" — green-100 bg, green-700 text (when `userId && confirmed`)
    - "Invited" — amber-100 bg, amber-700 text (otherwise)
- Active row: left border `2px` coral-500, background coral-50.
- Below rows: "+ Add cleaner" — coral-400 14px, triggers the inline Add flow in the right pane.

#### Empty state (no cleaners at all, no add flow open)
- Centered, full-pane. 64px circle orange-50 + `Users` icon orange-400. Title "No cleaners yet". Body "Add your first cleaner to start coordinating turnovers." CTA "Add cleaner".

### Detail pane — `CleanerPanel`

#### Header (fixed)
- White bg, `px-5 py-4`, bottom border gray-100.
- Mobile: back arrow.
- Name/email (17px semibold, truncate) + status chip. If not Active, also a "Resend invite" link next to the chip (coral-400, 10px). Clicking resends to the primary property's invite.

#### Body (scrollable)

Sections separated by gray-100 dividers:

1. **Contact** — Name (14px medium) and Email (14px). Sub-caption under email: "Cannot change email after invite".

2. **Properties covered** — list of property rows, one per assignment:
   - Each row: color dot + property name + role chip ("primary" or "backup", 10px gray-400 gray-100 bg) + "Remove" link (red-500, right).
   - Clicking "Remove" flips the row into a red-50 inline confirm card with Confirm/Cancel buttons.
   - Below the list: **"+ Add property"** link (coral-400, 12px). Opens an inline dropdown listing the host's uncovered properties — clicking assigns this cleaner to that property (as backup if it already has a primary, else primary).
   - If the cleaner covers **zero properties**, a warning banner appears: "Not assigned to any property — assign one below" (amber-600 text, amber-50 bg).

3. **Notifications** — one line, static: "Notified by email". There is no per-cleaner notification channel setting.

4. **Danger zone** — red-labelled SectionHead + single outline button "Remove cleaner" (red-600 text, red-200 border, 13px `Trash2` icon). Clicking opens a **modal**:
   - White card, shadow-xl, max-w-sm, centered. Dark overlay `bg-black/40`.
   - "Remove {name}?" + explanation "This will remove {name} from all your properties. Any upcoming accepted bookings will revert to Needs Action and they'll be notified."
   - Two buttons — destructive "Remove cleaner" + outline "Cancel".

### Add Cleaner flow (inline, right pane)

Triggered by the "+ Add cleaner" link in the list. Not a modal; it replaces the right pane.

#### Guard
- If the host has **zero properties**, the flow short-circuits to a prompt: centered Users icon + "Add a property first" + outline "Go to Properties →" button. Navigates to `/settings/properties`.

#### Step 1 — Name + email
- Two text inputs: Name (autoFocus), Email.
- On email blur: validates format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) and calls `/auth/check-email?email=...`:
  - If exists → green-50 confirmation: "✓ {email} already has a Turnzy account. A connection request will be sent."
  - If new → gray-400 subcaption: "An invite email will be sent to {email} to join Turnzy."
- Sub-caption: "Notifications sent by email".
- Actions: "Send invite" (if host has **only 1 property**) / "Next" (if host has **>1 property**) + "Cancel".

#### Step 2 — Property selector (only if host has >1 property)
- Question: "Which properties should {name} cover?"
- List of property cards. Each:
  - `p-3 rounded-lg border-2`. Default `border-gray-200`; selected `border-coral-500 bg-coral-50`.
  - Color dot + name + (if no primary) "No cleaner assigned" on right.
  - When selected AND property already has a primary, expands to two radio options:
    - "Add as backup" (default)
    - "Replace as primary"
  - If "Add as backup" is selected but the property already has a backup, a warning text appears: "⚠ This property already has a backup. Adding {name} will replace them."
- Actions: "Send invite" primary + "Back" outline.

On submit, the flow iterates through selected properties and calls `updateCleaner` or `saveBackupCleaner` or replace logic depending on each property's current state. Fires a toast "Invite sent to {email}" and invalidates the query.

### Known UX warts on Cleaners

- **Derived data oddity:** a cleaner exists only as a consequence of being assigned to a property. You can't add a cleaner without simultaneously assigning them. There's no "cleaner pool" concept. Redesign could address this.
- **Property-selector matrix is complex.** Adding a cleaner who'll cover 3 properties, each with different cleaner states (some primary-empty, some primary-filled, some backup-filled), creates a lot of cognitive load in Step 2.
- **Role chip language is sparse.** "primary" / "backup" chips are lowercase, no visual differentiation beyond the word.
- **Resend invite** only resends to the cleaner's first property. If they have three pending invites on three properties, there's no way to resend for just one.
- **No profile fields.** No cleaner phone, no cleaner photo, no cleaner notes, no cleaner rate. Everything is derived from the assignment.
- **"Notified by email"** is the only communication channel. The UI hints at more ("notification_method: email" is always passed), but there's no SMS/push option exposed.
- **"Change" primary cleaner** on the Properties page and "+ Add property" on the Cleaners page both effectively assign a cleaner to a property, but from opposite directions — they behave differently in edge cases (different confirm flows, different "replace vs. backup" semantics).

---

## Cross-page relationships

Both pages mutate the same `properties` query. Any change on one page invalidates the cache for the other.

- **Properties page** lets you assign/remove/swap cleaners per property (scoped to one property at a time).
- **Cleaners page** lets you assign/remove a cleaner across many properties at once (scoped to one cleaner at a time).

These are two orthogonal views of the same M:N cleaner-property assignment matrix. The redesign should decide whether to keep both views, merge them, or introduce a third unified view.

### Mental model the user needs to hold

- Each property has at most 1 primary + 1 backup cleaner.
- Each cleaner can be primary on some properties, backup on others.
- Primary accepts a turnover by default; if primary declines, the job rolls to backup.
- A cleaner is "active" once they've accepted at least one invite — there's a Turnzy account linked to them, and they can log in as a cleaner and see their jobs.

Most of this is implicit; the current UI doesn't explain it.

---

## What a redesign should preserve

- Every single interaction listed above (assign, unassign, swap primary/backup, invite, resend, change name, change times, connect/disconnect calendar, copy URL, set timezone, set platform, delete cleaner).
- The URL structure: `/settings/properties`, `/settings/cleaners`. Routing is owned by `SettingsLayout` and shouldn't change.
- The data model — both pages mutate through the `settingsApi` endpoints listed below.
- The mobile-overlay pattern for detail panes — it's the only way full-height pages work on narrow screens with the current `AppShell` and `BottomNav`.

### Backend endpoints in scope (what the UI calls)

```
GET  /properties                          → list of properties with cleaner fields
POST /properties/create
POST /settings/property/name              { property_id, name }
POST /settings/property/platform          { property_id, platform }
POST /settings/property/times             { property_id, default_checkout_time, default_checkin_time }
POST /settings/property/timezone          { property_id, timezone }
POST /settings/ical/update                { property_id, ical_url }
POST /settings/ical/disconnect            { property_id }
POST /admin/fake-ical/generate-token      { property_id }        (test-only)
POST /settings/cleaner/update             { property_id, name, email, notification_method, role }
POST /settings/cleaner/delete             { property_id, role }
POST /settings/backup-cleaner/save        { property_id, name, email, notification_method }
POST /settings/cleaner/resend-invite      { property_id }
POST /settings/cleaner/swap-primary-backup { property_id }
POST /settings/cleaner/promote-backup     { property_id }
GET  /auth/check-email?email=             → { exists: boolean }
```

No cleaner-level endpoints exist — everything is scoped through a property.

---

## Open questions for the designer

- **Should cleaners become first-class?** I.e. an endpoint to create a cleaner without simultaneously assigning them to a property. Would simplify the Cleaners page UX considerably but requires backend work.
- **Should Properties get a "portfolio" overview** like the earlier (reverted) Phase-0 prototype? Or stay utilitarian?
- **Should the list-pane + detail-pane pattern stay**, or could a single responsive grid/table work better at desktop widths?
- **How to surface the primary-vs-backup fallback logic?** Currently implicit.
- **Should the "test calendar" affordance be removed** from production? It's clearly a dev tool.
- **Mobile-first treatment of the Add Cleaner Step 2 property-selector?** It's the single densest piece of UI across both pages.

---

## Files to inspect if the designer wants more

- `src/pages/settings/sections/Properties.jsx` — full Properties page source (446 lines).
- `src/pages/settings/sections/Cleaners.jsx` — full Cleaners page source (477 lines).
- `src/pages/settings/SettingsLayout.jsx` — the settings shell.
- `src/pages/settings/components/AddPropertyModal.jsx` — the 3-step add-property wizard.
- `src/pages/settings/components/Toast.jsx` — the toast provider used by both pages.
- `src/api/settings.js` — all mutation endpoints.
- `src/api/properties.js` — the one read endpoint.
