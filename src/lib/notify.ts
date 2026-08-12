/** Free "click-to-send" messaging — builds links that open WhatsApp / SMS /
 *  Telegram pre-filled with a message. No API keys or paid services needed. */

/** Normalize a local phone number to international digits (defaults to Algeria +213). */
export function normalizePhone(phone: string, countryCode = "213"): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = countryCode + d.slice(1);
  else if (!d.startsWith(countryCode) && d.length <= 9) d = countryCode + d;
  return d;
}

export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

export function smsLink(phone: string, text: string): string {
  return `sms:${phone.replace(/\s/g, "")}?body=${encodeURIComponent(text)}`;
}

export function telegramLink(text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(" ")}&text=${encodeURIComponent(text)}`;
}
