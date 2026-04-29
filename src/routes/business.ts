import { Elysia, t } from 'elysia';
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
    
    const phone = phones[0]!;
    const profile: any = phone.profile || {};
    
    const fields = query.fields ? query.fields.split(',') : ['about', 'address', 'description', 'email', 'profile_picture_url', 'websites', 'vertical'];
    
    let responseData: any = {};
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
    const { messaging_product, ...updates } = (body || {}) as any;
    
    if (messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100);
    }

    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    
    const phone = phones[0]!;
    const newProfile = { ...(phone.profile as any), ...updates };
    
    await db.update(phoneNumbers).set({ profile: newProfile }).where(eq(phoneNumbers.id, phone_number_id));
    
    return { success: true };
  }, {
    body: t.Optional(t.Object({
      messaging_product: t.Optional(t.String()),
      about: t.Optional(t.String()),
      address: t.Optional(t.String()),
      description: t.Optional(t.String()),
      email: t.Optional(t.String()),
      profile_picture_url: t.Optional(t.String()),
      websites: t.Optional(t.Array(t.String())),
      vertical: t.Optional(t.String())
    })),
    detail: {
      tags: ['Business Profile'],
      summary: 'Update Business Profile'
    }
  })
  .post('/:id/request_code', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { code_method } = (body || {}) as any;

    if (code_method !== 'SMS' && code_method !== 'VOICE') {
      set.status = 400;
      throw createGraphError('code_method must be SMS or VOICE', 'OAuthException', 100);
    }

    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    
    return { success: true };
  }, {
    body: t.Optional(t.Object({
      code_method: t.Optional(t.String()),
      language: t.Optional(t.String())
    })),
    detail: {
      tags: ['Phone Numbers'],
      summary: 'Request OTP Code'
    }
  })
  .post('/:id/verify_code', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { code } = (body || {}) as any;

    if (!code || !/^\d{6}$/.test(String(code))) {
      set.status = 400;
      throw createGraphError('code must be a 6-digit string', 'OAuthException', 100);
    }

    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    
    await db.update(phoneNumbers).set({ status: 'VERIFIED' }).where(eq(phoneNumbers.id, phone_number_id));
    return { success: true };
  }, {
    body: t.Optional(t.Object({
      code: t.Optional(t.String())
    })),
    detail: {
      tags: ['Phone Numbers'],
      summary: 'Verify OTP Code'
    }
  })
  .post('/:id/register', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { pin, messaging_product } = (body || {}) as any;

    if (messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100);
    }
    if (!pin || !/^\d{6}$/.test(String(pin))) {
      set.status = 400;
      throw createGraphError('pin must be a 6-digit string', 'OAuthException', 100);
    }

    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, phone_number_id));
    if (phones.length === 0) {
      set.status = 400;
      throw createGraphError('Invalid phone number ID.', 'OAuthException', 100);
    }
    
    await db.update(phoneNumbers).set({ status: 'CONNECTED' }).where(eq(phoneNumbers.id, phone_number_id));
    return { success: true };
  }, {
    body: t.Optional(t.Object({
      messaging_product: t.Optional(t.String()),
      pin: t.Optional(t.String())
    })),
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
