import { Elysia, t } from 'elysia';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { webhookConfigs, phoneNumbers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { webhookSender } from '../services/webhookSender';

export const adminPlugin = new Elysia({ prefix: '/admin' })
  .post('/configure_webhook', async ({ body, set }) => {
    const { target_id, url, verify_token } = body;
    
    if (verify_token) {
        const challenge = uuidv4().replace(/-/g, '');
        try {
            const verifyUrl = new URL(url);
            verifyUrl.searchParams.append('hub.mode', 'subscribe');
            verifyUrl.searchParams.append('hub.challenge', challenge);
            verifyUrl.searchParams.append('hub.verify_token', verify_token);
            
            const verifyRes = await fetch(verifyUrl.toString(), { signal: AbortSignal.timeout(5000) });
            const data = await verifyRes.text();
            
            if (data.trim() !== challenge) {
                set.status = 400;
                return { error: `Webhook verification failed. Expected challenge '${challenge}', got '${data}'` };
            }
        } catch (error: any) {
            set.status = 400;
            return { error: `Webhook verification request failed: ${error.message}` };
        }
    }
    
    // UPSERT the webhook config
    const existing = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, target_id));
    if (existing.length > 0) {
      await db.update(webhookConfigs)
        .set({ url, verifyToken: verify_token || null })
        .where(eq(webhookConfigs.id, target_id));
    } else {
      await db.insert(webhookConfigs).values({
        id: target_id,
        url,
        verifyToken: verify_token || null
      });
    }
    
    return { success: true, message: `Webhook configured for target ${target_id} and verified successfully.` };
  }, {
    body: t.Object({
      target_id: t.String(),
      url: t.String(),
      verify_token: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Admin'],
      summary: 'Configure Webhook Endpoint'
    }
  })
  .post('/trigger_message', async ({ body, set }) => {
    const { phone_number_id, from, message_type, text_body, username } = body as any;
    
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      return { error: 'Invalid phone_number_id' };
    }
    const phone = phones[0]!;
    
    // Check WABA config first, then phone config
    let configRecords = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, phone.wabaId!));
    if (configRecords.length === 0) {
      configRecords = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, phone_number_id));
    }

    if (configRecords.length === 0 || !configRecords[0]!.url) {
        set.status = 400;
        return { error: 'No webhook configured for this WABA or Phone ID' };
    }

    const messageId = 'wamid.' + uuidv4().replace(/-/g, '').substring(0, 24);
    
    const contactProfile: any = { name: "Mock User" };
    if (username) {
        contactProfile.username = username;
    }

    const payload: any = {
        object: "whatsapp_business_account",
        entry: [{
            id: phone.wabaId,
            changes: [{
                value: {
                    messaging_product: "whatsapp",
                    metadata: {
                        display_phone_number: phone.displayPhoneNumber,
                        phone_number_id: phone.id
                    },
                    contacts: [{
                        profile: contactProfile,
                        wa_id: from
                    }],
                    messages: [{
                        from: from,
                        id: messageId,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: message_type,
                    }]
                },
                field: "messages"
            }]
        }]
    };

    if (message_type === 'text') {
        payload.entry[0].changes[0].value.messages[0].text = { body: text_body };
    } else if (message_type === 'image') {
        payload.entry[0].changes[0].value.messages[0].image = { 
            mime_type: "image/jpeg", 
            sha256: "fakehash", 
            id: "fake_media_id" 
        };
    }

    try {
        await webhookSender.sendWebhook(phone.wabaId!, payload);
        return { success: true, message_id: messageId, message: "Webhook triggered successfully" };
    } catch (err: any) {
        set.status = 500;
        return { error: "Failed to trigger webhook", details: err.message };
    }
  }, {
    body: t.Object({
      phone_number_id: t.String(),
      from: t.String(),
      message_type: t.String(),
      text_body: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Admin'],
      summary: 'Trigger Webhook Inbound Message'
    }
  });
