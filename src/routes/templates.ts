import { Elysia, t } from 'elysia';
import { db } from '../db';
import { templates } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authPlugin } from '../utils/auth';
import { createGraphError } from '../utils/errors';

export const templatesPlugin = new Elysia({ prefix: '/:version' })
  .use(authPlugin)
  .post('/:id/message_templates', async ({ params: { id }, body, set }) => {
    const waba_id = id;
    const { name, category, components, language, bid_spec } = body as any;
    
    if (!name || !category || !components || !language) {
      set.status = 400;
      throw createGraphError('Missing required fields: name, language, category, components are required.', 'OAuthException', 100);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      set.status = 400;
      throw createGraphError('Template name must contain only alphanumeric characters and underscores.', 'OAuthException', 100);
    }
    
    const templateId = Array.from(Array(15)).map(() => Math.floor(Math.random() * 10)).join('');
    
    await db.insert(templates).values({
      id: templateId,
      wabaId: waba_id,
      name,
      category,
      language,
      components,
      bidSpec: bid_spec || null,
      status: "APPROVED"
    });
    
    return { id: templateId, status: "APPROVED", category };
  }, {
    detail: {
      tags: ['Templates'],
      summary: 'Create Message Template'
    }
  })
  .get('/:id/message_templates', async ({ params: { id }, query, set }) => {
    const waba_id = id;
    let q = db.select().from(templates).where(eq(templates.wabaId, waba_id));
    if (query.name) {
      q = db.select().from(templates).where(and(eq(templates.wabaId, waba_id), eq(templates.name, query.name)));
    }
    const data = await q;
    
    return { data, paging: { cursors: { before: "", after: "" } } };
  }, {
    query: t.Object({
      name: t.Optional(t.String())
    }),
    detail: {
      tags: ['Templates'],
      summary: 'List Message Templates'
    }
  })
  .post('/:id/message_templates/:template_id', async ({ params: { id, template_id }, body, set }) => {
    const waba_id = id;
    const { components, category } = body as any;
    
    if (!components) {
      set.status = 400;
      throw createGraphError('Missing required field: components is required.', 'OAuthException', 100);
    }
    
    const existing = await db.select().from(templates).where(and(eq(templates.wabaId, waba_id), eq(templates.id, template_id)));
    if (existing.length === 0) {
      set.status = 404;
      throw createGraphError('Template not found', 'OAuthException', 100);
    }
    
    const newCategory = category || existing[0]!.category;

    await db.update(templates).set({
      category: newCategory,
      components
    }).where(eq(templates.id, template_id));
    
    return { id: template_id, status: "APPROVED", category: newCategory };
  }, {
    detail: {
      tags: ['Templates'],
      summary: 'Update Message Template'
    }
  })
  .delete('/:id/message_templates', async ({ params: { id }, query, set }) => {
    const waba_id = id;
    if (!query.name) {
      set.status = 400;
      throw createGraphError('Missing required query parameter: name is required.', 'OAuthException', 100);
    }
    
    await db.delete(templates).where(and(eq(templates.wabaId, waba_id), eq(templates.name, query.name)));
    return { success: true };
  }, {
    query: t.Object({
      name: t.Optional(t.String())
    }),
    detail: {
      tags: ['Templates'],
      summary: 'Delete Message Template'
    }
  });
