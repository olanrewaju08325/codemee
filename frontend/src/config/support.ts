// Central place for the academy's support / fallback contact details.
//
// These power the "contact the admin" fallback shown when automated password
// reset email can't be delivered. Set them in the frontend environment
// (Vercel → Project → Settings → Environment Variables) to override the
// defaults below without touching code:
//
//   VITE_SUPPORT_WHATSAPP = 2348012345678   (full international number, digits only)
//   VITE_SUPPORT_EMAIL    = support@codemeacademy.com
//
// IMPORTANT: replace the WhatsApp fallback below with the real admin number
// (or set VITE_SUPPORT_WHATSAPP) so students reach a live person.

const rawWhatsApp = (import.meta.env.VITE_SUPPORT_WHATSAPP || '2348012345678').toString();

// wa.me requires digits only, no '+', spaces or dashes.
export const SUPPORT_WHATSAPP = rawWhatsApp.replace(/[^\d]/g, '');

export const SUPPORT_EMAIL =
  (import.meta.env.VITE_SUPPORT_EMAIL || 'support@codemeacademy.com').toString();

// Build a click-to-chat link with an optional pre-filled message.
export const whatsappLink = (message?: string): string => {
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const mailtoLink = (subject?: string): string => {
  const base = `mailto:${SUPPORT_EMAIL}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
};
