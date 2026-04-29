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
  .post('/:id/messages', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    // 1. Authenticate WABA phone ownership
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone_number_id.', 'OAuthException', 100);
    }
    const phone = phones[0];
    
    // 2. Validate request
    if (body.messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100);
    }
    if (!body.to) {
      set.status = 400;
      throw createGraphError('Missing recipient phone number (to)', 'OAuthException', 100);
    }

    const type = body.type || 'text';
    
    // Minimal structural validation
    if (type === 'text' && (!body.text || !body.text.body)) {
        set.status = 400;
        throw createGraphError('Missing text.body payload for text message', 'OAuthException', 100);
    } else if (type === 'template' && (!body.template || !body.template.name || !body.template.language)) {
        set.status = 400;
        throw createGraphError('Missing template name or language', 'OAuthException', 100);
    } else if (['image', 'video', 'audio', 'document', 'sticker'].includes(type) && (!body[type] || (!body[type].id && !body[type].link))) {
        set.status = 400;
        throw createGraphError(`Missing id or link for ${type} message`, 'OAuthException', 100);
    } else if (type === 'interactive' && (!body.interactive || !body.interactive.type)) {
        set.status = 400;
        throw createGraphError('Missing interactive type', 'OAuthException', 100);
    } else if (type === 'contacts' && (!body.contacts || !Array.isArray(body.contacts))) {
        set.status = 400;
        throw createGraphError('Contacts must be an array', 'OAuthException', 100);
    } else if (type === 'location' && (!body.location || !body.location.latitude || !body.location.longitude)) {
        set.status = 400;
        throw createGraphError('Location must have latitude and longitude', 'OAuthException', 100);
    } else if (type === 'reaction' && (!body.reaction || !body.reaction.message_id || typeof body.reaction.emoji === 'undefined')) {
        set.status = 400;
        throw createGraphError('Reaction must have message_id and emoji', 'OAuthException', 100);
    }

    const messageId = 'wamid.' + uuidv4().replace(/-/g, '').substring(0, 24);
    const to = body.to;

    // Simulate async status webhooks
    setTimeout(async () => {
      const payload = await webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'sent');
      webhookSender.sendWebhook(phone.wabaId!, payload);
    }, 500);

    setTimeout(async () => {
      const payload = await webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'delivered');
      webhookSender.sendWebhook(phone.wabaId!, payload);
    }, 1500);

    setTimeout(async () => {
      const payload = await webhookSender.createMessageStatusPayload(phone_number_id, messageId, to, 'read');
      webhookSender.sendWebhook(phone.wabaId!, payload);
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
