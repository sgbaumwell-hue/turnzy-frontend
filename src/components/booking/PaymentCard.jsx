// PaymentCard — payment-tracking surface inside the booking detail pane.
// Host and cleaner render the same card shell but different bodies +
// actions for the same 4 states:
//
//   unpaid              cleaner marked complete; host owes them
//   payment_marked      host marked paid; cleaner needs to confirm
//   payment_confirmed   terminal — nothing else to do either side
//   payment_not_received cleaner flagged; host needs to re-mark
//
// Turnzy doesn't move money. The card records a handshake so both
// sides know where things stand. Footer copy says so explicitly.
//
// Spec: ~/Downloads/Turnzy Design System (1)/design_handoff_payments

import { useState } from 'react';
import {
  Clock, Check, AlertTriangle, Info, RotateCw, Bell,
} from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { cleanerApi } from '../../api/cleaner';

/* ============================================================================
   TOKENS — mirrored from the prototype T object.
   ============================================================================ */
const T = {
  coral50: '#FAECE7', coral100: '#F5C4B3', coral400: '#D85A30', coral500: '#C24E28', coral800: '#712B13',
  warm100: '#F1EFE8', warm200: '#D3D1C7', warm300: '#B8B7B0', warm400: '#888780', warm600: '#5F5E5A', warm800: '#2C2C2A',
  amber50: '#FAEEDA', amber200: '#FAC775', amber400: '#EF9F27', amber600: '#BA7517', amber800: '#854F0B',
  sage50:  '#EAF3DE', sage200:  '#C0DD97', sage400:  '#639922', sage600:  '#3B6D11', sage800:  '#27500A',
  danger50: '#FCEBEB', danger200: '#F7C1C1', danger600: '#A32D2D', danger800: '#791F1F',
  surface:  '#FFFFFF',
  borderSoft: '#EDEAE0',
};

/* ============================================================================
   Primitives (inlined — keeps this card self-contained)
   ============================================================================ */
function Eyebrow({ children, style }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: T.warm400, ...style,
    }}>{children}</div>
  );
}

function Button({ children, variant = 'primary', size = 'md', onClick, disabled, leftIcon, style }) {
  const variants = {
    primary: { bg: T.coral400, fg: '#fff',      hover: T.coral500, border: 'transparent' },
    outline: { bg: '#fff',     fg: T.warm800,   hover: '#F9F8F6',  border: T.warm200 },
    sage:    { bg: T.sage400,  fg: '#fff',      hover: T.sage600,  border: 'transparent' },
  };
  const v = variants[variant] || variants.primary;
  const h = size === 'sm' ? 30 : size === 'lg' ? 44 : 36;
  const px = size === 'sm' ? 12 : size === 'lg' ? 20 : 14;
  const fs = size === 'sm' ? 12.5 : size === 'lg' ? 14.5 : 13.5;
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: h, padding: `0 ${px}px`, borderRadius: 10,
        background: hover && !disabled ? v.hover : v.bg, color: v.fg,
        border: v.border === 'transparent' ? 'none' : `1px solid ${v.border}`,
        fontSize: fs, fontWeight: 700, letterSpacing: -0.1,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
        whiteSpace: 'nowrap', fontFamily: 'inherit', ...style,
      }}
    >
      {leftIcon}{children}
    </button>
  );
}

function StatusDiamond({ tone }) {
  const map = {
    amber:   { bg: T.amber50,  fg: T.amber600,  icon: <Clock size={16} /> },
    sage:    { bg: T.sage50,   fg: T.sage600,   icon: <Check size={16} /> },
    danger:  { bg: T.danger50, fg: T.danger600, icon: <AlertTriangle size={14} /> },
    neutral: { bg: T.warm100,  fg: T.warm600,   icon: <Clock size={16} /> },
  };
  const s = map[tone] || map.neutral;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, background: s.bg, color: s.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {s.icon}
    </div>
  );
}

function NudgePips({ count = 0 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: 999,
          background: i < count ? T.amber400 : T.warm200,
        }} />
      ))}
    </span>
  );
}

function fmtStamp(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).replace(',', ' ·');
  } catch {
    return null;
  }
}

/* ============================================================================
   HOST bodies (4 states)
   ============================================================================ */
function HostUnpaid({ cleanerFirst, completedAt, onMarkPaid, busy }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="amber" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Payment pending
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            <strong style={{ color: T.warm800, fontWeight: 700 }}>{cleanerFirst}</strong> marked the turnover complete
            {completedAt && <> on <span className="tabular">{completedAt}</span></>}.
            Once you've paid them, mark it here — Turnzy will email them to confirm they got it.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="primary" leftIcon={<Check size={16} />} onClick={onMarkPaid} disabled={busy}>
          {busy ? 'Marking…' : `I've paid ${cleanerFirst}`}
        </Button>
        <div style={{ fontSize: 12, color: T.warm400 }}>
          We'll remind you every 24h for 3 days if you forget.
        </div>
      </div>
    </div>
  );
}

function HostMarked({ cleanerFirst, markedAt }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="amber" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Waiting on {cleanerFirst} to confirm
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            You marked this paid
            {markedAt && <> on <span className="tabular">{markedAt}</span></>}.
            {' '}{cleanerFirst} got an email with one-tap confirm / didn't-receive buttons.
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 14, padding: '10px 12px', background: T.amber50,
        border: `1px solid ${T.amber200}`, borderRadius: 8,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ color: T.amber600, flexShrink: 0, marginTop: 1 }}>
          <Clock size={13} />
        </span>
        <span style={{ fontSize: 12.5, color: T.amber800, lineHeight: 1.5 }}>
          Nothing to do right now. If {cleanerFirst} reports they didn't receive it, we'll bring the action back here.
        </span>
      </div>
    </div>
  );
}

function HostConfirmed({ cleanerFirst, confirmedAt }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="sage" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Payment confirmed by {cleanerFirst}
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            {cleanerFirst} confirmed receipt
            {confirmedAt && <> on <span className="tabular">{confirmedAt}</span></>}.
            {' '}This turnover is closed out on both sides — nothing else needs to happen here.
          </div>
        </div>
      </div>
    </div>
  );
}

function HostNotReceived({ cleanerFirst, markedAt, disputedAt, onReMark, busy }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="danger" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {cleanerFirst} says the payment didn't land
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            You marked paid
            {markedAt && <> on <span className="tabular">{markedAt}</span></>}
            , but {cleanerFirst} flagged it
            {disputedAt && <> on <span className="tabular">{disputedAt}</span></>}.
            {' '}Reach out to them directly (outside Turnzy) to sort it out, then re-mark once it's through.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="primary" leftIcon={<RotateCw size={14} />} onClick={onReMark} disabled={busy}>
          {busy ? 'Marking…' : `I've paid ${cleanerFirst} again`}
        </Button>
        <div style={{ fontSize: 12, color: T.warm400 }}>Restarts confirmation.</div>
      </div>
    </div>
  );
}

/* ============================================================================
   CLEANER bodies (4 states)
   ============================================================================ */
function CleanerAwaiting({ hostFirst, completedAt, nudgeCount, onNudge, busy }) {
  const remaining = Math.max(0, 3 - nudgeCount);
  const maxed = nudgeCount >= 3;
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="neutral" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Awaiting payment from {hostFirst}
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            You marked this complete
            {completedAt && <> on <span className="tabular">{completedAt}</span></>}.
            {' '}Turnzy reminds {hostFirst} automatically at 24h, 48h, and 72h — you can send one more nudge from here if things go quiet.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="outline" leftIcon={<Bell size={14} />} onClick={onNudge} disabled={maxed || busy}>
          {maxed ? 'Reminder limit reached' : busy ? 'Sending…' : `Nudge ${hostFirst}`}
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.warm400 }}>
          <NudgePips count={nudgeCount} />
          <span>
            {nudgeCount === 0
              ? 'No reminders sent yet'
              : maxed
                ? '3 of 3 reminders sent · no more available'
                : `${nudgeCount} of 3 reminders sent · ${remaining} left, 1 per 24h`}
          </span>
        </div>
      </div>
    </div>
  );
}

function CleanerSent({ hostFirst, markedAt, onConfirm, onDispute, busy }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="amber" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {hostFirst} says payment is on the way
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            {hostFirst} marked this paid
            {markedAt && <> on <span className="tabular">{markedAt}</span></>}.
            {' '}Once it lands in your account, confirm here. If it hasn't arrived after a reasonable wait, let us know and {hostFirst} will be alerted to re-send.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="sage" leftIcon={<Check size={16} />} onClick={onConfirm} disabled={busy === 'confirm'}>
          {busy === 'confirm' ? 'Confirming…' : 'Confirm I received it'}
        </Button>
        <Button variant="outline" onClick={onDispute} disabled={busy === 'dispute'}>
          {busy === 'dispute' ? 'Flagging…' : "I haven't received it"}
        </Button>
      </div>
    </div>
  );
}

function CleanerReceived({ hostFirst }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="sage" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Payment received
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            You confirmed receipt from {hostFirst}. This turnover is closed on both sides — nothing else to do.
          </div>
        </div>
      </div>
    </div>
  );
}

function CleanerDisputed({ hostFirst }) {
  return (
    <div style={{ padding: '20px 20px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <StatusDiamond tone="danger" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.warm800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            You flagged this as not received
          </div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, lineHeight: 1.5 }}>
            {hostFirst} was alerted. When they re-send and re-mark, this card will come back so you can confirm. Reach out directly if you need to sort out the method.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Top-level PaymentCard — branches on role + status
   ============================================================================ */
export function PaymentCard({ role, booking, onAfterAction }) {
  const [busy, setBusy] = useState(null);

  const status = booking?.payment_status;
  // Don't render at all if the cleaner hasn't completed the job yet.
  if (!status || status === 'n_a' || status === null) return null;

  // For the host view, there's nothing meaningful to show if no cleaner
  // is assigned (button would read "I've paid your"). Hide the card and
  // let the surrounding "No cleaner assigned" empty state cover this.
  const hasCleaner = !!(booking.cleaner_name || booking.cleaner_email);
  if (role === 'host' && !hasCleaner) return null;

  // firstNameOrRole: real first name when we have one, else a readable
  // role phrase like "your cleaner" / "your host". We never split the
  // fallback — `"your cleaner".split()[0]` was leaking "your" into CTAs.
  const firstNameOrRole = (name, email, fallback) => {
    const src = (name || email || '').trim();
    return src ? src.split(/\s+/)[0] : fallback;
  };
  const cleanerFirst = firstNameOrRole(booking.cleaner_name, booking.cleaner_email, 'your cleaner');
  const hostFirst = firstNameOrRole(booking.host_name, booking.host_email, 'your host');
  const nudgeCount = booking.payment_nudge_count || 0;

  const completedAt = fmtStamp(booking.completed_at);
  const markedAt = fmtStamp(booking.payment_marked_at);
  const confirmedAt = fmtStamp(booking.payment_confirmed_at);
  const disputedAt = fmtStamp(booking.payment_disputed_at);

  async function run(key, fn) {
    setBusy(key);
    try {
      await fn();
      onAfterAction && onAfterAction();
    } finally {
      setBusy(null);
    }
  }

  let body;
  if (role === 'host') {
    if (status === 'unpaid') {
      body = <HostUnpaid cleanerFirst={cleanerFirst} completedAt={completedAt}
        onMarkPaid={() => run('mark', () => bookingsApi.markPaid(booking.id))}
        busy={busy === 'mark'} />;
    } else if (status === 'payment_marked') {
      body = <HostMarked cleanerFirst={cleanerFirst} markedAt={markedAt} />;
    } else if (status === 'payment_confirmed') {
      body = <HostConfirmed cleanerFirst={cleanerFirst} confirmedAt={confirmedAt} />;
    } else if (status === 'payment_not_received') {
      body = <HostNotReceived cleanerFirst={cleanerFirst} markedAt={markedAt} disputedAt={disputedAt}
        onReMark={() => run('mark', () => bookingsApi.markPaid(booking.id))}
        busy={busy === 'mark'} />;
    }
  } else {
    // cleaner
    if (status === 'unpaid' || status === 'payment_not_received') {
      // From the cleaner's perspective, 'payment_not_received' reads as
      // "waiting on host" — they already flagged it and the host will
      // re-mark when ready. Render the disputed-waiting body.
      if (status === 'payment_not_received') {
        body = <CleanerDisputed hostFirst={hostFirst} />;
      } else {
        body = <CleanerAwaiting hostFirst={hostFirst} completedAt={completedAt} nudgeCount={nudgeCount}
          onNudge={() => run('nudge', () => cleanerApi.nudgePayment(booking.id))}
          busy={busy === 'nudge'} />;
      }
    } else if (status === 'payment_marked') {
      body = <CleanerSent hostFirst={hostFirst} markedAt={markedAt}
        onConfirm={() => run('confirm', () => cleanerApi.confirmPayment(booking.id))}
        onDispute={() => run('dispute', () => cleanerApi.paymentNotReceived(booking.id))}
        busy={busy} />;
    } else if (status === 'payment_confirmed') {
      body = <CleanerReceived hostFirst={hostFirst} />;
    }
  }

  if (!body) return null;

  const footerCopy = role === 'host'
    ? <>Turnzy doesn't process payments — pay {cleanerFirst} however you normally do (Venmo, Zelle, cash). This is just a confirmation trail so you both know where things stand.</>
    : <>Turnzy doesn't move money — {hostFirst} pays you however you arranged (Venmo, Zelle, cash). This card just tracks the handshake so you both know where it stands.</>;

  return (
    <div>
      <Eyebrow style={{ marginBottom: 10 }}>Payment</Eyebrow>
      <div style={{
        border: `1px solid ${T.warm200}`, borderRadius: 12, background: T.surface,
        boxShadow: '0 1px 2px rgba(44,44,42,0.04)', overflow: 'hidden',
      }}>
        {body}
        <div style={{
          background: '#FBF8F1', borderTop: `1px solid ${T.borderSoft}`,
          padding: '11px 16px', display: 'flex', gap: 10,
          fontSize: 12, color: T.warm600, lineHeight: 1.5,
        }}>
          <span style={{ color: T.warm400, flexShrink: 0, marginTop: 1 }}>
            <Info size={13} />
          </span>
          <span>{footerCopy}</span>
        </div>
      </div>
    </div>
  );
}
