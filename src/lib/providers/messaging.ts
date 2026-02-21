// Provider interfaces for pluggable messaging & payments

export interface MessagePayload {
  to: string;
  templateKey?: string;
  content: string;
  variables?: Record<string, string>;
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MessagingProvider {
  channel: 'whatsapp' | 'sms' | 'email';
  send(payload: MessagePayload): Promise<MessageResult>;
}

// ─── WhatsApp Provider (stub) ────────────────────────────────

export class WhatsAppProvider implements MessagingProvider {
  channel = 'whatsapp' as const;

  async send(payload: MessagePayload): Promise<MessageResult> {
    console.log(`[WhatsApp STUB] Sending to ${payload.to}:`, payload.content);
    // In production: call WhatsApp Business API
    // const response = await fetch(process.env.WHATSAPP_API_URL!, { ... });
    return {
      success: true,
      messageId: `wa_${Date.now()}`,
    };
  }
}

// ─── SMS Provider (stub) ─────────────────────────────────────

export class SMSProvider implements MessagingProvider {
  channel = 'sms' as const;

  async send(payload: MessagePayload): Promise<MessageResult> {
    console.log(`[SMS STUB] Sending to ${payload.to}:`, payload.content);
    // In production: call SMS gateway (MSG91, Twilio, etc.)
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
    };
  }
}

// ─── Email Provider (stub) ───────────────────────────────────

export class EmailProvider implements MessagingProvider {
  channel = 'email' as const;

  async send(payload: MessagePayload): Promise<MessageResult> {
    console.log(`[Email STUB] Sending to ${payload.to}:`, payload.content);
    return {
      success: true,
      messageId: `email_${Date.now()}`,
    };
  }
}

// Factory
export function getMessagingProvider(channel: string): MessagingProvider {
  switch (channel) {
    case 'whatsapp':
      return new WhatsAppProvider();
    case 'sms':
      return new SMSProvider();
    case 'email':
      return new EmailProvider();
    default:
      throw new Error(`Unknown messaging channel: ${channel}`);
  }
}
