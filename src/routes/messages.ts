import { Elysia, t } from 'elysia';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { phoneNumbers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../utils/auth';
import { createGraphError } from '../utils/errors';
import { webhookSender } from '../services/webhookSender';

export const messagesPlugin = new Elysia({ prefix: '/:version' })
  .use(authPlugin)
  .post('/:id/messages', async ({ params: { version, id }, body, set }) => {
    const phone_number_id = id;
    // 1. Authenticate WABA phone ownership
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone_number_id.', 'OAuthException', 100, null as any);
    }
    const phone = phones[0]!;
    
    // 2. Validate request
    const payload = body as any;

    if (!payload.messaging_product) {
      set.status = 400;
      throw createGraphError('Missing messaging_product', 'OAuthException', 100, null as any);
    }
    if (payload.messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100, null as any);
    }
    if (!payload.to) {
      set.status = 400;
      throw createGraphError('Missing recipient phone number (to)', 'OAuthException', 100, null as any);
    }

    const type = payload.type || 'text';
    const validTypes = ['text', 'image', 'audio', 'video', 'document', 'sticker', 'interactive', 'template', 'location', 'contacts', 'reaction'];
    
    if (!validTypes.includes(type)) {
      set.status = 400;
      throw createGraphError(`Invalid type: ${type}`, 'OAuthException', 100, null as any);
    }
    
    if (payload.recipient_type && payload.recipient_type !== 'individual') {
        set.status = 400;
        throw createGraphError('Only individual recipient_type is fully supported in this mock', 'OAuthException', 100, null as any);
    }

    if (type === 'text') {
        if (!payload.text || typeof payload.text.body !== 'string') {
            set.status = 400;
            throw createGraphError('Missing or invalid text.body payload for text message', 'OAuthException', 100, null as any);
        }
    } else if (type === 'template') {
        if (!payload.template || typeof payload.template.name !== 'string' || !payload.template.language || typeof payload.template.language.code !== 'string') {
            set.status = 400;
            throw createGraphError('Missing template name or language.code', 'OAuthException', 100, null as any);
        }
    } else if (['image', 'video', 'audio', 'document', 'sticker'].includes(type)) {
        if (!payload[type] || (typeof payload[type].id !== 'string' && typeof payload[type].link !== 'string')) {
            set.status = 400;
            throw createGraphError(`Missing id or link for ${type} message`, 'OAuthException', 100, null as any);
        }
    } else if (type === 'interactive') {
        if (!payload.interactive || typeof payload.interactive.type !== 'string') {
            set.status = 400;
            throw createGraphError('Missing interactive type', 'OAuthException', 100, null as any);
        }
    } else if (type === 'contacts') {
        if (!payload.contacts || !Array.isArray(payload.contacts)) {
            set.status = 400;
            throw createGraphError('Contacts must be an array', 'OAuthException', 100, null as any);
        }
    } else if (type === 'location') {
        if (!payload.location || typeof payload.location.latitude !== 'string' || typeof payload.location.longitude !== 'string') {
            set.status = 400;
            throw createGraphError('Location must have latitude and longitude as strings', 'OAuthException', 100, null as any);
        }
    } else if (type === 'reaction') {
        if (!payload.reaction || typeof payload.reaction.message_id !== 'string' || typeof payload.reaction.emoji !== 'string') {
            set.status = 400;
            throw createGraphError('Reaction must have message_id and emoji as strings', 'OAuthException', 100, null as any);
        }
    }

    const messageId = 'wamid.' + uuidv4().replace(/-/g, '').substring(0, 24);
    const to = payload.to;

    // Simulate async status webhooks
    setTimeout(async () => {
      const statusPayload = await webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'sent');
      webhookSender.sendWebhook(phone.wabaId!, statusPayload);
    }, 500);

    setTimeout(async () => {
      const statusPayload = await webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'delivered');
      webhookSender.sendWebhook(phone.wabaId!, statusPayload);
    }, 1500);

    setTimeout(async () => {
      const statusPayload = await webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'read');
      webhookSender.sendWebhook(phone.wabaId!, statusPayload);
    }, 3000);

    return {
      messaging_product: 'whatsapp',
      contacts: [{ input: to, wa_id: to }],
      messages: [{ id: messageId }]
    };
  }, {
    body: t.Any(), // In a real prod environment we could strict type this with Elysia T
    detail: {
      tags: ['Messages'],
      summary: 'Send outbound messages'
    }
  });
