import crypto from 'crypto';
import { db } from '../db';
import { webhookConfigs, phoneNumbers } from '../db/schema';
import { eq } from 'drizzle-orm';

export class WebhookSender {
  async sendWebhook(targetId: string, payload: any) {
    const configRecords = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, targetId));
    if (configRecords.length === 0 || !configRecords[0].url) {
      console.log(`[WebhookSender] No webhook URL configured for target ${targetId}. Skipping.`);
      return;
    }
    const config = configRecords[0];
    const data = JSON.stringify(payload);
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.verifyToken) {
      const hmac = crypto.createHmac('sha256', config.verifyToken);
      hmac.update(data);
      headers['X-Hub-Signature-256'] = `sha256=${hmac.digest('hex')}`;
    }

    try {
      console.log(`[WebhookSender] Dispatching webhook to ${config.url}`);
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: data,
        signal: AbortSignal.timeout(5000)
      });
      console.log(`[WebhookSender] Webhook delivered. Status: ${response.status}`);
    } catch (error: any) {
      console.error(`[WebhookSender] Failed to deliver webhook: ${error.message}`);
    }
  }

  async createMessageStatusPayload(phoneId: string, messageId: string, recipientId: string, status: string, timestamp?: number) {
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phoneId));
    const phone = phones[0];
    
    return {
      object: "whatsapp_business_account",
      entry: [{
        id: phone?.wabaId || "unknown",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: phone?.displayPhoneNumber || "unknown",
              phone_number_id: phoneId
            },
            statuses: [{
              id: messageId,
              status: status,
              timestamp: timestamp || Math.floor(Date.now() / 1000).toString(),
              recipient_id: recipientId,
              pricing: {
                billable: true,
                pricing_model: "CBP",
                category: "authentication"
              }
            }]
          },
          field: "messages"
        }]
      }]
    };
  }
}

export const webhookSender = new WebhookSender();
