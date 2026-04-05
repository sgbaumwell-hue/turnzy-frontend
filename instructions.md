You are implementing a complete forgot password / reset password flow for Turnzy.
Read this entire file before writing a single line of code.

## Context
- Backend: Node/Express in cleaning_management repo. Auth routes are in routes/auth.js. Email sending uses Resend via a helper — check how sendWelcomeEmail or notifyCleaner work and follow that exact pattern for the new reset email.
- Frontend: React/Vite in turnzy-frontend repo. Auth pages are in src/pages/auth/. Login page is Login.jsx. Match its exact layout and styling for all new pages — same card width, same logo, same spacing, same font sizes.
- JWT tokens are stored in localStorage as `turnzy_token`.
- There is currently NO forgot password flow anywhere in the app.

## What to build

### Backend (cleaning_management)

1. Add a `password_reset_tokens` table. Check how existing migrations are structured and follow the same pattern. Columns: id (serial PK), user_id (FK to users, on delete cascade), token (text, unique), expires_at (timestamptz), used (boolean default false), created_at (timestamptz default now).

2. Add `POST /api/auth/forgot-password`:
   - Accept { email } in body
   - Look up user by email
   - If user not found: return 200 anyway — do NOT reveal whether the email exists
   - If user found: generate a secure token with crypto.randomBytes(32).toString('hex'), insert into password_reset_tokens with expires_at = now + 1 hour, call the reset email helper
   - Rate limit: max 3 requests per email per hour — check if rate limiting middleware already exists and reuse it

3. Add `POST /api/auth/reset-password`:
   - Accept { token, newPassword } in body
   - Validate newPassword is at least 8 characters — return 400 with { message: 'Password must be at least 8 characters.' } if not
   - Look up token in password_reset_tokens where used = false and expires_at > now
   - If not found or expired: return 400 with { message: 'This reset link has expired or already been used.' }
   - If valid: hash newPassword with bcrypt (same rounds as signup), update the user's password_hash, set token used = true
   - Return 200 with { message: 'Password updated successfully.' }

4. Create a sendPasswordReset email helper. Follow the exact same structure as sendWelcomeEmail. Template:
   - Subject: `Reset your Turnzy password`
   - Body: `Hi {firstName}, we received a request to reset your Turnzy password. Click below to set a new one. This link expires in 1 hour.`
   - Button: `Reset my password →` linking to `{FRONTEND_URL}/reset-password?token={token}`
   - Footer: `If you didn't request this, you can safely ignore this email. Your password won't change.`

### Frontend (turnzy-frontend)

5. Create src/pages/auth/ForgotPassword.jsx:
   - Match Login.jsx layout exactly — same card, same logo, same outer padding
   - Single email input field, label: `Email`
   - Submit button: `Send reset link` / loading state: `Sending...`
   - On success (any 200): hide the form, show a confirmation view — checkmark icon, heading `Check your email`, body `We sent a reset link to {email}. It expires in 1 hour.`, small gray text below `Didn't get it? Check your spam folder.` with a `Try again` link that resets back to the input form (no navigation, just state reset)
   - On API error: show inline error message below the button
   - At the bottom: `← Back to sign in` link to /login
   - API: POST /api/auth/forgot-password with { email }

6. Create src/pages/auth/ResetPassword.jsx:
   - Match Login.jsx layout exactly
   - On mount: read `token` from URL query params. If token is missing, immediately show an error state: `Invalid link` heading, `This reset link is missing or malformed. Try requesting a new one.` body, `Request new link →` link to /forgot-password
   - Two fields: `New password` and `Confirm password` — both with a show/hide eye toggle (Eye / EyeOff from lucide-react, positioned inside the input on the right)
   - Client-side validation before submit: password must be 8+ characters, passwords must match — show inline errors under the relevant field
   - Submit button: `Set new password` / loading state: `Saving...`
   - On success: show success state — checkmark icon, `Password updated!` heading, `You can now sign in with your new password.` body, `Go to sign in →` link to /login
   - On 400 (expired/used): show error state — `Link expired` heading, `Reset links are valid for 1 hour and can only be used once.` body, `Request a new link →` link to /forgot-password
   - On other error: show generic inline error
   - API: POST /api/auth/reset-password with { token, newPassword }

7. Update Login.jsx:
   - Add a `Forgot password?` link below the password field, right-aligned, small gray text
   - Link to /forgot-password
   - Only place this near the email/password form — not near the Google button

8. Add routes to the router (App.jsx or wherever routes live):
   - /forgot-password → ForgotPassword component, no auth required (public)
   - /reset-password → ResetPassword component, no auth required (public)

## Quality checks before you finish
- ForgotPassword and ResetPassword must look visually identical to Login.jsx. If Login has a max-w-sm card centered on screen, these do too.
- The show/hide eye toggle must toggle input type between `password` and `text`. The icon must switch between Eye and EyeOff to reflect current state.
- The `Try again` link on the ForgotPassword success screen resets component state — it does NOT navigate away.
- Do not add console.log statements.
- Do not leave TODOs or placeholder text.
- After finishing, list every file you created or modified.
