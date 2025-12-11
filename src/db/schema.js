import {
  sqliteTable,
  text,
  integer,
  primaryKey
} from 'drizzle-orm/sqlite-core';


export const user = sqliteTable('user', {
  idUser: integer('id_user').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password').notNull(),
  admin: integer('admin', { mode: 'boolean' }).notNull(),
});


export const collection = sqliteTable('collection', {
  idCollection: integer('id_collection').primaryKey({ autoIncrement: true }),
  titre: text('titre').notNull(),
  description: text('description').notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull(),
  idUser: integer('id_user').notNull().references(() => user.idUser),
});


export const flashcard = sqliteTable('flashcard', {
  idFlashcard: integer('id_flashcard').primaryKey({ autoIncrement: true }),
  recto: text('recto').notNull(),
  verso: text('verso').notNull(),
  rectoUrl: text('recto_url'),
  versoUrl: text('verso_url').notNull(),
  idCollection: integer('id_collection').notNull().references(() => collection.idCollection),
});


export const revision = sqliteTable('revision', {
  idUser: integer('id_user').notNull().references(() => user.idUser),
  idFlashcard: integer('id_flashcard').notNull().references(() => flashcard.idFlashcard),
  lastDate: text('last_date').notNull(),
  level: integer('level', { mode: 'number' }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.idUser, table.idFlashcard] }),
  };
});