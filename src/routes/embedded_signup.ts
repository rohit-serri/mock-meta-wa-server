import { Elysia, t } from 'elysia';
import { db } from '../db';
import { waba, phoneNumbers, webhookConfigs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../utils/auth';
import { createGraphError } from '../utils/errors';

export const embeddedSignupPlugin = new Elysia({ prefix: '/:version' })
  .use(authPlugin)
  
  // 1. Get Client WABAs
  .get('/:id/client_whatsapp_business_accounts', async ({ params: { version, id }, set }) => {
    // In a real system, `id` is the BSP's Business ID.
    // For the mock, we'll just return all WABAs in the DB as "client WABAs".
    const wabas = await db.select().from(waba);
    
    const data = wabas.map(w => ({
      id: w.id,
      name: w.name,
      currency: "USD",
      timezone_id: "UTC",
      message_template_namespace: "mock_namespace_" + w.id
    }));
    
    return { data, paging: { cursors: { before: "", after: "" } } };
  }, {
    detail: {
      tags: ['Embedded Signup'],
      summary: 'Get Client WABAs'
    }
  })

  // 2. Get WABAs
  .get('/:id/whatsapp_business_accounts', async ({ params: { version, id }, set }) => {
    // Same as above, `id` is the Business ID.
    const wabas = await db.select().from(waba);
    
    const data = wabas.map(w => ({
      id: w.id,
      name: w.name,
      currency: "USD",
      timezone_id: "UTC",
      message_template_namespace: "mock_namespace_" + w.id
    }));
    
    return { data, paging: { cursors: { before: "", after: "" } } };
  }, {
    detail: {
      tags: ['Embedded Signup'],
      summary: 'Get WABAs for Business'
    }
  })

  // 3. Get WABA Details
  .get('/:id', async ({ params: { version, id }, set }) => {
    // Fetch WABA details. If it doesn't exist, we return standard Graph Error.
    const wabas = await db.select().from(waba).where(eq(waba.id, id));
    if (wabas.length === 0) {
      set.status = 404;
      throw createGraphError('WABA not found', 'OAuthException', 100);
    }
    
    const w = wabas[0]!;
    return {
      id: w.id,
      name: w.name,
      currency: "USD",
      timezone_id: "UTC",
      message_template_namespace: "mock_namespace_" + w.id,
      status: "APPROVED"
    };
  }, {
    detail: {
      tags: ['Embedded Signup'],
      summary: 'Get WABA Details'
    }
  })

  // 4. Subscribed Apps
  .get('/:id/subscribed_apps', async ({ params: { version, id }, set }) => {
    // `id` is WABA ID
    const configs = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, id));
    
    const data = [];
    if (configs.length > 0 && configs[0]!.url) {
      data.push({
        whatsapp_business_api_data: {
          link: configs[0]!.url,
          name: "Mock Application"
        }
      });
    }
    
    return { data };
  }, {
    detail: {
      tags: ['Embedded Signup'],
      summary: 'Get Subscribed Apps'
    }
  })

  // 5. Create WhatsApp Business Solution
  .post('/:id/whatsapp_business_solution', async ({ params: { version, id }, body, set }) => {
    // `id` is Application ID
    const payload = body as any;
    
    if (!payload.owner_permissions || !payload.partner_app_id || !payload.partner_permissions || !payload.solution_name) {
      set.status = 400;
      throw createGraphError('Missing required fields for solution creation', 'OAuthException', 100);
    }
    
    return {
      success: true,
      id: "solution_" + Math.floor(Math.random() * 1000000000)
    };
  }, {
    detail: {
      tags: ['Embedded Signup'],
      summary: 'Create WhatsApp Business Solution'
    }
  })

  // 6. Preverified Numbers
  .get('/:id/preverified_numbers', async ({ params: { version, id }, query, set }) => {
    // `id` is Business Account ID (WABA ID)
    const phones = await db.select().from(phoneNumbers).where(eq(phoneNumbers.wabaId, id));
    
    // Filter if query param is passed
    let filtered = phones;
    if (query.code_verification_status === 'VERIFIED') {
      filtered = phones.filter(p => p.status === 'VERIFIED' || p.status === 'CONNECTED');
    }
    
    const data = filtered.map(p => ({
      id: p.id,
      phone_number: p.displayPhoneNumber.replace(/\D/g, ''),
      display_phone_number: p.displayPhoneNumber,
      code_verification_status: p.status === 'CONNECTED' || p.status === 'VERIFIED' ? 'VERIFIED' : 'NOT_VERIFIED',
      quality_rating: p.qualityRating
    }));
    
    return { data };
  }, {
    query: t.Object({
      code_verification_status: t.Optional(t.String())
    }),
    detail: {
      tags: ['Embedded Signup'],
      summary: 'Get Preverified Numbers'
    }
  });
