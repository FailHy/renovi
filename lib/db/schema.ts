// FILE: db/schema.ts
// ========================================
// IMPROVED SCHEMA - PRODUCTION READY
// ========================================
import { pgTable, text, timestamp, integer, decimal, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ========================================
// ENUMS
// ========================================
export const roleEnum = pgEnum('role', ['admin', 'mandor', 'pelanggan'])

export const statusProyekEnum = pgEnum('status_proyek', [
  'Perencanaan',
  'Dalam Progress',
  'Selesai',
  'Dibatalkan'
])

export const statusMilestoneEnum = pgEnum('status_milestone', [
  'Belum Dimulai',
  'Dalam Progress',
  'Selesai'
])

export const statusBahanEnum = pgEnum('status_bahan', [
  'Digunakan',
  'Sisa',
  'Rusak'
])

// ⭐ NEW: Status nota untuk approval workflow
export const statusNotaEnum = pgEnum('status_nota', [
  'draft',
  'pending',
  'approved',
  'rejected'
])

export const satuanEnum = pgEnum('satuan', [
  'pcs',
  'kg',
  'gram',
  'meter',
  'cm',
  'm2',
  'm3',
  'liter',
  'ml',
  'sak',
  'buah',
  'box',
  'karung',
  'roll',
  'lembar'
])

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
  role: roleEnum('role').notNull().default('pelanggan'),
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
  
  nama: text('nama').notNull(),
  tipeLayanan: text('tipe_layanan').notNull(), // "Renovasi", "Konstruksi", "Desain Interior"
  deskripsi: text('deskripsi').notNull(),
  alamat: text('alamat').notNull(),
  telpon: text('telpon'),
  gambar: text('gambar').array(),
  
  status: statusProyekEnum('status').notNull().default('Perencanaan'),
  progress: integer('progress').default(0).notNull(),
  
  mulai: timestamp('mulai').notNull(),
  selesai: timestamp('selesai'),
  
  // ⭐ IMPROVED: Better naming
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
  
  nama: text('nama').notNull(),
  deskripsi: text('deskripsi'),
  gambar: text('gambar').array(),
  
  status: statusMilestoneEnum('status').notNull().default('Belum Dimulai'),
  
  tanggal: timestamp('tanggal').notNull(),
  mulai: timestamp('mulai'),
  selesai: timestamp('selesai'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: NOTA BELANJA (NEW - PARENT)
// ========================================
export const notaBelanjas = pgTable('nota_belanja', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Relasi
  proyekId: uuid('proyek_id')
    .notNull()
    .references(() => projeks.id, { onDelete: 'cascade' }),
  
  milestoneId: uuid('milestone_id')
    .references(() => milestones.id, { onDelete: 'set null' }),
  
  // User tracking
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  approvedBy: uuid('approved_by')
    .references(() => users.id, { onDelete: 'set null' }),
  
  // Informasi nota
  nomorNota: text('nomor_nota'),
  namaToko: text('nama_toko'),
  fotoNotaUrl: text('foto_nota_url').notNull(),
  
  tanggalBelanja: timestamp('tanggal_belanja').notNull(),
  
  // Status & approval
  status: statusNotaEnum('status').notNull().default('draft'),
  catatanApproval: text('catatan_approval'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
})

// ========================================
// TABLE: BAHAN HARIANS (IMPROVED - CHILD OF NOTA)
// ========================================
export const bahanHarians = pgTable('bahan_harian', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // ⭐ NEW: Link to nota belanja
  notaId: uuid('nota_id')
    .notNull()
    .references(() => notaBelanjas.id, { onDelete: 'cascade' }),
  
  // Keep direct project reference for easy queries
  proyekId: uuid('proyek_id')
    .notNull()
    .references(() => projeks.id, { onDelete: 'cascade' }),
  
  milestoneId: uuid('milestone_id')
    .references(() => milestones.id, { onDelete: 'set null' }),
  
  // Bahan details
  nama: text('nama').notNull(),
  deskripsi: text('deskripsi'),
  gambar: text('gambar').array(),
  
  // ⭐ CHANGED: real → decimal for precision
  harga: decimal('harga', { precision: 12, scale: 2 }).notNull(),
  kuantitas: decimal('kuantitas', { precision: 10, scale: 2 }).default('1').notNull(),
  
  satuan: satuanEnum('satuan').notNull().default('pcs'),
  
  // ⭐ NEW: Kategori untuk reporting
  kategori: text('kategori'), // "Material", "Alat", "Upah", dll
  
  // Status penggunaan
  status: statusBahanEnum('status').notNull().default('Digunakan'),
  
  // ⚠️ REMOVED: tanggal (use nota's tanggalBelanja instead)
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// TABLE: FOTO NOTA (OPTIONAL - MULTIPLE PHOTOS)
// ========================================
export const fotoNotas = pgTable('foto_nota', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  notaId: uuid('nota_id')
    .notNull()
    .references(() => notaBelanjas.id, { onDelete: 'cascade' }),
  
  fotoUrl: text('foto_url').notNull(),
  keterangan: text('keterangan'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========================================
// TABLE: ARTIKELS
// ========================================
export const artikels = pgTable('artikel', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
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
  proyekId: uuid('proyek_id')
    .notNull()
    .unique()
    .references(() => projeks.id, { onDelete: 'cascade' }),
  
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
  proyekId: uuid('proyek_id')
    .notNull()
    .unique()
    .references(() => projeks.id, { onDelete: 'cascade' }),
  
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  komentar: text('komentar').notNull(),
  gambar: text('gambar'),
  rating: integer('rating').notNull(), // 1-5
  
  // Approval tracking
  approved: boolean('approved').default(false).notNull(),
  approvedAt: timestamp('approved_at'),
  approvedBy: uuid('approved_by')
    .references(() => users.id, { onDelete: 'set null' }),
  
  posting: timestamp('posting').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ========================================
// RELATIONS
// ========================================

export const usersRelations = relations(users, ({ many }) => ({
  // Projek relations
  projeksAsPelanggan: many(projeks, { relationName: 'pelanggan' }),
  projeksAsMandor: many(projeks, { relationName: 'mandor' }),
  
  // Nota relations
  notasCreated: many(notaBelanjas, { relationName: 'creator' }),
  notasApproved: many(notaBelanjas, { relationName: 'approver' }),
  
  // Other relations
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
  notaBelanjas: many(notaBelanjas),
  bahanHarians: many(bahanHarians),
  portfolio: one(portfolios),
  testimoni: one(testimonis),
}))

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  projek: one(projeks, {
    fields: [milestones.proyekId],
    references: [projeks.id],
  }),
  notaBelanjas: many(notaBelanjas),
  bahanHarians: many(bahanHarians),
}))

// ⭐ NEW: Nota Belanja Relations
export const notaBelanjaRelations = relations(notaBelanjas, ({ one, many }) => ({
  projek: one(projeks, {
    fields: [notaBelanjas.proyekId],
    references: [projeks.id],
  }),
  milestone: one(milestones, {
    fields: [notaBelanjas.milestoneId],
    references: [milestones.id],
  }),
  creator: one(users, {
    fields: [notaBelanjas.createdBy],
    references: [users.id],
    relationName: 'creator',
  }),
  approver: one(users, {
    fields: [notaBelanjas.approvedBy],
    references: [users.id],
    relationName: 'approver',
  }),
  items: many(bahanHarians),
  photos: many(fotoNotas),
}))

export const bahanHariansRelations = relations(bahanHarians, ({ one }) => ({
  nota: one(notaBelanjas, {
    fields: [bahanHarians.notaId],
    references: [notaBelanjas.id],
  }),
  projek: one(projeks, {
    fields: [bahanHarians.proyekId],
    references: [projeks.id],
  }),
  milestone: one(milestones, {
    fields: [bahanHarians.milestoneId],
    references: [milestones.id],
  }),
}))

// ⭐ NEW: Foto Nota Relations
export const fotoNotaRelations = relations(fotoNotas, ({ one }) => ({
  nota: one(notaBelanjas, {
    fields: [fotoNotas.notaId],
    references: [notaBelanjas.id],
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

export type NotaBelanja = typeof notaBelanjas.$inferSelect
export type NewNotaBelanja = typeof notaBelanjas.$inferInsert

export type BahanHarian = typeof bahanHarians.$inferSelect
export type NewBahanHarian = typeof bahanHarians.$inferInsert

export type FotoNota = typeof fotoNotas.$inferSelect
export type NewFotoNota = typeof fotoNotas.$inferInsert

export type Artikel = typeof artikels.$inferSelect
export type NewArtikel = typeof artikels.$inferInsert

export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert

export type Testimoni = typeof testimonis.$inferSelect
export type NewTestimoni = typeof testimonis.$inferInsert