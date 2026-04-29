import { Elysia, t } from 'elysia';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { phoneNumbers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../utils/auth';
import { createGraphError } from '../utils/errors';

export const businessPlugin = new Elysia({ prefix: '/:version' })
  .use(authPlugin)
  .get('/:id/phone_numbers', async ({ params: { id }, set }) => {
    const waba_id = id;
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.wabaId, waba_id));
    
    const data = phones.map(p => ({
        id: p.id,
        display_phone_number: p.displayPhoneNumber,
        verified_name: p.verifiedName,
        quality_rating: p.qualityRating,
        status: p.status
    }));
    
    return { data, paging: { cursors: { before: "", after: "" } } };
  }, {
    detail: {
      tags: ['Phone Numbers'],
      summary: 'List Phone Numbers'
    }
  })
  .get('/:id/whatsapp_business_profile', async ({ params: { id }, query, set }) => {
    const phone_number_id = id;
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    
    const phone = phones[0];
    const profile: any = phone.profile || {};
    
    const fields = query.fields ? query.fields.split(',') : ['about', 'address', 'description', 'email', 'profile_picture_url', 'websites', 'vertical'];
    
    let responseData: any = { messaging_product: "whatsapp" };
    fields.forEach(f => {
        if (profile[f] !== undefined) responseData[f] = profile[f];
    });
    
    return { data: [responseData] };
  }, {
    query: t.Object({
      fields: t.Optional(t.String())
    }),
    detail: {
      tags: ['Business Profile'],
      summary: 'Get Business Profile'
    }
  })
  .post('/:id/whatsapp_business_profile', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { messaging_product, ...updates } = body as any;
    
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    if (messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100);
    }
    
    const phone = phones[0];
    const newProfile = { ...(phone.profile as any), ...updates };
    
    await db.update(phoneNumbers).set({ profile: newProfile }).where(eq(phoneNumbers.id, phone_number_id));
    
    return { success: true };
  }, {
    detail: {
      tags: ['Business Profile'],
      summary: 'Update Business Profile'
    }
  })
  .post('/:id/request_code', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { code_method } = body as any;
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    if (!code_method) {
      set.status = 400;
      throw createGraphError('Missing code_method', 'OAuthException', 100);
    }
    return { success: true };
  }, {
    detail: {
      tags: ['Phone Numbers'],
      summary: 'Request OTP Code'
    }
  })
  .post('/:id/verify_code', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { code } = body as any;
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    if (!code) {
      set.status = 400;
      throw createGraphError('Missing code', 'OAuthException', 100);
    }
    
    await db.update(phoneNumbers).set({ status: 'VERIFIED' }).where(eq(phoneNumbers.id, phone_number_id));
    return { success: true };
  }, {
    detail: {
      tags: ['Phone Numbers'],
      summary: 'Verify OTP Code'
    }
  })
  .post('/:id/register', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { pin, messaging_product } = body as any;
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    if (messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100);
    }
    if (!pin) {
      set.status = 400;
      throw createGraphError('Missing registration pin', 'OAuthException', 100);
    }
    
    await db.update(phoneNumbers).set({ status: 'CONNECTED' }).where(eq(phoneNumbers.id, phone_number_id));
    return { success: true };
  }, {
    detail: {
      tags: ['Phone Numbers'],
      summary: 'Register Phone Number'
    }
  })
  .post('/:id/deregister', async ({ params: { id }, set }) => {
    const phone_number_id = id;
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    
    await db.update(phoneNumbers).set({ status: 'DEREGISTERED' }).where(eq(phoneNumbers.id, phone_number_id));
    return { success: true };
  }, {
    detail: {
      tags: ['Phone Numbers'],
      summary: 'Deregister Phone Number'
    }
  });
