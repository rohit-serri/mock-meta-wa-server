import { Elysia, t } from 'elysia';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { media } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../utils/auth';
import { createGraphError } from '../utils/errors';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

export const mediaPlugin = new Elysia({ prefix: '/:version' })
  .use(authPlugin)
  .post('/:id/media', async ({ params: { id }, body, set }) => {
    const phone_number_id = id;
    const { file, messaging_product } = body as any;
    
    if (messaging_product !== 'whatsapp') {
      set.status = 400;
      throw createGraphError('messaging_product must be whatsapp', 'OAuthException', 100);
    }
    if (!file) {
      set.status = 400;
      throw createGraphError('Missing file parameter.', 'OAuthException', 100);
    }

    const fileBuffer = await file.arrayBuffer();
    const mediaId = uuidv4().replace(/-/g, '').substring(0, 16);
    
    // Ensure uploads dir exists
    await fs.mkdir('uploads', { recursive: true });
    
    const filePath = path.join('uploads', mediaId);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    
    const hash = crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex');

    await db.insert(media).values({
      id: mediaId,
      mimeType: file.type,
      fileSize: file.size,
      hash,
      path: filePath
    });

    return { id: mediaId };
  }, {
    detail: {
      tags: ['Media'],
      summary: 'Upload Media'
    }
  })
  .get('/:id', async ({ params: { version, id }, set }) => {
    const media_id = id;
    const records = await db.select().from(media).where(eq(media.id, media_id));
    if (records.length === 0) {
      set.status = 404;
      throw createGraphError('Media not found.', 'OAuthException', 100);
    }
    const m = records[0];

    return {
      url: `http://localhost:${process.env.PORT || 3000}/${version}/${m.id}/download`,
      mime_type: m.mimeType,
      sha256: m.hash,
      file_size: m.fileSize,
      id: m.id,
      messaging_product: 'whatsapp'
    };
  }, {
    detail: {
      tags: ['Media'],
      summary: 'Get Media Details'
    }
  })
  .delete('/:id', async ({ params: { id }, set }) => {
    const media_id = id;
    const records = await db.select().from(media).where(eq(media.id, media_id));
    if (records.length === 0) {
      set.status = 404;
      throw createGraphError('Media not found.', 'OAuthException', 100);
    }
    
    await db.delete(media).where(eq(media.id, media_id));
    
    try {
        await fs.unlink(records[0].path);
    } catch(e) {}
    
    return { success: true };
  }, {
    detail: {
      tags: ['Media'],
      summary: 'Delete Media'
    }
  })
  // IMPORTANT: The download route is NOT strictly authenticated with the standard token in Meta,
  // but it expects the token to be passed, or we just serve it directly for ease in a mock.
  .get('/:id/download', async ({ params: { id }, set }) => {
    const media_id = id;
    const records = await db.select().from(media).where(eq(media.id, media_id));
    if (records.length === 0) {
      set.status = 404;
      throw createGraphError('Media not found.', 'OAuthException', 100);
    }
    
    const file = Bun.file(records[0].path);
    set.headers['Content-Type'] = records[0].mimeType;
    return file;
  }, {
    detail: {
      tags: ['Media'],
      summary: 'Download Binary Media'
    }
  });
