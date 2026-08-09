// Central place for the academy's support / fallback contact details.
//
// These power the "contact the admin" fallback shown when automated password
// reset email can't be delivered. The real academy contacts are the defaults
// below, so everything works out of the box. You can still override them per
// deployment (Vercel → Project → Settings → Environment Variables) without
// touching code:
//
//   VITE_SUPPORT_WHATSAPP = 2349032517376   (full international number, digits only)
//   VITE_SUPPORT_EMAIL    = admitwise2@gmail.com

// Admin WhatsApp: 0903 251 7376 -> international form 234 903 251 7376.
const rawWhatsApp = (import.meta.env.VITE_SUPPORT_WHATSAPP || '2349032517376').toString();

// wa.me requires digits only, no '+', spaces or dashes.
export const SUPPORT_WHATSAPP = rawWhatsApp.replace(/[^\d]/g, '');

export const SUPPORT_EMAIL =
  (import.meta.env.VITE_SUPPORT_EMAIL || 'admitwise2@gmail.com').toString();

// Build a click-to-chat link with an optional pre-filled message.
export const whatsappLink = (message?: string): string => {
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const mailtoLink = (subject?: string): string => {
  const base = `mailto:${SUPPORT_EMAIL}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
};

// Build a wa.me link for an arbitrary number (used with the live, admin-editable
// value fetched at runtime). Falls back to the compiled-in default when empty.
export const whatsappLinkFor = (numberDigits: string, message?: string): string => {
  const num = (numberDigits || SUPPORT_WHATSAPP).replace(/[^\d]/g, '') || SUPPORT_WHATSAPP;
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export interface SupportContact {
  whatsapp: string;
  email: string;
}

// The compiled-in defaults, used immediately and as a fallback if the live
// (admin-editable) values can't be fetched.
export const DEFAULT_SUPPORT_CONTACT: SupportContact = {
  whatsapp: SUPPORT_WHATSAPP,
  email: SUPPORT_EMAIL,
};
