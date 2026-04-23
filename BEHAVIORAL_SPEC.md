# Turnzy — Complete Behavioral Specification
*Generated from codebase analysis. Last updated: April 5, 2026*

---

## HOW TO READ THIS DOCUMENT

Every screen section follows this format:
- **ROUTE**: the URL path
- **VISIBLE TO**: which user roles see this screen
- **COPY**: every piece of text visible on screen, verbatim from source code
- **BUTTONS & ACTIONS**: every interactive element and what it does
- **CONDITIONS**: what changes based on data/state
- **NAVIGATION**: where the user can go from here
- **EMAILS TRIGGERED**: any emails sent by actions on this screen

---

## PART 1: AUTH & ONBOARDING

### 1.1 Login Page

**ROUTE**: `/login`
**VISIBLE TO**: Unauthenticated users

**COPY** (verbatim, in order of appearance):
- Logo: `Turnzy`
- Button: `Continue with Google`
- Divider: `or`
- Label: `Email`
- Placeholder: `you@example.com`
- Label: `Password`
- Placeholder: `••••••••`
- Button: `Sign in`
- Text: `Don't have an account?` Link: `Sign up` → `/signup`
- Text: `Are you a cleaner?` Link: `Sign up here` → `/cleaner/signup`

**BUTTONS & ACTIONS**:
- **Continue with Google** → Initiates Google OAuth flow. On success: stores JWT in `localStorage` as `turnzy_token`, redirects based on role (host → `/`, cleaner → `/cleaner`, team → `/team`).
- **Sign in** → POST `/api/auth/login` with `{email, password}`. On success: stores JWT, redirects by role. On failure: shows inline error from API (`err.response?.data?.message`) or fallback `Invalid email or password`.

**CONDITIONS**:
- If already authenticated: host → redirect to `/`, cleaner → `/cleaner`, team_member → `/team`

**NAVIGATION**: `/signup`, `/cleaner/signup`

---

### 1.2 Delete Account Confirmation Page

**ROUTE**: `/account/delete-confirm`
**VISIBLE TO**: Any authenticated user

**COPY**:
- Heading: `Delete Account`
- Body: `This action is permanent and cannot be undone. The following will be deleted:`
- Bullet: `All your properties and calendar connections`
- Bullet: `All booking history and turnover records`
- Bullet: `Cleaner assignments and notification settings`
- Bullet: `Your account and personal information`
- Input label: `Type DELETE to confirm`
- Placeholder: `DELETE`

**BUTTONS**:
- **Permanently Delete Account** (red, disabled until input === `DELETE`) → POST `/account/delete`. On success: clears auth, redirects to `/login`.
- **Cancel** → navigates to `/settings/security`

**ERROR MESSAGES**: API error or fallback `Failed to delete account`

---

### 1.3 Team Member Accept Invite Page

**ROUTE**: `/team/accept?token=TOKEN`
**VISIBLE TO**: Anyone (public, no auth required)

**States**:

| State | Heading | Body | Action |
|-------|---------|------|--------|
| `loading` | — | `Validating invite...` | — |
| `expired` | `Invite expired` | `This invite link has expired. Ask your team leader to resend it.` | `Go to login →` |
| `already_used` | `Already accepted` | `You've already accepted this invite. Log in to see your jobs.` | `Go to login →` |
| `error` | `Invalid invite` | `This invite link is invalid. Check with your team leader.` | `Go to login →` |
| `valid` | `Join your team on Turnzy` | `Create your account to start receiving job assignments.` | Signup form |

**Valid state form fields**:
- Button: `Continue with Google`
- Divider: `or create with email`
- Label: `Name`, placeholder: `Your name`
- Label: `Email` (disabled, pre-filled if available)
- Label: `Password`, placeholder: `Min 8 characters`
- Label: `Confirm password`, placeholder: `Confirm password`
- Button: `Create my account` (loading: `Creating account...`)

**Validation errors**:
- `Password must be at least 8 characters`
- `Passwords do not match`

---

## PART 2: HOST EXPERIENCE

### 2.1 Host Dashboard

**ROUTE**: `/`
**VISIBLE TO**: `host`, `admin`

**LAYOUT**:
- Desktop: 340px left column (booking list) + flex-1 right column (detail panel)
- Mobile: full-width booking list only

**HEADER COPY**:
- Title: `Operations`
- Subtitle: `Upcoming turnovers`
- Button: Refresh icon (aria-label: `Refresh calendar`)

**MOBILE STATUS COUNT CARDS** (shown only on mobile, only for counts > 0):

| Label | Color | Route |
|-------|-------|-------|
| `Urgent` | red-50/red-600 | `/bookings/urgent` |
| `Action` | amber-50/amber-700 | `/bookings/needs-action` |
| `Confirmed` | green-50/green-700 | `/bookings/confirmed` |
| `Queued` | gray-50/gray-600 | `/bookings/queued` |

**DESKTOP DETAIL PANEL EMPTY STATE**: `Select a booking to view details`

---

### 2.2 Booking List Sections

| Section Key | Label | Badge Color | Helper Text | Default Open |
|-------------|-------|-------------|-------------|--------------|
| `urgent` | `Urgent (< 3 days)` | Red (bg-red-500 text-white) | — | Yes |
| `needsAction` | `Needs Action` | Amber (bg-amber-400 text-white) | — | Yes |
| `confirmed` | `Confirmed` | Green (bg-green-500 text-white) | — | No |
| `queued` | `Queued` | Gray (bg-gray-200 text-gray-600) | `Beyond your cleaner's notification window` | No |
| `selfManaged` | `Self-Managed` | Gray | `You're handling these turnovers yourself` | No |
| `completed` | `Past` or `Past (X unpaid)` | Amber if unpaid > 0, else gray | — | No |
| `cancelled` | `Cancelled` | Gray | — | No |

**Section filter logic**:
- **Urgent**: `cleaner_status` is `pending` or `declined`, `is_queued` false, checkout within 5 days
- **Needs Action**: `pending`, `declined`, or `cancel_pending`, not urgent, not queued, not cancellation
- **Confirmed**: `cleaner_status === 'accepted'`
- **Queued**: `is_queued === true` (computed server-side: pending + beyond notification window)
- **Self-Managed**: `cleaner_status` is `self_managed` or `dismissed`
- **Completed**: `cleaner_status === 'completed'`
- **Cancelled**: `booking_type` is cancellation/blocked, or `cancel_acknowledged`

**EMPTY STATE** (no bookings at all):
- Icon: Orange house icon
- Heading: `No turnovers yet`
- Body: `Connect your Airbnb calendar to start tracking upcoming turnovers and coordinating with your cleaner.`
- Button: `Add a property` → `/settings/properties`

---

### 2.3 Booking Card (BookingRow)

**FIELDS SHOWN**:
- Title: `{Month} {Day} Turnover` (e.g., "Apr 5 Turnover")
- Property name (subtitle, gray)
- Status badge (top-right, absolute positioned)
- Same-day indicator: `SAME-DAY` (amber, uppercase, shown when `is_same_day`)
- Times modified indicator: `⚠ Times updated` (amber, shown when `is_times_modified`)
- Time rows:
  - Label: `CHECKOUT` — Value: formatted time (e.g., "11:00 AM")
  - Label: `NEXT CHECK-IN` — Value: formatted date + time (e.g., "Apr 7, 3:00 PM")

**PAYMENT STATUS** (only for `cleaner_status === 'completed'`):

| payment_status | Display | Color |
|----------------|---------|-------|
| `unpaid` | `Payment pending` + `Mark as paid` button | amber |
| `payment_marked` | `Awaiting cleaner confirmation` | amber |
| `payment_confirmed` | `Payment confirmed` | green |
| `payment_not_received` | `Cleaner hasn't received payment` + `Mark as paid` button | red |

**CARD STYLING**:
- Urgent (pending/declined, ≤5 days, not queued): `bg-red-50 border-l-4 border-l-red-500`, right-side rounded
- Selected: `ring-2 ring-coral-400 bg-coral-50`
- Default: `bg-white rounded-lg shadow-sm`

---

### 2.4 Status Badge Configuration

| cleaner_status | Badge Label | Badge Colors |
|----------------|-------------|--------------|
| `pending` | `Awaiting response` | bg-amber-50, text-amber-800 |
| `accepted` | `Confirmed` | bg-green-100, text-green-700 |
| `declined` | `Declined` | bg-red-100, text-red-700 |
| `self_managed` | `Self-managed` | bg-gray-100, text-gray-600 |
| `completed` | `Completed` | bg-gray-100, text-gray-500 |
| `dismissed` | `Host handling` | bg-gray-100, text-gray-600 |
| `forwarded_to_team` | `Forwarded to team` | bg-sky-50, text-sky-600 |
| `cancel_pending` | `Cancellation` | bg-warm-100, text-warm-600 |
| `cancel_acknowledged` | `Cancelled` | bg-warm-100, text-warm-400 |

**OVERRIDES**:
- If `is_queued`: `QUEUED` (bg-gray-100, text-gray-500)
- If urgent AND (pending OR declined): `IMMEDIATE ATTENTION` (bg-red-100, text-red-700)

---

### 2.5-2.17 Booking Detail Panel

**ROUTE**: Desktop: inline panel. Mobile: `/bookings/detail/:id`

**HEADER**:
- Title: `{Month} {Day} Turnover` (text-[28px] font-bold)
- Property: `{property_name}` or fallback `Property address` (with MapPin icon)

**STATUS BADGES** (detail panel):
- Queued: `QUEUED` (gray pill)
- Declined: `DECLINED BY CLEANER` (red pill)
- Urgent: `IMMEDIATE ATTENTION` (red pill)
- Other: uses standard badge label

**INDICATORS** (shown below badge):
- `Times were updated by your Airbnb calendar` (amber, AlertTriangle icon) — when `is_times_modified && !is_queued`
- `Late Checkout Pre-Approved by cleaner` (amber, CheckCircle icon) — when `late_checkout_preapproved`
- `Early Check-in Pre-Approved by cleaner` (amber, CheckCircle icon) — when `early_checkin_preapproved`
- Queued notification: `Cleaner will be notified on {date} when this enters their notification window.` (gray card with Clock icon) — when `is_queued`

**TIME DISPLAY** (2-column grid):
- Column 1: `CHECKOUT` label, time (text-2xl font-bold), date, `Request Update` button
- Column 2: `NEXT CHECK-IN` label, time, date, `Request Update` button
- After request sent: `Request sent — awaiting cleaner approval` (amber text)

**TIME EDIT FORM** (inline, opens on "Request Update" click):
- Title: `Late Checkout Request` or `Early Check-in Request`
- Field: `New time` (time input)
- Field: `Note to cleaner (optional)` (textarea, placeholder: `e.g. Guest requested late checkout...`)
- Button: `Send Request` (loading: `Sending...`)
- Button: `Cancel`
- API: POST `/api/bookings/:id/request-time-change` with `{type, requested_time, reason}`

**INFO GRID** (2-column):
- `ASSIGNED TO`: cleaner name (or `Not assigned`), cleaner email
- `RESPONSE`: status label (or `Declined` in red + `Declined on {timestamp}`)
- `BACKUP CLEANER`: name (only if backup exists)

**ACTION BUTTONS BY STATUS**:

| Status | Buttons Shown | Notes |
|--------|---------------|-------|
| **Queued** (`is_queued`) | Dismiss — I'll handle it | Only dismiss |
| **Pending** | Resend Notification (primary), Ask Backup Cleaner (outlined, if backup), Dismiss | Full action set |
| **Declined** | Ask Backup Cleaner (orange primary, if backup), Dismiss | No resend |
| **Accepted** | Ask Backup Cleaner (outlined, if backup), Dismiss | No resend |
| **Self-managed/Dismissed** | Ask Backup Cleaner (outlined, if backup) | No dismiss |
| **Completed** | *(none — read-only)* | — |

Button labels:
- `Resend Notification` (loading: `Sending...`)
- `Ask Backup Cleaner`
- `Dismiss — I'll handle it` (loading: `Dismissing...`)

Action success messages: `Notification resent`, `Booking dismissed`, `Backup cleaner notified`
Error fallback: `Something went wrong`

**ACTIVITY TIMELINE**:
- Section label: `Activity Timeline`
- Each event: colored dot + description + timestamp
- Dot colors: green (accepted/confirmed), red (declined/cancelled), orange (new/notification), amber (modified), blue (payment), gray (dismissed/default)
- Timestamp format: `Month Day, Year, H:MM AM/PM`

---

### 2.18 Dedicated Section Pages

**ROUTE**: `/bookings/:section` where section = `urgent`, `needs-action`, `confirmed`, `queued`, `past`

| Section | Title | Subtitle | Empty State |
|---------|-------|----------|-------------|
| `urgent` | `Urgent` | `Needs attention now` | `Nothing urgent right now` |
| `needs-action` | `Needs Action` | `Awaiting cleaner response` | `No bookings need action right now` |
| `confirmed` | `Confirmed` | `Your cleaner is on it` | `No confirmed turnovers yet` |
| `queued` | `Queued` | `Far-out bookings — not yet in notification window` | `No queued bookings — all upcoming bookings are within your notification window` |
| `past` | `Past` | `Completed turnovers and payment tracking` | `No completed turnovers yet` |

---

### 2.19 Host Activity Feed

**ROUTE**: `/activity`
**VISIBLE TO**: `host`, `admin`

**COPY**:
- Title: `Activity`
- Subtitle: `A log of everything across your properties`

**ERROR STATE**: `Activity couldn't load` / `Please refresh the page to try again.`
**EMPTY STATE**: `No activity yet` / `Events will appear here as bookings are detected and cleaners respond.`

**TIME FORMAT**: `Just now` (< 60s), `{X}m ago` (< 60m), `{X}h ago` (< 24h), `{X}d ago` (< 7d), then `Mon Day` format

**EVENT DESCRIPTIONS** (from activityDescriptions.js):

| event_type | Human-readable template |
|-----------|------------------------|
| `booking_detected` | `New turnover detected at {property}` |
| `new_sameday` | `Same-day turnover detected at {property}` |
| `notification_sent` | `{cleaner} notified about the {date} turnover at {property}` |
| `accepted` / `cleaner_accepted` | `{cleaner} confirmed the {date} turnover at {property}` |
| `declined` / `cleaner_declined` | `{cleaner} declined the {date} turnover at {property}` |
| `cancellation` | `Booking cancelled at {property}` |
| `times_modified` | `Times changed for the {date} turnover at {property}` |
| `self_managed` / `dismissed` | `Dismissed the {date} turnover at {property} — handling it yourself` |
| `completed` | `{cleaner} marked the {date} turnover at {property} complete` |
| `payment_marked` | `Payment marked as sent for the {date} turnover at {property}` |
| `payment_confirmed` | `{cleaner} confirmed payment for the {date} turnover at {property}` |

Where `{cleaner}` defaults to `Your cleaner`, `{property}` defaults to `the property`.

---

## PART 3: HOST SETTINGS

### 3.1 Settings Layout

**ROUTE**: `/settings` → redirects to `/settings/properties`
**VISIBLE TO**: `host`, `admin`

**DESKTOP**: Full-width content area with generous padding (px-8 py-8 max-w-4xl). No sub-nav panel — sidebar serves as navigation.

**MOBILE**: Shows settings menu list at `/settings`, with back button on sub-pages.

---

### 3.2 Properties Page

**ROUTE**: `/settings/properties`

**COPY**:
- Title: `Properties`
- Subtitle: `Manage your property settings, calendars, and times.`

**PROPERTY CARD FIELDS**: Property name (bold, editable), platform badge, calendar status badge, checkout/checkin times, timezone, iCal URL

**CALENDAR BADGES**:
- No URL: `No calendar` (gray)
- Test/fake URL: `Test calendar` (amber)
- Real URL: `Calendar connected` (green)

**ADD PROPERTY**: Dashed border card with `+` icon and `Add property` label → opens AddPropertyModal

---

### 3.3 Add Property Modal (3-step wizard)

**Step 1 — Property Basics**:
- Title: `Add Property`
- Fields: `Property name *` (placeholder: `e.g. Beach House`), `Platform` (Airbnb/VRBO/Other), `Timezone` (7 US zones, auto-detected), `Default checkout` (time, default 11:00), `Default check-in` (time, default 15:00)
- Button: `Next` (loading: `Creating...`)

**Step 2 — Connect Calendar**:
- Title: `Connect Calendar`
- Instructions: `In Airbnb, go to Calendar → Availability Settings → Export Calendar. Paste the .ics link below.`
- Placeholder: `https://www.airbnb.com/calendar/ical/...`
- Button: `Validate & Connect` (loading: `Validating...`)
- Success: `Calendar connected` (green checkmark)
- Warning: `Couldn't verify URL, but you can continue — bookings will appear once the calendar syncs.`
- Link: `Skip for now`

**Step 3 — Done**:
- Title: `All Set!`
- Icon: Green checkmark
- Heading: `Property added!`
- Summary: `{name} · {platform}` + calendar status
- Button: `Go to property settings`
- Button: `Add another property`

---

### 3.4 Notifications Settings (Host)

**ROUTE**: `/settings/notifications`

**TOGGLE GROUPS**:

**Cleaner Confirmation Alerts**:
- `Unconfirmed booking alerts` (default ON)
- `Reminder follow-up alerts` (default ON)
- `Cleaner accepted/declined notifications` (default ON)

**Late Start Alerts**:
- `Alert after 30 minutes` (default OFF)
- `Alert after 1 hour` (default ON)
- `Alert after 2 hours` (default OFF)

**Job Completion**:
- `Notify when cleaning completed` (default ON)
- `Notify when issue reported` (default ON)

**Button**: `Save preferences`

---

### 3.5 Billing

**ROUTE**: `/settings/billing`

**COPY**:
- Title: `Billing`
- Subtitle: `Manage your plan and payment method.`
- Badge: `Free during beta` (green)
- Body: `You're on the free beta plan. Billing features are coming soon.`
- Body: `All features are available at no cost during the beta period.`

---

### 3.6 Account (Host)

**ROUTE**: `/settings/account`

**COPY**:
- Title: `Account`
- Subtitle: `Manage your profile, security, and account settings.`

**PROFILE Section**:
- Section header: `PROFILE`
- InlineEditField: `Name` with `Edit` link
- InlineEditField: `Email` with `Edit` link (requires current password extra field)
- Language dropdown: English, Español, 中文, Tagalog, Tiếng Việt, العربية, Français, 한국어, Русский, Kreyòl ayisyen, Português

**SECURITY Section**:
- Section header: `SECURITY`
- If has_password: Shows `Password` as `••••••••` with `Change` link. Form: Current password, New password (8+ characters), Confirm new password. Buttons: `Save` / `Cancel`.
- If Google OAuth (no password): `You signed in with Google. Password login is not available for this account.`

**DANGER ZONE**:
- Label: `DANGER ZONE` (red)
- Button: `Deactivate account` → confirm dialog: `Deactivate your account? You can reactivate anytime by logging back in.`
- Link: `Permanently delete account` → navigates to `/account/delete-confirm`

---

## PART 4: CLEANER EXPERIENCE

### 4.1 Cleaner Dashboard

**ROUTE**: `/cleaner`
**VISIBLE TO**: `cleaner`

**EMPTY STATE** (no property connections):
- Icon: Orange Users icon
- Heading: `You're not connected yet`
- Body: `Ask your host to add you in Turnzy, or invite your host directly.`
- Button: `Invite a host` → opens inline form
- Subtext: `Or check your email for an invite from your host`

**INVITE HOST FORM** (inline):
- Field: `Host name` (text input)
- Field: `Host email` (email input)
- Button: `Send invite` (loading: `Sending...`)
- Button: `Cancel`
- Success: `✓ Invite sent! We'll let you know when they sign up.`
- API: POST `/api/cleaner/invite-host` with `{name, email}`

---

### 4.2 Cleaner Settings

**ROUTE**: `/cleaner/settings`
**VISIBLE TO**: `cleaner`

**DESKTOP**: Two-panel layout — left sub-nav (160px) + right content
**MOBILE**: Settings menu list at root, back button on sub-pages

**NAV ITEMS**:
- `My Team` → `/cleaner/settings/team`
- `Notifications` → `/cleaner/settings/notifications`
- `Account` → `/cleaner/settings/account`

---

### 4.3 My Team Settings

**ROUTE**: `/cleaner/settings/team`

**TOGGLE**: `I work with a team`
- OFF subtext: `Turn this on to invite helpers and assign them to jobs.`
- ON subtext: `Team members you invite can be assigned to specific turnovers.`

**FEATURE PREVIEW** (when toggle OFF):
- `With a team you can:`
- `→ Assign specific helpers to each turnover`
- `→ Team members get their own app login`
- `→ They accept, start, and complete jobs`
- `→ You stay in control as the lead cleaner`
- `→ Get notified when team members respond`

---

### 4.4 Cleaner Notification Settings

**ROUTE**: `/cleaner/settings/notifications`

**TOGGLE GROUPS**:

**Job Notifications**:
- Notification method: `Email` / `SMS` / `Both`
- New job notifications (default ON)
- Modified job notifications (default ON)
- Cancellation notifications (default ON)

**Advance Notice**:
- `How far in advance do you want to be notified?`
- Options: 7 / 14 / 30 / 60 / 90 days (default: 60)
- Helper: `Bookings further out than this will be queued until they enter your window.`

**Reminders**:
- Day-before reminder (default ON) + time picker (default 7:00 PM)
- Morning-of reminder (default OFF) + time picker (default 7:00 AM)

**Team Notifications** (only when `has_team`):
- Team member confirmed (default ON)
- Team member declined (default ON)
- Team member completed (default ON)
- Team member reported issue (default ON)

**Button**: `Save preferences`

---

## PART 5: TEAM MEMBER EXPERIENCE

### 5.1 Team Dashboard

**ROUTE**: `/team`
**VISIBLE TO**: `team_member`

**HEADER**: Title: `My Jobs`, Subtitle: `Your assigned turnovers`

**SECTIONS**: `Today`, `Upcoming`, `Past`

**EMPTY STATE**: `📋 You're not connected to any jobs yet. Check your email — your team leader will assign you to jobs when they need you.`

**BADGES**: `Confirm Needed`, `Confirmed`, `Started`, `Completed`, `Declined`

**ACTION BUTTONS**:
- Assigned: `Got it — I'll be there` (confirm) + `I can't make it` (decline)
- Confirmed: `Mark as started` + `I can't make it anymore`
- Started: `Mark as complete` + `Report an issue` (with issue textarea)
- Completed: `Completed.` (read-only)
- Declined: `You declined this job.` (read-only)

---

## PART 6: NAVIGATION

### 6.1 Sidebar (Desktop)

**HOST/ADMIN**:
- Views: `Dashboard` (/), `Activity` (/activity), `Admin` (/admin, admin only, external link)
- Bookings: `Urgent`, `Needs Action`, `Confirmed`, `Queued`, `Past` (with count badges on Urgent/Needs Action)
- Settings: `Properties`, `Cleaners`, `Notifications`, `Billing`, `Account`

**CLEANER**:
- Views: `Dashboard` (/cleaner), `Calendar` (/cleaner/calendar), `Activity` (/cleaner/activity)
- Settings: `My Team`, `Notifications`, `Account`

**TEAM MEMBER**: `My Jobs` (/team), `Settings` (/team/settings)

**PROFILE FOOTER**: User initial avatar, name, role label (`Pro Host` / `Cleaner` / `Team Member`), sign out button

### 6.2 Bottom Nav (Mobile, via Portal)

**HOST**: `Home` (/), `Activity` (/activity), `Settings` (/settings)
**CLEANER**: `Home` (/cleaner), `Calendar` (/cleaner/calendar), `Activity` (/cleaner/activity), `Settings` (/cleaner/settings)
**TEAM**: `Home` (/team), `Settings` (/team/settings)

### 6.3 Mobile Header

Shows `Turnzy` / `Premium Management` branding on mobile for host and cleaner roles. Team members do NOT get the mobile header.

---

## PART 7: ONE-TAP EMAIL RESPONSE PAGES

### 7.1 Cleaner Accept/Decline

**ROUTE**: `{BACKEND_URL}/respond?id={bookingId}&action=accept|decline|acknowledge`

**Accept success page**:
- Icon: ✅
- Heading: `Accepted!`
- Body: `Thank you — the host has been notified.`

**Decline success page**:
- Icon: ❌
- Heading: `Declined`
- Body: `Thank you — the host has been notified.`

**Acknowledge (cancellation)**:
- Icon: 🟡
- Heading: `Cancellation Acknowledged`
- Body: `Thank you — the host has been notified.`

**Invalid/missing params**: `Invalid` (400)
**Booking not found**: `Not found` (404)

### 7.2 Payment Confirm/Not Received

**ROUTE**: `{BACKEND_URL}/cleaner/payment-respond?token=TOKEN&action=confirm|not_received`

**Invalid/expired token**: `This link is no longer valid. It may have already been used or expired.`

### 7.3 Team Respond

**ROUTE**: `{BACKEND_URL}/team/respond?assignment_id=ID&action=accept|decline`

**Accept**: Icon: ✅, Heading: `Job accepted!`, Body: `You've accepted the {date} turnover. {cleanerName} has been notified.`, Link: `View my jobs →`
**Decline**: Icon: 👋, Heading: `Got it`, Body: `{cleanerName} has been notified.`

---

## PART 8: ALL EMAILS — COMPLETE COPY

All emails sent from `notify@turnzy.app`. In DEV mode, all recipients are redirected to `process.env.ADMIN_EMAIL` and subjects get `[DEV]` prefix.

---

### 8.1 inviteCleaner — Host invites cleaner to join

**TRIGGER**: Host adds cleaner in Settings → Cleaners
**TO**: Cleaner email

**If cleaner already has account**:
- **SUBJECT**: `You've been connected to a property on Turnzy`
- **BODY**: `Hi {cleanerName}, {hostName} added you as the cleaner for a property on Turnzy. Your upcoming jobs are now visible in your account.`
- **BUTTON**: `View your jobs →` → `{APP_URL}/cleaner`

**If cleaner has no account**:
- **SUBJECT**: `{hostName} invited you to join Turnzy`
- **BODY**: `Hi {cleanerName}, {hostName} added you as the cleaner for a property on Turnzy. Turnzy notifies you when bookings arrive. Accept or decline in one tap — or log in to see all your jobs.`
- **BUTTON**: `Set up your account →` → `{APP_URL}/cleaner/accept-invite?token={token}`
- **FOOTER**: `This link expires in 7 days. You can also sign in at {APP_URL}/login if you already have an account.`

---

### 8.2 notifyCleaner — Booking notifications (all modes)

**TRIGGER**: iCal poller detects new/modified/cancelled booking, or host clicks Resend
**TO**: Cleaner email

| Mode | Subject | Title | Body |
|------|---------|-------|------|
| `new` | `🏠 New Turnover: {property} on {checkout_date}` | `🏠 New Turnover` | `Please accept or decline.` |
| `new_sameday` | `⚡ Same-Day Turnover: {property} on {checkin_date} — back-to-back` | `⚡ Same-Day Turnover` | `Please accept or decline.` |
| `modified_dates` | `🔄 Turnover dates updated — {property}` | `🔄 Turnover Dates Updated` | `The dates for this turnover have changed. Please confirm you can still cover it.` |
| `modified_times` | `🕐 Turnover times updated — {property}` | `🕐 Turnover Times Updated` | `The dates are the same but the times have changed. Please confirm the new cleaning window works for you.` |
| `modified_dates_and_times` | `🔄 Turnover dates and times updated — {property}` | `🔄 Turnover Dates & Times Updated` | `Both the dates and times for this turnover have changed. Please re-confirm.` |
| `modified_other` | `🔄 Turnover details updated — {property}` | `🔄 Turnover Details Updated` | `Some details on this turnover have been updated. Please review.` |
| `modified_sameday` | `⚡ Updated — Same-Day Turnover: {property} on {checkout_date}` | `⚡ Updated — Same-Day Turnover` | `Please re-confirm you can cover this.` |
| `modified` (generic) | `🔄 Turnover updated: {property} — new dates {checkin}–{checkout}` | `🔄 Turnover Updated` | `This turnover has been updated with new dates. Please re-confirm you can cover it.` |
| `cancellation` | `❌ Turnover cancelled — {property} on {checkout_date}` | `❌ Turnover Cancelled` | `This turnover has been cancelled. Please acknowledge you've received this notice.` |

**Same-day warning note** (for `new_sameday` and `modified_sameday`):
> **Note:** There's a checkout on {checkinDate} — you'll need to complete the cleaning between checkout and the next check-in. Same-day turnovers have no buffer time.

**Body includes**: Table with Check-in, Check-out, Calendar rows

**Action buttons (non-cancellation)**:
- `✓ Accept — I'll handle it` (green) → `{APP_URL}/respond?id={bookingId}&action=accept`
- `→ Forward to teammate` (blue) → `{APP_URL}/cleaner/forward?booking_id={bookingId}`
- `✗ Decline` (red) → `{APP_URL}/respond?id={bookingId}&action=decline`

**Action button (cancellation)**:
- `✓ Acknowledge Cancellation` (black) → `{APP_URL}/respond?id={bookingId}&action=acknowledge`

---

### 8.3 notifyHost — Cleaner response notifications

**TRIGGER**: Cleaner clicks accept/decline/acknowledge in email or dashboard
**TO**: Host email

| Action | Subject | Body |
|--------|---------|------|
| `accept` | `✅ Cleaner accepted — {guest_name}` | `Your cleaner accepted the cleaning for {guest_name}.` |
| `decline` | `❌ Cleaner declined — {guest_name}` | `Your cleaner declined the cleaning for {guest_name}.` |
| `acknowledge` | `🟡 Cleaner acknowledged cancellation — {guest_name}` | `Your cleaner acknowledged the cancellation for {guest_name}.` |

**BUTTON**: `View Dashboard →` → `{APP_URL}`

Note: `{guest_name}` falls back to `booking.guest_name` from DB when passed as `null`.

---

### 8.4 sendWelcomeEmail — Account creation

**TRIGGER**: After successful signup
**TO**: New user email
**SUBJECT**: `Welcome to Turnzy, {firstName}!`

| Role | Body | Button |
|------|------|--------|
| `host` | `You're all set. The next step is adding your property so we can start tracking cleanings and notifying your cleaner automatically.` | `Go to your dashboard →` → `{APP_URL}` |
| `cleaner` | `You've been added as a cleaner. Your upcoming jobs will appear in your dashboard once a host connects their calendar to you. In the meantime, you can invite a host, set up your team, and configure your notification preferences.` | `Go to your dashboard →` → `{APP_URL}/cleaner` |
| `team_member` | `You've been added as a team member. You'll get notified when you're assigned to a cleaning job.` | `View your jobs →` → `{APP_URL}/team` |

---

### 8.5 notifyTeamMemberAssignment — Job forwarded to team member

**TRIGGER**: Lead cleaner forwards booking to team member
**TO**: Team member email
**SUBJECT**: `{cleanerName} assigned you to {turnoverDate} Turnover`
**BODY**: `You've been assigned a cleaning. {cleanerName} forwarded the {turnoverDate} turnover to you.` + table (Property, Turnover date, Cleaning window)
**BUTTONS**:
- `✓ Accept this job` (green) → `{APP_URL}/team/respond?assignment_id={id}&action=accept`
- `✗ Decline this job` (red) → `{APP_URL}/team/respond?assignment_id={id}&action=decline`

---

### 8.6 notifyCleanerTeamResponse — Team member responded

**TRIGGER**: Team member accepts or declines forwarded job
**TO**: Lead cleaner email

| Action | Subject | Body |
|--------|---------|------|
| `accept` | `✅ {teamMemberName} accepted the {turnoverDate} Turnover` | `{teamMemberName} accepted the job. The cleaning is covered.` |
| `decline` | `⚠ {teamMemberName} declined — {turnoverDate} Turnover needs reassignment` | `{teamMemberName} declined the job. It's back in your queue.` |

**Buttons (decline)**: `Try another teammate →` (blue) + `Decline to host →` (red)
**Buttons (accept)**: `View dashboard →` (coral) → `{APP_URL}/cleaner`

---

### 8.7 sendPaymentReminder — Auto payment reminder

**TRIGGER**: Cron check: 24h/48h/72h after booking completion when `payment_status='unpaid'`
**TO**: Host email
**SUBJECT**: `💰 Payment reminder — {checkoutDate} Turnover`
**BODY**: `Don't forget to pay {cleanerName} for the {propertyName} cleaning on {checkoutDate}.`
**BUTTON**: `Mark as paid →` → `{APP_URL}/bookings/{bookingId}#payment`

---

### 8.8 sendTimeChangeRequest — Same-day time change (needs approval)

**TRIGGER**: Host requests time change on same-day booking
**TO**: Cleaner email
**SUBJECT**: `⏰ Time change request — {date} Turnover`
**BODY**: `The host has requested a {typeLabel} for {propertyName}.` + table (Original time, Requested time, Reason). `This will affect your cleaning window.`
**BUTTONS**:
- `✓ Approve` (green) → approve URL with token
- `✗ Decline` (red) → decline URL with token

---

### 8.9 sendTimeChangeNotify — Non-same-day time change (FYI)

**TRIGGER**: Host changes time on non-same-day booking
**TO**: Cleaner email
**SUBJECT**: `ℹ️ FYI: {typeLabel} — {date} Turnover`
**BODY**: `Just a heads up from {hostName}. Guest has a {typeLabel} for {propertyName} on {date}. {typeLabel}: {newTime}. No action needed — just keeping you informed.`

---

### 8.10 sendPaymentReceived — Host marked payment sent

**TRIGGER**: Host clicks Mark as Paid
**TO**: Cleaner email
**SUBJECT**: `💰 Payment received — {date} Turnover`
**BODY**: `{hostName} marked payment as sent for {propertyName}. Thank you for your work!`

---

### 8.11 Mark-paid email with action links (inline in host.js)

**TRIGGER**: Host clicks Mark as Paid (generates tokens)
**TO**: Cleaner email
**SUBJECT**: `{hostName} marked your payment as sent`
**BODY**: `Payment sent. {hostName} says they've sent payment for the {date} turnover at {property}. Please confirm once you've received it.`
**BUTTONS**:
- `✓ Confirm I received it` (green) → `{BACKEND_URL}/cleaner/payment-respond?token={confirmToken}&action=confirm`
- `I haven't received it` (gray outline) → `{BACKEND_URL}/cleaner/payment-respond?token={notReceivedToken}&action=not_received`
**FOOTER**: `Payment method is handled between you and your host — Turnzy just tracks confirmation.`

---

### 8.12 Payment confirmed (to host)

**SUBJECT**: `✅ {cleanerName} confirmed payment received`
**BODY**: `Payment confirmed. {cleanerName} confirmed they received payment for the {date} turnover at {property}. This job is now fully closed.`

---

### 8.13 Payment not received (to host)

**SUBJECT**: `⚠️ {cleanerName} hasn't received payment`
**BODY**: `Payment not received. {cleanerName} indicated they have not received payment for the {date} turnover at {property}. Please send payment and mark it again.`

---

### 8.14 sendHostConnectInvite — Cleaner invites host

**TRIGGER**: Cleaner uses "Invite a host" flow
**TO**: Host email
**SUBJECT**: `{cleanerName} invited you to connect on Turnzy`
**BODY**: `You've been invited to Turnzy. {cleanerName} wants to connect with you as their host on Turnzy — a simple tool to manage cleaning turnovers.`
**BUTTON**: `Accept invitation →`
**FOOTER**: `If you didn't expect this, you can ignore this email.`

---

### 8.15 sendTeamMemberInvite — Invite team member

**TRIGGER**: Lead cleaner adds team member in Settings
**TO**: Team member email
**SUBJECT**: `{cleanerName} invited you to their cleaning team on Turnzy`
**BODY**: `You've been invited to a cleaning team. {cleanerName} has invited you to join their team on Turnzy.`
**BUTTON**: `Accept invitation →` → `{FRONTEND_URL}/team/accept?token={token}`

---

### 8.16 sendDismissNotification — Booking dismissed

**TRIGGER**: Host clicks "Dismiss — I'll handle it"
**TO**: Cleaner email
**SUBJECT**: `Booking dismissed — {date} Turnover`
**BODY**: `{hostName} will handle the {propertyName} cleaning on {date} themselves. No action needed from you.`

---

### 8.17 sendBulkImportSummary — First calendar sync

**TRIGGER**: First iCal poll for a property with existing bookings
**TO**: Cleaner email
**SUBJECT**: `{count} upcoming cleanings at {propertyName}`
**BODY**: `Your upcoming cleanings. You've been connected to {propertyName}. Here are your upcoming cleanings:` + table of all turnovers with dates and windows. `Please review and confirm your availability in your Turnzy dashboard.`
**BUTTON**: `View my schedule →` → `{APP_URL}/cleaner`

---

### 8.18 sendConnectionNotification — Auto-linked to property

**TRIGGER**: Cleaner auto-linked when email matches during auth
**TO**: Cleaner email
**SUBJECT**: `You've been connected to a property on Turnzy`
**BODY**: `Hi {cleanerName}, {hostName} added you as cleaner for {propertyName}. Your upcoming jobs are now visible in your account.`
**BUTTON**: `View your jobs →` → `{APP_URL}/cleaner`

---

### 8.19 sendCleanerOnboardingInvite — During host onboarding

**TRIGGER**: Host adds cleaner during onboarding wizard
**TO**: Cleaner email
**SUBJECT**: `{hostName} has added you as their cleaner on Turnzy`
**BODY**: `Hi {cleanerName}, {hostName} has added you as the cleaner for {propertyName} on Turnzy. When a new booking comes in, you'll get an email to accept or decline — no app download required.`

---

## PART 9: iCAL DETECTION & STATE TRANSITIONS

### 9.1 New Booking Detected (createICalBooking)

1. Generate `message_id`: `ical-{calendar_name}-{uid}`
2. Check for same-day turnover (another booking checking out on same date as this check-in)
3. Set `booking_type` to `SAME_DAY` or `NEW_BOOKING`
4. Insert with `cleaner_status='pending'`, `source_type='ical'`
5. **Past bookings** (checkout < today): Silently import as `accepted/unpaid`, no notification
6. **First poll**: Suppress individual emails; collect for bulk summary (`sendBulkImportSummary`)
7. **Notification window**: If cleaner has `notification_window_days` pref (default 60) and booking is beyond it → set `notification_scheduled_for`, do NOT notify. Also check `notify_days_before` as secondary threshold.
8. If within window: fire-and-forget `notifyCleaner` with mode `new` or `new_sameday`

### 9.2 Booking Modified (handleICalModification)

1. Compute `notifyHash` from all fields; skip if already notified with same hash (dedup)
2. Capture old values before update
3. Check same-day turnover status
4. **Determine new cleaner_status**:
   - `self_managed` or `dismissed` → keep current (silent update)
   - `accepted` + no date change + time diff < 30 min → keep `accepted` (informational only)
   - `accepted` + date change OR time diff ≥ 30 min → revert to `pending` (reconfirmation)
   - `pending` → stays `pending`, re-notify with updated times
   - `declined` → move back to `pending` (new chance)
   - `queued` → stays `queued`, silent update
5. Always set `is_times_modified = true`
6. **Notification modes**: `modified_sameday`, `modified_dates_and_times`, `modified_dates`, `modified_times`, `modified_other`, `modified`

### 9.3 Booking Cancelled (markICalCancellation)

1. Compute `notifyHash`; skip if already notified
2. Update: `booking_type='cancellation'`, `cleaner_status='cancel_pending'`, `is_active=0`
3. Notify cleaner with `mode='cancellation'`

### 9.4 Booking Reactivation

If cancelled booking reappears in iCal feed → update to `cleaner_status='pending'`, `is_active=1`, notify cleaner as new.

### 9.5 Same-Day Detection

Queries bookings where `checkout_date = checkin_date` for same calendar. Post-poll: recalculates `is_same_day`, `next_booking_id`, `prev_booking_id`.

### 9.6 Notification Window Logic

- `notification_window_days` from cleaner prefs (default 60)
- `is_queued` computed at API response time (not stored): `pending && daysOut > windowDays`
- Scheduled notifications picked up each poll when `notification_scheduled_for <= CURRENT_DATE`

### 9.7 Payment Reminder Cron

Tiered at 24h/48h/72h after `completed_at` when `payment_status='unpaid'`. Each tier has a boolean flag (`payment_reminder_24_sent`, etc.).

### 9.8 Airbnb Block Detection

Post-poll: `guest_name='Not available'` → `booking_type='blocked'`, `cleaner_status='not_required'`

### 9.9 Cancellation Detection

After processing all events: any active iCal booking not seen in this poll (`last_seen < pollStartedAt`) is cancelled via `markICalCancellation`.

### 9.10 Race Condition

Cleaner Accept + simultaneous iCal date change: Accept processes first → `accepted`. Next poll detects change → reverts to `pending` with re-notification. Expected behavior, logged in timeline.

---

## PART 10: BACKEND API ROUTES

### 10.1 Host API Routes (JWT auth via /api prefix)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/properties` | All properties for host |
| POST | `/api/properties/create` | Create new property |
| GET | `/api/bookings` | All bookings, enriched with `is_queued`, `days_until_checkout`, `notification_window_days`, `has_backup_cleaner` |
| GET | `/api/bookings/:id` | Single booking with timeline, next_checkin |
| POST | `/api/bookings/:id/resend` | Resend cleaner notification |
| POST | `/api/bookings/:id/confirm` | Manually mark confirmed |
| POST | `/api/bookings/:id/dismiss` | Set `cleaner_status='self_managed'` |
| POST | `/api/bookings/:id/mark-paid` | Mark payment sent, generate tokens, email cleaner |
| POST | `/api/bookings/:id/request-time-change` | Request late checkout/early check-in |
| GET | `/api/activity` | Activity log for host's properties |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/poll-icals` | Trigger iCal poll |

### 10.2 Cleaner API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cleaner/jobs` | All jobs for this cleaner |
| POST | `/api/cleaner/jobs/:id/accept` | Accept booking |
| POST | `/api/cleaner/jobs/:id/decline` | Decline booking |
| POST | `/api/cleaner/jobs/:id/complete` | Mark complete |
| POST | `/api/cleaner/jobs/:id/issue` | Report issue |
| POST | `/api/cleaner/jobs/:id/confirm-payment` | Confirm payment received |
| POST | `/api/cleaner/jobs/:id/payment-not-received` | Mark payment not received |
| POST | `/api/cleaner/jobs/:id/nudge-payment` | Send payment reminder to host (max 3) |
| GET | `/api/cleaner/team` | List team members |
| POST | `/api/cleaner/team/add` | Invite team member |
| POST | `/api/cleaner/team/toggle` | Enable/disable team feature |
| POST | `/api/cleaner/jobs/:id/assign` | Assign to team member |
| GET | `/api/cleaner/activity` | Activity feed |
| GET | `/api/cleaner/settings/notifications` | Get notification prefs |
| POST | `/api/cleaner/settings/notifications` | Save notification prefs |
| POST | `/api/cleaner/invite-host` | Invite a host |
| GET | `/api/cleaner/host-invites` | Pending host invites |

### 10.3 Team Member API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/team/assignments` | All assignments for team member |
| POST | `/api/team/assignments/:id/confirm` | Confirm assignment |
| POST | `/api/team/assignments/:id/decline` | Decline assignment |
| POST | `/api/team/assignments/:id/start` | Mark started |
| POST | `/api/team/assignments/:id/complete` | Mark complete |
| POST | `/api/team/assignments/:id/issue` | Report issue |
| GET | `/api/team/validate-token` | Validate invite token |
| POST | `/api/team/accept` | Create team member account |

### 10.4 One-Tap Response Pages (no auth, token-based)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/respond?id=&action=` | Cleaner accept/decline/acknowledge booking |
| GET | `/bookings/time-change/respond?id=&action=` | Time change approve/decline |
| GET | `/cleaner/payment-respond?token=&action=` | Payment confirm/not_received |
| GET | `/team/respond?assignment_id=&action=` | Team member accept/decline |

---

## PART 11: ADMIN PANEL

### 11.1 Admin Pages (all require `checkAdmin`)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard: user/booking/property counts |
| `/admin/users` | User management with delete/reactivate/impersonate |
| `/admin/bookings` | All bookings with reset actions |
| `/admin/emails` | Email template editor (seed from DEFAULT_TEMPLATES) |
| `/admin/activity` | Activity log browser |
| `/admin/settings` | Environment variables viewer (masked) |
| `/admin/simulate` | Calendar simulation (create/modify/cancel fake events) |
| `/admin/tests` | Tests & audits page |

### 11.2 Test Seed Scenarios (`/admin/test-setup?scenario=`)

| Scenario | Description |
|----------|-------------|
| `empty_host` | Property with zero bookings |
| `full_host` | 9 diverse bookings (all states) |
| `pending_booking` | Single pending, 10 days out |
| `confirmed_booking` | Single accepted, 14 days out |
| `declined_booking` | Single declined, 8 days out |
| `completed_unpaid` | Completed, payment unpaid |
| `unconnected_cleaner` | Removes cleaner from property |
| `connected_cleaner_with_jobs` | 3 mixed-state bookings |
| `confirmed_times_modified` | Accepted with `is_times_modified=true` |
| `nudge_max` | Completed with `payment_nudge_count=3` |
| `completed_paid_awaiting` | Completed with `payment_status='payment_marked'` + tokens |
| `urgent_sameday` | Pending same-day, 1 day out |
| `self_managed_booking` | Self-managed, 15 days out |
| `queued_booking` | Pending, 75 days out (beyond window) |

### 11.3 iCal Simulation (`/admin/simulate-ical-event`)

| Action | Description |
|--------|-------------|
| `cancellation` | Deletes booking and all FK references |
| `time_change_minor` | Sets checkout to 11:15, `is_times_modified=true` |
| `time_change_major` | Sets checkout to 13:00, reverts to `pending` |
| `new_booking` | Creates new pending booking 7 days out |

---

## PART 12: DATE AND TIME FORMATS

| Function | Output Format | Example |
|----------|--------------|---------|
| `fmtDate` | Short month + day | `Apr 5` |
| `fmtDateLong` | Full month + day + year | `April 5, 2026` |
| `fmtTime` | 12-hour with AM/PM | `3:00 PM` |
| `fmtDateShort` | Short month + day | `Apr 5` |
| `getMonthDay` | `{month, day}` object | `{month: "Apr", day: "5"}` |

---

## PART 11: ERROR STATES

- **Auth errors**: API message or `Invalid email or password`
- **API errors**: Shown as toast (`Something went wrong` fallback)
- **Network errors**: Toasts with error text
- **404 page**: `Page not found`
- **Booking not found**: `Booking not found`
- **Rate limit**: `Too many attempts. Try again in 15 minutes.`
- **Session expired**: Redirect to `/login` (401 interceptor in API client)
- **Delete account validation**: `Failed to delete account`
- **Password validation**: `Password must be at least 8 characters`, `Passwords do not match`

---

## APPENDIX: ROUTE TABLE

| Path | Component | Role Guard |
|------|-----------|------------|
| `/login` | Login | None |
| `/team/accept` | AcceptInvite | None |
| `/account/delete-confirm` | DeleteConfirm | Any auth |
| `/` | Dashboard (host) | host, admin |
| `/bookings/detail/:id` | BookingDetailPage | host, admin |
| `/activity` | HostActivity | host, admin |
| `/bookings/:section` | BookingSection | host, admin |
| `/settings` | SettingsLayout → Properties | host, admin |
| `/settings/properties` | Properties | host, admin |
| `/settings/cleaners` | Cleaners | host, admin |
| `/settings/notifications` | Notifications | host, admin |
| `/settings/billing` | Billing | host, admin |
| `/settings/account` | Account | host, admin |
| `/cleaner` | CleanerDashboard | cleaner |
| `/cleaner/calendar` | CleanerCalendar | cleaner |
| `/cleaner/calendar/job/:id` | CleanerCalendarJobDetail | cleaner |
| `/cleaner/activity` | CleanerActivity | cleaner |
| `/cleaner/settings` | CleanerSettingsLayout | cleaner |
| `/cleaner/settings/team` | CleanerSettingsTeam | cleaner |
| `/cleaner/settings/notifications` | CleanerSettingsNotifications | cleaner |
| `/cleaner/settings/account` | CleanerSettingsAccount | cleaner |
| `/team` | TeamDashboard | team_member |
| `/home` | RoleRedirect | Any auth |
| `*` | "Page not found" | None |
