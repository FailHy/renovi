import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // pastikan paling atas

export default defineConfig({
  schema: './lib/db/schema.ts', // path ke file schema
  out: './drizzle',             // folder migrasi
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ambil dari .env
  },
  verbose: true,
  strict: true,
});
