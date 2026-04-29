import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { waba, phoneNumbers } from './db/schema';
import { messagesPlugin } from './routes/messages';
import { adminPlugin } from './routes/admin';
import { mediaPlugin } from './routes/media';
import { templatesPlugin } from './routes/templates';
import { businessPlugin } from './routes/business';
import { embeddedSignupPlugin } from './routes/embedded_signup';

// Simple seed function to ensure we have a mock WABA out of the box
async function seedDB() {
  const existingWaba = await db.select().from(waba).limit(1);
  if (existingWaba.length === 0) {
    await db.insert(waba).values({ id: '10000', name: 'Test WABA' });
    await db.insert(phoneNumbers).values({
      id: '100001',
      wabaId: '10000',
      displayPhoneNumber: '1 555 123 4567',
      verifiedName: 'Test Business',
      qualityRating: 'GREEN',
      status: 'CONNECTED',
    });
    console.log('Database seeded with WABA 10000 and Phone ID 100001');
  }
}
seedDB().catch(console.error);

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Mock Meta WhatsApp Graph API Server',
        version: '1.0.0',
        description: 'Complete mock of the Meta Graph API for WhatsApp Business Platform.'
      },
      tags: [
        { name: 'Admin', description: 'Webhook and Simulation APIs' },
        { name: 'Messages', description: 'Outbound Messaging APIs' },
        // Will add media, templates, etc. later
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    },
    path: '/swagger'
  }))
  // General Graph API Error Handler for undefined routes
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: {
          message: `Unsupported get request. Object with ID does not exist, cannot be loaded due to missing permissions, or does not support this operation.`,
          type: "GraphMethodException",
          code: 100,
          fbtrace_id: uuidv4().replace(/-/g, '').substring(0, 11).toUpperCase()
        }
      };
    }
    // Return standard graph error if it was thrown using createGraphError
    if ((error as any).error?.fbtrace_id) {
      return (error as any);
    }
    
    // Otherwise fallback
    return {
        error: {
          message: (error as any).message || 'Internal Server Error',
          type: "Exception",
          code: 500,
          fbtrace_id: uuidv4().replace(/-/g, '').substring(0, 11).toUpperCase()
        }
    };
  })
  .use(adminPlugin)
  .use(messagesPlugin)
  .use(mediaPlugin)
  .use(templatesPlugin)
  .use(businessPlugin)
  .use(embeddedSignupPlugin)
  .listen(process.env.PORT || 3000);

console.log(`🦊 Mock Meta WA Server is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 Swagger docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`);
