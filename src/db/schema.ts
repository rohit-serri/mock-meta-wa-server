import { pgTable, text, serial, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const waba = pgTable('waba', {
  id: text('id').primaryKey(), // Using text to match Meta's string IDs
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const phoneNumbers = pgTable('phone_numbers', {
  id: text('id').primaryKey(),
  wabaId: text('waba_id').references(() => waba.id, { onDelete: 'cascade' }),
  displayPhoneNumber: text('display_phone_number').notNull(),
  verifiedName: text('verified_name').notNull(),
  qualityRating: text('quality_rating').default('GREEN'),
  status: text('status').default('CONNECTED'),
  profile: jsonb('profile').default({
    about: "",
    address: "",
    description: "",
    email: "",
    profile_picture_url: "",
    websites: [],
    vertical: ""
  }),
});

export const webhookConfigs = pgTable('webhook_configs', {
  id: text('id').primaryKey(), // can be wabaId or phoneNumberId
  url: text('url').notNull(),
  verifyToken: text('verify_token'),
});

export const templates = pgTable('templates', {
  id: text('id').primaryKey(),
  wabaId: text('waba_id').references(() => waba.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  language: text('language').notNull(),
  components: jsonb('components').notNull(),
  bidSpec: jsonb('bid_spec'), // Added based on v25.0 max-price MPM templates
  status: text('status').default('APPROVED'),
});

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  mimeType: text('mime_type').notNull(),
  fileSize: serial('file_size').notNull(),
  hash: text('hash').notNull(),
  path: text('path').notNull(),
});
