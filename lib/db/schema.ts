import { pgTable, text, timestamp, integer, real, boolean, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ========================================
// TABLE: USERS
// ========================================
export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  nama: text('nama').notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  alamat: text('alamat'),
  telpon: text('telpon'),
  role: text('role').notNull(), // "admin", "mandor", "pelanggan"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: PROJEKS
// ========================================
export const projeks = pgTable('projek', {
  id: uuid('id').defaultRandom().primaryKey(),
  pelangganId: uuid('pelanggan_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mandorId: uuid('mandor_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').notNull(), // "Perencanaan", "Dalam Progress", "Selesai", "Dibatalkan"
  nama: text('nama').notNull(),
  tipeLayanan: text('tipe_layanan').notNull(), // "Renovasi", "Konstruksi", "Desain Interior"
  deskripsi: text('deskripsi').notNull(),
  gambar: text('gambar').array(),
  alamat: text('alamat').notNull(),
  telpon: text('telpon'),
  mulai: timestamp('mulai').notNull(),
  selesai: timestamp('selesai'),
  progress: integer('progress').default(0).notNull(),
  lastUpdate: timestamp('last_update').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: MILESTONES
// ========================================
export const milestones = pgTable('milestone', {
  id: uuid('id').defaultRandom().primaryKey(),
  proyekId: uuid('proyek_id').notNull().references(() => projeks.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // "Belum Dimulai", "Dalam Progress", "Selesai"
  nama: text('nama').notNull(),
  deskripsi: text('deskripsi'),
  gambar: text('gambar').array(),
  tanggal: timestamp('tanggal').notNull(),
  mulai: timestamp('mulai'),
  selesai: timestamp('selesai'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: BAHAN HARIANS
// ========================================
export const bahanHarians = pgTable('bahan_harian', {
  id: uuid('id').defaultRandom().primaryKey(),
  proyekId: uuid('proyek_id').notNull().references(() => projeks.id, { onDelete: 'cascade' }),
  milestoneId: uuid('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
  status: text('status').notNull(), // "Digunakan", "Sisa", "Rusak"
  nama: text('nama').notNull(),
  deskripsi: text('deskripsi'),
  gambar: text('gambar').array(),
  harga: real('harga').notNull(),
  kuantitas: real('kuantitas').default(1).notNull(),
  satuan: text('satuan').notNull(), // "kg", "meter", "buah", "liter"
  tanggal: timestamp('tanggal').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: ARTIKELS
// ========================================
export const artikels = pgTable('artikel', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  judul: text('judul').notNull(),
  konten: text('konten').notNull(),
  gambar: text('gambar'),
  kategori: text('kategori'),
  published: boolean('published').default(false).notNull(),
  posting: timestamp('posting').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: PORTFOLIOS
// ========================================
export const portfolios = pgTable('portfolio', {
  id: uuid('id').defaultRandom().primaryKey(),
  proyekId: uuid('proyek_id').notNull().unique().references(() => projeks.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  client: text('client').notNull(),
  location: text('location').notNull(),
  category: text('category').notNull(),
  duration: text('duration').notNull(),
  completedDate: timestamp('completed_date').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').array(),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: TESTIMONIS
// ========================================
export const testimonis = pgTable('testimoni', {
  id: uuid('id').defaultRandom().primaryKey(),
  proyekId: uuid('proyek_id').notNull().unique().references(() => projeks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  komentar: text('komentar').notNull(),
  gambar: text('gambar'),
  rating: integer('rating').notNull(), // 1-5
  approved: boolean('approved').default(false).notNull(),
  approvedAt: timestamp('approved_at'),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  posting: timestamp('posting').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// RELATIONS
// ========================================

export const usersRelations = relations(users, ({ many }) => ({
  projeksAsPelanggan: many(projeks, { relationName: 'pelanggan' }),
  projeksAsMandor: many(projeks, { relationName: 'mandor' }),
  artikels: many(artikels),
  testimonis: many(testimonis),
  approvedTestimonis: many(testimonis, { relationName: 'approver' }),
}))

export const projeksRelations = relations(projeks, ({ one, many }) => ({
  pelanggan: one(users, {
    fields: [projeks.pelangganId],
    references: [users.id],
    relationName: 'pelanggan',
  }),
  mandor: one(users, {
    fields: [projeks.mandorId],
    references: [users.id],
    relationName: 'mandor',
  }),
  milestones: many(milestones),
  portfolio: one(portfolios),
  testimoni: one(testimonis),
  bahanHarians: many(bahanHarians),
}))

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  projek: one(projeks, {
    fields: [milestones.proyekId],
    references: [projeks.id],
  }),
  bahanHarians: many(bahanHarians),
}))

export const bahanHariansRelations = relations(bahanHarians, ({ one }) => ({
  projek: one(projeks, {
    fields: [bahanHarians.proyekId],
    references: [projeks.id],
  }),
  milestone: one(milestones, {
    fields: [bahanHarians.milestoneId],
    references: [milestones.id],
  }),
}))

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  projek: one(projeks, {
    fields: [portfolios.proyekId],
    references: [projeks.id],
  }),
}))

export const testimonisRelations = relations(testimonis, ({ one }) => ({
  projek: one(projeks, {
    fields: [testimonis.proyekId],
    references: [projeks.id],
  }),
  user: one(users, {
    fields: [testimonis.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [testimonis.approvedBy],
    references: [users.id],
    relationName: 'approver',
  }),
}))

export const artikelsRelations = relations(artikels, ({ one }) => ({
  author: one(users, {
    fields: [artikels.authorId],
    references: [users.id],
  }),
}))

// ========================================
// TYPES
// ========================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Projek = typeof projeks.$inferSelect
export type NewProjek = typeof projeks.$inferInsert

export type Milestone = typeof milestones.$inferSelect
export type NewMilestone = typeof milestones.$inferInsert

export type BahanHarian = typeof bahanHarians.$inferSelect
export type NewBahanHarian = typeof bahanHarians.$inferInsert

export type Artikel = typeof artikels.$inferSelect
export type NewArtikel = typeof artikels.$inferInsert

export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert

export type Testimoni = typeof testimonis.$inferSelect
export type NewTestimoni = typeof testimonis.$inferInsert