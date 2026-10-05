import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const profiles = sqliteTable('profiles', {owner: text('owner').primaryKey(), data: text('data').notNull(), updated: text('updated').notNull()});
export const creations = sqliteTable('creations', {id: text('id').primaryKey(), owner: text('owner').notNull(), data: text('data').notNull(), created: text('created').notNull()}, t=>[index('creations_owner_created').on(t.owner,t.created)]);
export const usage = sqliteTable('usage', {key: text('key').primaryKey(), count: integer('count').notNull().default(0)});
