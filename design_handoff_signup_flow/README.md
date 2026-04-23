# Signup Flow — Design Handoff

Ship a complete signup experience for **hosts**, **cleaner business owners**, and **cleaner teammates**, with two entry points:
- **Direct** — user visits `/signup` with no token
- **Invite link** — user clicks a link in an email (host, cleaner, or teammate invite)
- **Team code** — teammate enters a 6-char code to join a cleaning org

All three roles × two entry points × desktop/mobile. A single `/signup` route handles everything; the invite token in the URL flips the flow into "accept" mode.

---

## 1 · Files in this package

| File | Use |
|---|---|
| `reference_prototype/index.html` + `*.jsx` | Working prototype. Open it, toggle the Tweaks panel (bottom-right) to see every state. |
| `colors_and_type.css` | Canonical tokens — already in the repo, re-copied so you can diff. |
| `README.md` (this file) | Spec: routes, states, copy, components, edge cases. |

**The prototype is reference only** — rewrite in React + Tailwind + shadcn + Lucide to match the rest of `turnzy-frontend`. Copy *values* (copy, colors, spacing, layout intent), not the plain-JSX scaffolding.

---

## 2 · Routes to add

```
/signup                             →  Direct signup — starts at role picker
/signup/host                        →  Direct signup, role pre-selected
/signup/cleaner                     →  Direct signup, role pre-selected
/signup/join                        →  Teammate → team-code entry
/invite/:token                      →  Invite landing — loads invite, renders StepAccount
/invite/:token/expired              →  Expired state (also reachable from API 410)
/signup/welcome                     →  Post-signup success screen (guided tour triggers from dashboard, not here)
```

Invite tokens carry: `inviter_id`, `inviter_name`, `workspace_id`, `workspace_name`, `role` (`host_owner` | `cleaner_owner` | `cleaner_teammate` | `cleaner_lead`), `invitee_email`, `property_ids[]` (for cleaners), `expires_at`. Server decodes; client just renders.

---

## 3 · Auth methods

Two methods, in this order, on every account screen:
1. **Google SSO** — full-width button at the top, above email form
2. **Email + password** — below an `or with email` divider

Both complete the same server contract. SSO skips the password field; server creates the account and returns the user.

---

## 4 · Flows — step-by-step

### 4.1 Direct — Host
1. `StepRolePicker` → user picks "I own properties"
2. `StepAccount` → name, email, password, terms checkbox (progress: 1 of 2)
3. `StepHostWorkspace` → workspace name, property count range, timezone (progress: 2 of 2)
4. `StepSuccess` → "Welcome to Turnzy" → into empty dashboard, **guided tour overlay starts on dashboard** (not here)

### 4.2 Direct — Cleaner (owner)
1. `StepRolePicker`
2. `StepAccount`
3. `StepCleanerSetup` → work-style (solo vs team), business name, service area (optional)
4. `StepSuccess`

### 4.3 Direct — Teammate
1. `StepRolePicker` → user picks "I'm joining a team"
2. `StepTeamCode` → they enter the 6-char code from their boss
3. `StepAccount` → name, email, password (workspace context now shown inline because code was verified)
4. `StepSuccess`

### 4.4 Invite link — any role
1. `StepAccount` with **invite context card** shown in the left panel (desktop) or inline strip (mobile). Name + email pre-filled but **fully editable** — see §6.
2. `StepSuccess`

Host owner's invite link accepts them into an existing workspace as a co-owner. Cleaner teammate's invite accepts them onto an existing cleaning org. Cleaner owner's invite from a host pre-attaches the properties in `property_ids[]`.

### 4.5 Team code
Same as direct teammate but `StepRolePicker` is skipped (user hit `/signup/join` directly).

---

## 5 · Layout — desktop vs mobile

Echoes the existing **LoginCard** split. **Do not invent new chrome.**

### Desktop (`lg:` and up) — 2-col grid, `1.05fr 1fr`
- **Left panel** — dark, editorial. Role-tinted background.
  - Top: `<LogoOnDark />` + "Already have an account? Sign in" link (top-right)
  - Middle: **Headline** (direct) OR **Invite context card** (invite)
  - Bottom: **Stats** (direct) OR "Secured by invite · Expires in 6 days" line (invite)
- **Right panel** — the form, max-width 400–440px, centered vertically, with a footer row ("© Turnzy 2026 · Privacy · Terms · Help") pinned bottom.

### Mobile (below `lg:`) — single column
- **Hero strip** (dark, role-tinted) — condensed version of the left panel. ~140–180px tall. Shows: logo, sign-in link, tiny eyebrow, compact serif headline (or invite context). Stats/context card gets simplified to a single line or a pill.
- **Form** directly underneath. Same layout as desktop form.
- Footer unchanged.

### Role color tokens (left panel / hero)

| Role | `panelBg` | Accent | Accent hover | Eyebrow text | Serif headline |
|---|---|---|---|---|---|
| Host | `#1F1D1A` | `#E85F34` | `#C8481F` | Property owner · host | One list. / Every turnover. / *Handled.* |
| Cleaner | `#172318` | `#2F7A3F` | `#1F5428` | Cleaning business · owner | Your route. / Your rhythm. / *One schedule.* |
| Teammate | `#161E2A` | `#2F6BBD` | `#1F538E` | Teammate · crew member | Show up. / Clock in. / *Done.* |

The italicized third line uses the accent color; the rest is white on panelBg. These colors are **prototype conveniences** — the sage and sky accents are new, not yet in the design system. Before committing them, see §11.

---

## 6 · Invite email — ⚠️ change to make

> The user noted: **"When we prompt Claude Code, this change needs to be made in the invite email."**

**Update the invite email template** (likely `turnzy-backend/emails/invite.*` or Postmark template) so that the CTA URL carries **who invited the user** in the token payload. The signup page reads this and:
- Renders the inviter's first name, avatar, and workspace in the left panel
- Pre-fills (but does **not** lock) the invitee's name + email
- "Remembers" the invite context across page reloads via the URL token (no server round-trip needed to re-render)

Specifically, make sure the token decodes to at least:
```ts
{
  inviter: { id, name, email, role }, // "Sam Aldridge" / "Host · Coastal Stays"
  workspace: { id, name },            // "Coastal Stays"
  invitee: { email, suggested_name }, // suggested_name from the row in the team table
  role: 'cleaner_lead',               // the role being offered
  property_ids?: string[],            // for cleaner invites — pre-attach these
  expires_at: ISO8601,
}
```

If the email currently sends a plain `/signup?email=…` URL, **migrate to `/invite/:token`** and encode the payload there.

**Email copy** should also match the new warm-editorial tone. Subject: something like **"Sam added you to Coastal Stays"**. Preheader: **"One tap to set up your cleaner account — takes 20 seconds."** Body: single CTA button "Accept invite →" that points at `/invite/:token`. One fallback line: "Or paste this link: `https://app.turnzy.com/invite/abc123…`"

---

## 7 · Form components & validation

Reuse existing shadcn primitives; match the prototype's behavior.

### Shared
- **Name** — min 2 chars; trim on blur; autofocus on direct signups (not invite)
- **Email** — valid email regex; on blur, server checks "already exists" and if so, shows inline error with a "Sign in instead" link
- **Password** — min 8 chars; **password strength meter** (4 bars) — colored by a simple heuristic:
  - +1 if length ≥ 8
  - +1 if length ≥ 12
  - +1 if mixed case
  - +1 if has digit
  - +1 if has symbol
  - Labels: Too weak / Weak / Good / Strong
  - Colors: `#C84437` / `#D8792C` / `#B8991F` / `#3F8F2F`
- **Terms checkbox** — required before submit; label: "I agree to the Terms and Privacy Policy." (linkified)
- **Continue button** — coral (`#E85F34`), full-width, size `lg`, right-arrow glyph

### Step-specific
| Field | Validation |
|---|---|
| Workspace name | Required, 2+ chars |
| Property count (host) | 1 of 4 chips required |
| Timezone | Pre-selected `America/Los_Angeles`; editable select |
| Work style (cleaner) | 1 of 2 chips required |
| Business name (cleaner) | Required, 2+ chars |
| Service area (cleaner) | Optional |
| Team code | Exactly 6+ alphanumeric characters after stripping; uppercase |

### Progress pips
Show above the screen title on multi-step flows:
- Accent color (`#E85F34` for host direct) on the current pip
- 32px wide pill for current, 6px dot for others
- `••○` pattern — exclude the role picker and success screens from the count

Direct-host has 2 pips (Account, Workspace). Direct-cleaner has 2 pips. Teammate-code has 2 pips (Code, Account). Invite has 1 pip (Account) — or omit entirely when there's only 1 step.

---

## 8 · Edge cases — all required

| Case | Trigger | Treatment |
|---|---|---|
| **Email already exists** | Server returns 409 on email submit | Inline error under email field (red, `#9A2F2A`): "An account with this email already exists. Sign in instead?" — with link to `/login?email=…` |
| **Invite email mismatch** | User edits pre-filled email to something different | Inline error: "This invite was sent to maria@…. Use that address or ask for a new invite." — allow submit anyway if they've confirmed they want to transfer the invite (phase 2; for now, block) |
| **Expired invite** | API returns 410 on token load | Dedicated `StepInviteExpired` screen: clock icon, "This link has lapsed." copy, **two CTAs**: "Request a new link" (emails inviter to re-send), "Sign in instead" |
| **Invalid team code** | Code check fails | Inline error under code field: "We don't recognize that code. Double-check with your team lead." |
| **Weak password** | Strength ≤ 1 | Submit disabled; strength meter shows red "Too weak" |
| **Google SSO email mismatch** (invite) | SSO email ≠ invite email | Same error as invite mismatch; offer to sign out of Google and try again |
| **No terms checkbox** | Checkbox unchecked | Submit button disabled (no error shown) |

---

## 9 · Motion

Match the rest of the app (`--dur-base: 150ms`, `--ease-standard: cubic-bezier(0.2, 0, 0, 1)`).
- Step transitions: 220–320ms fade + slight translate (`slideFromRight` for forward, `slideFromLeft` for back)
- Role change in the left panel: 500ms background crossfade; headline re-animates with `slide-in-l`
- Success screen checkmark: 1.6s `pulse-ring` once on mount
- Button press: `active:scale-[0.98]`

---

## 10 · Post-signup

**Do not render a welcome tour inside the signup flow.** `StepSuccess` is a 2-second landing that previews what's next, then the user lands on their **empty dashboard with a guided tour overlay** — see the `/dashboard` handoff or existing empty-state work.

Send a verification email on account creation, but **do not gate the dashboard**. The user can use the app immediately; unverified state is a top-of-dashboard banner only.

---

## 11 · Things to double-check with design before implementing

Flag these to the designer (me) before shipping:

1. **Sage + sky role accents** (`#2F7A3F`, `#2F6BBD`) are **new** and not yet in `colors_and_type.css`. Options: (a) add them as proper tokens, (b) fall back to coral for all roles and differentiate via iconography only, (c) use the existing `--sage-600` and `--sky-600` (which are `#3B6D11` and `#185FA5` — deeper, less vivid). Pick one and make it permanent.
2. **"Solo / I have a crew" chips use emoji** (👤 👥) — matches the warm editorial tone but is inconsistent with the rest of the app (Lucide only). Replace with Lucide `<User />` and `<Users />` if the design system team objects.
3. **"Already have an account? Sign in" placement** — currently top-right of the desktop panel. Alternative: below the form on the right column. The left-panel placement is more discoverable but less conventional.
4. **Invite context card shows property list** (for cleaner invites) — up to 3 properties, then "+N more". Confirm this is what the inviter wants visible to the invitee pre-accept.
5. **Team code format** — prototype accepts anything 6+ alphanumeric. Server spec? Suggest 8 characters with a dash like `SPRK-7Q2X`.

---

## 12 · Wiring notes

- New route `/invite/:token` — loads the invite, renders the signup flow in "accept" mode. If token is invalid/expired → `/invite/:token/expired`.
- New route `/signup/join` — team-code entry. Use a stepper with the code as step 1 so the verified workspace context can be shown on step 2 (account).
- `/signup` with no token: role picker → branch.
- All signup screens share the same `SignupShell` (left panel + right form + footer). Role and invite are passed in as props to the shell.
- Persist `{ role, step, form state }` in `sessionStorage` only — do **not** cross tabs. On refresh mid-flow, restore the step.
- After successful submit on the final step, call `/auth/complete` → sets the session cookie → `router.push('/dashboard')`. The guided tour picks up from there.
- The invite email template lives in… (Claude Code: grep for `invite` in `turnzy-backend/` — likely Postmark or SendGrid templates). Update the CTA URL to `/invite/:token`.

---

## 13 · Scope (nice-to-have, phase 2)

- Referral tracking (`utm_source=invite_email`)
- Magic-link fallback ("Email me a sign-in link" below the password field)
- SMS auth for cleaner teammates who don't check email often
- A "tour" of the invite context card showing the inviter's last-seen-online

Ask before building any of these.
