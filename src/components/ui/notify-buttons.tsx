"use client";

import { MessageCircle, Phone, Send } from "lucide-react";
import { smsLink, telegramLink, whatsappLink } from "@/lib/notify";

/** Three click-to-send buttons (WhatsApp / SMS / Telegram) for a given message. */
export function NotifyButtons({
  phone,
  message,
  compact = false,
}: {
  phone: string | null;
  message: string;
  compact?: boolean;
}) {
  const hasPhone = Boolean(phone && phone.trim());
  const cls =
    "inline-flex items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact && <span className="text-xs text-muted-foreground">Notify via:</span>}
      <a
        href={hasPhone ? whatsappLink(phone!, message) : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!hasPhone}
        className={cls}
        style={hasPhone ? undefined : { pointerEvents: "none", opacity: 0.5 }}
      >
        <MessageCircle className="size-3.5 text-[#25D366]" /> WhatsApp
      </a>
      <a
        href={hasPhone ? smsLink(phone!, message) : undefined}
        aria-disabled={!hasPhone}
        className={cls}
        style={hasPhone ? undefined : { pointerEvents: "none", opacity: 0.5 }}
      >
        <Phone className="size-3.5 text-primary" /> SMS
      </a>
      <a href={telegramLink(message)} target="_blank" rel="noopener noreferrer" className={cls}>
        <Send className="size-3.5 text-[#229ED9]" /> Telegram
      </a>
    </div>
  );
}
