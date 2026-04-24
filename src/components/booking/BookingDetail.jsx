// Booking detail pane — redesign per booking_detail_redesign spec.
// Stacked schedule + cleaner cards in a left column capped at ~720px,
// a full-height warm rail on the right, and a single CTARow driven by
// a derived cleanerState. No cleaner-directory, no message-cleaner, no
// date header strip — just a floating close button and the hero.

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, Mail, MapPin, Clock, AlertTriangle, Check, ChevronDown, ShieldOff,
  RotateCw, Users, Info, XCircle, CalendarClock, ArrowUpRight,
} from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';
import { Skeleton } from '../ui/Skeleton';
import { PropertyRail } from '../PropertyRail';

/* ============================================================================
   TOKENS — copied from the design prototype's T object.
   ============================================================================ */
const T = {
  coral50:  '#FAECE7',
  coral100: '#F5C4B3',
  coral400: '#D85A30',
  coral500: '#C24E28',
  coral600: '#993C1D',
  coral800: '#712B13',
  warm50:   '#F9F8F6',
  warm100:  '#F1EFE8',
  warm200:  '#D3D1C7',
  warm300:  '#B8B7B0',
  warm400:  '#888780',
  warm600:  '#5F5E5A',
  warm800:  '#2C2C2A',
  amber50:  '#FAEEDA',
  amber200: '#FAC775',
  amber400: '#EF9F27',
  amber800: '#854F0B',
  sage50:   '#EAF3DE',
  sage200:  '#C0DD97',
  sage400:  '#639922',
  sage800:  '#27500A',
  sky200:   '#B5D4F4',
  sky400:   '#378ADD',
  sky800:   '#0C447C',
  danger50: '#FCEBEB',
  danger200:'#F7C1C1',
  danger400:'#E24B4A',
  danger600:'#A32D2D',
  danger800:'#791F1F',
  surface:  '#FFFFFF',
  borderSoft:'#EDEAE0',
};

/* ============================================================================
   PRIMITIVES — inlined, so this pane stays self-contained.
   ============================================================================ */
function Eyebrow({ children, color = T.warm400, style }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
      textTransform: 'uppercase', color, ...style,
    }}>{children}</div>
  );
}

function Pill({ children, tone = 'neutral', dot = false }) {
  const tones = {
    neutral: { bg: T.warm100,  fg: T.warm600,   ring: T.warm200,   dot: T.warm400   },
    coral:   { bg: T.coral50,  fg: T.coral800,  ring: T.coral100,  dot: T.coral400  },
    amber:   { bg: T.amber50,  fg: T.amber800,  ring: T.amber200,  dot: T.amber400  },
    urgent:  { bg: T.danger50, fg: T.danger800, ring: T.danger200, dot: T.danger400 },
    sage:    { bg: T.sage50,   fg: T.sage800,   ring: T.sage200,   dot: T.sage400   },
    ghost:   { bg: 'transparent', fg: T.warm400, ring: T.warm200,  dot: T.warm400   },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 999,
      background: t.bg, color: t.fg,
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
      textTransform: 'uppercase',
      boxShadow: `inset 0 0 0 1px ${t.ring}`,
      whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot }} />}
      {children}
    </span>
  );
}

function Button({
  children, variant = 'primary', size = 'md', onClick, disabled,
  leftIcon, rightIcon, fullWidth, style,
}) {
  const variants = {
    primary: { bg: T.coral400, fg: '#fff', hover: T.coral500, border: 'transparent' },
    ink:     { bg: '#1F1D1A',  fg: '#fff', hover: '#2C2A26',  border: 'transparent' },
    outline: { bg: '#fff',     fg: T.warm800, hover: T.warm50, border: T.warm200 },
    ghost:   { bg: 'transparent', fg: T.warm600, hover: T.warm100, border: 'transparent' },
  };
  const v = variants[variant] || variants.primary;
  const h  = size === 'sm' ? 30 : size === 'lg' ? 44 : 36;
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
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        whiteSpace: 'nowrap', fontFamily: 'inherit', ...style,
      }}
    >
      {leftIcon}{children}{rightIcon}
    </button>
  );
}

function TextLink({ children, onClick, tone = 'muted', style }) {
  const color = tone === 'coral' ? T.coral400 : tone === 'danger' ? T.danger600 : tone === 'ink' ? T.warm800 : T.warm600;
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        color, fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
        textDecoration: hover ? 'underline' : 'none',
        textUnderlineOffset: 3, ...style,
      }}>
      {children}
    </button>
  );
}

/* ============================================================================
   State derivation — booking → cleanerState
   ============================================================================ */
function deriveCleanerState(b, sentToBackup) {
  // Backend today has one cleaner_status field that flips back to 'pending'
  // after the host hits "send to backup", so we use a local `sentToBackup`
  // flag to distinguish primary vs backup awaiting. Once the backend tracks
  // backup_status explicitly, replace this function with a straight read.
  const s = b?.cleaner_status;
  if (sentToBackup) {
    if (s === 'accepted') return 'backup_accepted';
    if (s === 'declined') return 'backup_declined';
    return 'backup_awaiting';
  }
  if (s === 'accepted') return 'primary_accepted';
  if (s === 'declined') return 'primary_declined';
  return 'primary_awaiting';
}

/* ============================================================================
   HERO
   ============================================================================ */
function Hero({ booking, cleanerState, activeFirst, dismissed, hasBackup, primaryFirst, backupFirst, timeRequestPending, timeRequestAccepted }) {
  let eyebrowIcon = <Clock size={12} />;
  let eyebrowText = `Awaiting ${activeFirst}`;
  let eyebrowColor = T.coral400;

  if (dismissed) {
    eyebrowIcon = <ShieldOff size={12} />;
    eyebrowText = 'Dismissed · manually handled';
    eyebrowColor = T.warm400;
  } else if (cleanerState === 'primary_declined') {
    eyebrowIcon = <AlertTriangle size={12} />;
    eyebrowText = hasBackup ? `${primaryFirst} declined · notify backup` : `${primaryFirst} declined · no backup set`;
    eyebrowColor = T.danger600;
  } else if (cleanerState === 'backup_declined') {
    eyebrowIcon = <AlertTriangle size={12} />;
    eyebrowText = 'Both cleaners declined';
    eyebrowColor = T.danger600;
  } else if (cleanerState === 'primary_accepted' || cleanerState === 'backup_accepted') {
    eyebrowIcon = <Check size={12} />;
    eyebrowText = 'Turnover confirmed';
    eyebrowColor = T.sage400;
  } else if (timeRequestPending) {
    eyebrowIcon = <Clock size={12} />;
    eyebrowText = `Time update requested · awaiting ${activeFirst}`;
    eyebrowColor = T.coral400;
  } else if (timeRequestAccepted) {
    eyebrowIcon = <Check size={12} />;
    eyebrowText = `Time update accepted by ${activeFirst}`;
    eyebrowColor = T.sage400;
  }

  const { month, day } = getMonthDay(booking.checkout_date);
  const title = `${month} ${day} Turnover`;
  const isSameDay = booking.booking_type === 'SAME_DAY' || !!booking.is_same_day;

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{
        margin: '0 0 10px', fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em',
        lineHeight: 1.1, color: T.warm800, fontFamily: 'inherit',
      }}>{title}</h1>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, color: T.warm600,
        fontSize: 14, flexWrap: 'wrap',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: T.warm800 }}>
          <MapPin size={14} /> {booking.property_name || 'Property'}
        </span>
        {isSameDay && (
          <>
            <span style={{ color: T.warm300 }}>·</span>
            <Pill tone="coral" dot>Same-day turnover</Pill>
          </>
        )}
        <span style={{ color: T.warm300 }}>·</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: eyebrowColor, fontSize: 11, fontWeight: 800,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {eyebrowIcon} <span>{eyebrowText}</span>
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
   SCHEDULE
   ============================================================================ */
function TimeCell({ label, time, date, field, editing, onRequestUpdate, onSubmitTimeChange, onCancelEdit, bookingId }) {
  const [hover, setHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [newTime, setNewTime] = useState(time || '');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    setSending(true);
    try {
      await bookingsApi.requestTimeChange(bookingId, {
        type: field === 'checkout' ? 'late_checkout' : 'early_checkin',
        requested_time: newTime,
        reason: note,
      });
      onSubmitTimeChange();
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '18px 20px', position: 'relative',
        background: hover && !editing ? '#FBFAF5' : 'transparent',
        transition: 'background 150ms', minWidth: 0,
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      <div
        className="tabular"
        style={{
          fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em',
          lineHeight: 1.1, color: T.warm800, marginTop: 6, whiteSpace: 'nowrap',
        }}
      >
        {time}
      </div>
      <div style={{ fontSize: 13, color: T.warm600, marginTop: 4, whiteSpace: 'nowrap' }}>{date}</div>
      {!editing && (
        <button
          onClick={onRequestUpdate}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            marginTop: 12,
            background: btnHover ? T.coral50 : 'transparent',
            border: `1px solid ${btnHover ? T.coral100 : T.warm200}`,
            borderRadius: 8, padding: '5px 11px', cursor: 'pointer',
            color: T.coral400, fontSize: 12, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all 150ms', fontFamily: 'inherit',
          }}
        >
          <CalendarClock size={12} /> Request update
        </button>
      )}
      {editing && (
        <div style={{
          marginTop: 12, padding: 12, background: T.coral50,
          border: `1px solid ${T.coral100}`, borderRadius: 8,
        }}>
          <Eyebrow color={T.coral800} style={{ marginBottom: 6 }}>Propose a new time</Eyebrow>
          <input
            type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 6,
              border: `1px solid ${T.warm200}`, fontSize: 13,
              fontFamily: 'inherit', background: '#fff',
            }}
          />
          <textarea
            rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note…"
            style={{
              width: '100%', marginTop: 6, padding: '8px 10px',
              borderRadius: 6, border: `1px solid ${T.warm200}`,
              fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button size="sm" onClick={submit} disabled={!newTime || sending}>
              {sending ? 'Sending…' : 'Send request'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ booking, editingField, onRequestUpdate, onSubmitTimeChange, onCancelEdit }) {
  const coTime = fmtTime(booking.checkout_time || booking.default_checkout_time || '11:00');
  const ciTime = fmtTime(booking.checkin_time || booking.default_checkin_time || '15:00');
  const checkinDate = booking.next_checkin_date || booking.checkin_date;

  return (
    <div>
      <Eyebrow style={{ marginBottom: 10 }}>Schedule</Eyebrow>
      <div style={{
        border: `1px solid ${T.warm200}`, borderRadius: 12, background: T.surface,
        boxShadow: '0 1px 2px rgba(44,44,42,0.04)', overflow: 'hidden',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
          <TimeCell
            field="checkout" label="Checkout"
            time={coTime} date={fmtDateLong(booking.checkout_date)}
            editing={editingField === 'checkout'}
            onRequestUpdate={() => onRequestUpdate('checkout')}
            onSubmitTimeChange={onSubmitTimeChange}
            onCancelEdit={onCancelEdit}
            bookingId={booking.id}
          />
          <div style={{ background: T.borderSoft }} />
          <TimeCell
            field="checkin" label="Next check-in"
            time={ciTime} date={fmtDateLong(checkinDate)}
            editing={editingField === 'checkin'}
            onRequestUpdate={() => onRequestUpdate('checkin')}
            onSubmitTimeChange={onSubmitTimeChange}
            onCancelEdit={onCancelEdit}
            bookingId={booking.id}
          />
        </div>
        <div style={{
          background: '#FBF8F1', borderTop: `1px solid ${T.borderSoft}`,
          padding: '12px 16px', display: 'flex', gap: 10,
          fontSize: 12.5, color: T.warm600, lineHeight: 1.5,
        }}>
          <span style={{ color: T.warm400, flexShrink: 0, marginTop: 2 }}>
            <Info size={14} />
          </span>
          <span>
            Schedule changes from Airbnb sync automatically. Tap{' '}
            <strong style={{ fontWeight: 700, color: T.coral400 }}>Request update</strong>{' '}
            to propose a different time — your cleaner can accept or decline.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   CLEANER CARD
   ============================================================================ */
function primaryStatusFor(state) {
  switch (state) {
    case 'primary_awaiting': return { pill: { tone: 'amber',   label: 'Awaiting'   }, sub: 'Notified — awaiting response',     dimmed: false };
    case 'primary_accepted': return { pill: { tone: 'sage',    label: 'Confirmed'  }, sub: 'Accepted the turnover',            dimmed: false };
    case 'primary_declined': return { pill: { tone: 'urgent',  label: 'Declined'   }, sub: 'Unavailable for this turnover',    dimmed: true };
    case 'backup_awaiting':
    case 'backup_accepted':
    case 'backup_declined':  return { pill: { tone: 'urgent',  label: 'Declined'   }, sub: 'Out of rotation for this turnover', dimmed: true };
    default:                 return { pill: { tone: 'neutral', label: '—'         }, sub: '', dimmed: true };
  }
}

function backupStatusFor(state, primaryFirst) {
  switch (state) {
    case 'primary_awaiting':
    case 'primary_accepted': return { pill: { tone: 'ghost',  label: 'Standing by' }, sub: `Will be notified if ${primaryFirst} declines`, dimmed: true };
    case 'primary_declined': return { pill: { tone: 'coral',  label: 'Next up'     }, sub: 'Ready to notify',                              dimmed: false };
    case 'backup_awaiting':  return { pill: { tone: 'amber',  label: 'Awaiting'    }, sub: 'Notified — awaiting response',                dimmed: false };
    case 'backup_accepted':  return { pill: { tone: 'sage',   label: 'Covering'    }, sub: 'Accepted — covering this turnover',            dimmed: false };
    case 'backup_declined':  return { pill: { tone: 'urgent', label: 'Declined'    }, sub: 'Also unavailable',                            dimmed: true };
    default:                 return { pill: { tone: 'neutral',label: '—'          }, sub: '', dimmed: true };
  }
}

function initialsOf(name, email) {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function CleanerRow({ name, email, role, roleColor, status }) {
  const hue = role === 'Backup' ? '#1F538E' : '#E85F34';
  const initials = initialsOf(name, email);
  return (
    <div style={{
      padding: '14px 16px', display: 'flex', alignItems: 'flex-start',
      gap: 14, opacity: status.dimmed ? 0.65 : 1,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 999,
        background: `linear-gradient(135deg, ${hue}, ${hue}cc)`,
        color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 13, fontWeight: 800,
        flexShrink: 0, filter: status.dimmed ? 'grayscale(0.5)' : 'none',
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: T.warm800, whiteSpace: 'nowrap' }}>
            {name || email || '—'}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: roleColor,
            padding: '2px 6px', background: T.warm100, borderRadius: 4,
            whiteSpace: 'nowrap',
          }}>{role}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
          <Pill tone={status.pill.tone} dot>{status.pill.label}</Pill>
          {status.sub && <span style={{ fontSize: 12.5, color: T.warm600 }}>{status.sub}</span>}
        </div>
      </div>
    </div>
  );
}

function CleanerCard({ booking, cleanerState, hasBackup, primaryFirst }) {
  // No cleaner configured at all
  if (!booking.cleaner_name && !booking.cleaner_email) {
    return (
      <div>
        <Eyebrow style={{ marginBottom: 10 }}>Cleaner</Eyebrow>
        <div style={{
          border: `1px dashed ${T.warm200}`, borderRadius: 12, background: T.surface,
          padding: '20px', display: 'flex', flexDirection: 'column', gap: 10,
          alignItems: 'flex-start',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8, background: T.warm100, color: T.warm400,
          }}>
            <Users size={18} />
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.warm800 }}>
            No cleaner assigned
          </div>
          <div style={{ fontSize: 13, color: T.warm600, lineHeight: 1.45 }}>
            Add a primary cleaner in property settings. We'll notify them automatically
            for every turnover.
          </div>
        </div>
      </div>
    );
  }

  const primaryStatus = primaryStatusFor(cleanerState);
  const backupStatus = hasBackup ? backupStatusFor(cleanerState, primaryFirst) : null;

  return (
    <div>
      <Eyebrow style={{ marginBottom: 10 }}>Cleaner</Eyebrow>
      <div style={{
        border: `1px solid ${T.warm200}`, borderRadius: 12, background: T.surface,
        boxShadow: '0 1px 2px rgba(44,44,42,0.04)', overflow: 'hidden',
      }}>
        <CleanerRow
          name={booking.cleaner_name} email={booking.cleaner_email}
          role="Primary" roleColor={T.warm800} status={primaryStatus}
        />
        {hasBackup ? (
          <>
            <div style={{ height: 1, background: T.borderSoft }} />
            <CleanerRow
              name={booking.backup_cleaner_name} email={booking.backup_cleaner_email}
              role="Backup" roleColor={T.sky800} status={backupStatus}
            />
          </>
        ) : (
          <>
            <div style={{ height: 1, background: T.borderSoft }} />
            <div style={{
              padding: '12px 16px', fontSize: 12.5, color: T.warm600,
              background: '#FBF8F1', display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ color: T.warm400, marginTop: 1 }}>
                <Info size={13} />
              </span>
              <span>
                No backup set. Add one in{' '}
                <TextLink tone="ink" style={{ fontSize: 12.5, fontWeight: 700 }}>
                  property settings
                </TextLink>{' '}
                so we have someone to fall back on.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   CTA ROW / DEAD-END / PRIMARY ACTIONS (the 7-state switch)
   ============================================================================ */
function CTARow({ primary, helper, onDismiss }) {
  return (
    <div style={{ maxWidth: 640 }}>
      {primary && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant={primary.variant || 'primary'} size="lg"
            leftIcon={primary.icon} onClick={primary.onClick}
            disabled={primary.loading}
          >
            {primary.loading ? 'Sending…' : primary.label}
          </Button>
        </div>
      )}
      {helper && (
        <div style={{ fontSize: 12.5, color: T.warm600, marginTop: 10, lineHeight: 1.5 }}>
          {helper}
        </div>
      )}
      <div style={{
        marginTop: 16, display: 'flex', alignItems: 'center',
        gap: 8, fontSize: 12.5, color: T.warm400,
      }}>
        <TextLink onClick={onDismiss}>Dismiss — I'll handle this manually</TextLink>
        <span style={{ color: T.warm300 }}>·</span>
        <span>mutes further notifications</span>
      </div>
    </div>
  );
}

function DeadEnd({ title, body, secondaryLabel, secondaryIcon, onDismiss, dismissing }) {
  return (
    <div style={{
      maxWidth: 640, padding: '18px 20px', background: T.surface,
      border: `1px solid ${T.warm200}`, borderRadius: 12,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: T.danger50, color: T.danger600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 800, color: T.warm800,
            letterSpacing: '-0.01em', lineHeight: 1.35,
          }}>{title}</div>
          <div style={{ fontSize: 13, color: T.warm600, marginTop: 6, lineHeight: 1.55 }}>
            {body}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="primary" size="md" leftIcon={<ShieldOff size={14} />}
              onClick={onDismiss} disabled={dismissing}
            >
              {dismissing ? 'Dismissing…' : 'Dismiss this turnover'}
            </Button>
            {secondaryLabel && (
              <Button variant="outline" size="md" rightIcon={secondaryIcon}>
                {secondaryLabel}
              </Button>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.warm400, marginTop: 10 }}>
            Dismissing mutes further notifications for this booking.
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimaryActions({ booking, cleanerState, hasBackup, primaryFirst, backupFirst, dismissed, onAction }) {
  const [busy, setBusy] = useState(null);
  async function run(key, fn) {
    setBusy(key);
    try { await fn(); onAction(); } finally { setBusy(null); }
  }

  if (dismissed) {
    return (
      <div style={{ maxWidth: 420 }}>
        <Button
          variant="outline" leftIcon={<RotateCw size={14} />}
          onClick={() => run('reopen', () => bookingsApi.resend(booking.id))}
        >
          Re-open and resume notifications
        </Button>
      </div>
    );
  }

  const dismiss = () => run('dismiss', () => bookingsApi.dismiss(booking.id));

  if (cleanerState === 'primary_awaiting') {
    return (
      <CTARow
        primary={{
          label: `Send ${primaryFirst} a reminder`, icon: <Mail size={16} />,
          onClick: () => run('remind', () => bookingsApi.resend(booking.id)),
          loading: busy === 'remind',
        }}
        helper={`We re-send every 24 hours automatically. Use this if you want a faster answer.`}
        onDismiss={dismiss}
      />
    );
  }
  if (cleanerState === 'primary_accepted') {
    return (
      <CTARow
        helper={`${primaryFirst} accepted. Confirmed and locked in — nothing else needs to happen here.`}
        onDismiss={dismiss}
      />
    );
  }
  if (cleanerState === 'primary_declined') {
    if (hasBackup) {
      return (
        <CTARow
          primary={{
            label: `Notify ${backupFirst} (backup)`, icon: <Mail size={16} />,
            onClick: () => run('backup', () => bookingsApi.sendBackup(booking.id)),
            loading: busy === 'backup',
          }}
          helper={`${primaryFirst} declined. Sending to your backup keeps the turnover moving — they'll accept or decline next.`}
          onDismiss={dismiss}
        />
      );
    }
    return (
      <DeadEnd
        title={`${primaryFirst} declined and there's no backup to escalate to`}
        body={`No one else to notify for this turnover. Dismiss to handle it manually this time, and add a backup cleaner to ${booking.property_name || 'this property'} so we can escalate automatically next time.`}
        secondaryLabel={`Set up a backup for ${booking.property_name || 'this property'}`}
        secondaryIcon={<ArrowUpRight size={13} />}
        onDismiss={dismiss}
        dismissing={busy === 'dismiss'}
      />
    );
  }
  if (cleanerState === 'backup_awaiting') {
    return (
      <CTARow
        primary={{
          label: `Send ${backupFirst} a reminder`, icon: <Mail size={16} />,
          onClick: () => run('remind', () => bookingsApi.resend(booking.id)),
          loading: busy === 'remind',
        }}
        helper={`Escalated to your backup after ${primaryFirst} declined. We re-send every 24 hours — use this for a faster answer.`}
        onDismiss={dismiss}
      />
    );
  }
  if (cleanerState === 'backup_accepted') {
    return (
      <CTARow
        helper={`${backupFirst} is covering this turnover as your backup. All set — nothing else to do.`}
        onDismiss={dismiss}
      />
    );
  }
  if (cleanerState === 'backup_declined') {
    return (
      <DeadEnd
        title="Both cleaners declined this turnover"
        body={`${primaryFirst} and ${backupFirst} both said no. No one else to notify — dismiss to handle it manually.`}
        onDismiss={dismiss}
        dismissing={busy === 'dismiss'}
      />
    );
  }
  return null;
}

/* ============================================================================
   ACTIVITY TIMELINE — collapsible
   ============================================================================ */
function TimelineEntry({ title, time, last }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: T.warm300 }} />
        {!last && <span style={{ flex: 1, width: 1, minHeight: 18, background: T.borderSoft, marginTop: 2 }} />}
      </div>
      <div style={{ padding: '2px 0 14px' }}>
        <div style={{ fontSize: 13.5, color: T.warm800, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: T.warm400, marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}

function Activity({ timeline }) {
  const [open, setOpen] = useState(false);
  if (!timeline?.length) return null;
  return (
    <div style={{ marginTop: 40, maxWidth: 640 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', color: T.warm600, fontSize: 11, fontWeight: 800,
          letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'inherit',
        }}
      >
        <span style={{
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 160ms', display: 'inline-flex',
        }}>
          <ChevronDown size={12} />
        </span>
        Activity · {timeline.length} event{timeline.length === 1 ? '' : 's'}
      </button>
      {open && (
        <div style={{ marginTop: 6, paddingLeft: 6 }}>
          {timeline.map((t, i) => (
            <TimelineEntry
              key={i}
              title={t.description || t.event_type}
              time={t.created_at ? new Date(t.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true,
              }) : ''}
              last={i === timeline.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   TOP-LEVEL PANE
   ============================================================================ */
export function BookingDetail({ bookingId, onClose }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.getOne(bookingId),
    enabled: !!bookingId,
  });

  const [editingField, setEditingField] = useState(null);
  const [sentToBackup, setSentToBackup] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);

  const b = data?.data;
  const hasBackup = useMemo(
    () => !!(b?.backup_cleaner_name || b?.backup_cleaner_email || b?.has_backup_cleaner),
    [b],
  );
  const cleanerState = useMemo(() => deriveCleanerState(b, sentToBackup), [b, sentToBackup]);

  // firstNameOrRole: real first name when we have one, else a readable role
  // phrase. We never split the fallback — `"your cleaner".split()[0]` was
  // surfacing the word "the" in sentences like "the is notified".
  const firstNameOrRole = (name, email, roleFallback) => {
    const src = (name || email || '').trim();
    if (!src) return roleFallback;
    return src.split(/\s+/)[0];
  };
  const primaryFirst = firstNameOrRole(b?.cleaner_name, b?.cleaner_email, 'your cleaner');
  const backupFirst = firstNameOrRole(b?.backup_cleaner_name, b?.backup_cleaner_email, 'your backup');
  const activeFirst = cleanerState.startsWith('backup_') ? backupFirst : primaryFirst;

  const dismissed = localDismissed || b?.cleaner_status === 'dismissed';

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
  }

  function handleAction() {
    // Optimistic local state transitions, then refetch.
    // Notify-backup flips us into the backup_* branch; Dismiss flips dismissed.
    if (cleanerState === 'primary_declined' && hasBackup && !sentToBackup) {
      setSentToBackup(true);
    }
    setLocalDismissed(true);
    refresh();
  }

  if (isLoading) {
    return (
      <div style={{ padding: 40, background: T.warm50, minHeight: '100%' }}>
        <Skeleton className="h-8 w-48" />
        <div className="mt-4"><Skeleton className="h-4 w-32" /></div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
        <div className="mt-6"><Skeleton className="h-24" /></div>
      </div>
    );
  }

  if (!b) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: T.warm400, background: T.warm50,
      }}>
        Booking not found
      </div>
    );
  }

  const timeRequestPending = !!b.pending_time_request;
  const timeRequestAccepted = !!b.accepted_time_request;

  return (
    <main
      data-testid="booking-detail"
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: T.warm50, overflow: 'hidden',
        position: 'relative', minWidth: 0,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 16, right: 20, zIndex: 20,
          width: 36, height: 36, borderRadius: 8, border: 'none',
          background: 'transparent', color: T.warm600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X size={18} />
      </button>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          display: 'flex', gap: 0, alignItems: 'stretch',
          flexWrap: 'wrap', minHeight: '100%',
        }}>
          <div style={{
            flex: '1 1 640px', maxWidth: 760, minWidth: 0,
            padding: '32px 40px 80px',
          }}>
            <Hero
              booking={b} cleanerState={cleanerState}
              activeFirst={activeFirst} dismissed={dismissed} hasBackup={hasBackup}
              primaryFirst={primaryFirst} backupFirst={backupFirst}
              timeRequestPending={timeRequestPending}
              timeRequestAccepted={timeRequestAccepted}
            />
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <ScheduleCard
                booking={b}
                editingField={editingField}
                onRequestUpdate={(f) => setEditingField(f)}
                onSubmitTimeChange={() => { setEditingField(null); refresh(); }}
                onCancelEdit={() => setEditingField(null)}
              />
              <CleanerCard
                booking={b} cleanerState={cleanerState}
                hasBackup={hasBackup} primaryFirst={primaryFirst}
              />
            </div>
            <div style={{ marginTop: 28 }}>
              <PrimaryActions
                booking={b} cleanerState={cleanerState}
                hasBackup={hasBackup}
                primaryFirst={primaryFirst} backupFirst={backupFirst}
                dismissed={dismissed} onAction={handleAction}
              />
            </div>
            <Activity timeline={b.timeline} />
          </div>
          <PropertyRail />
        </div>
      </div>
    </main>
  );
}
