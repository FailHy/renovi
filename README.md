# Renovi - Platform Pelacakan Renovasi & Konstruksi

Platform modern untuk monitoring dan tracking progres proyek renovasi dan konstruksi secara real-time.

## 🚀 Features

- **Multi-Role Dashboard**: Admin, Mandor, dan Klien
- **Real-time Monitoring**: Track progres proyek secara live
- **Milestone Management**: Pecah proyek menjadi milestone terukur
- **Material Tracking**: Catat penggunaan bahan harian
- **Portfolio Management**: Showcase proyek yang telah selesai
- **Testimonial System**: Sistem review dengan approval admin
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## 📦 Installation

1. Clone repository
```bash
git clone https://github.com/yourusername/renovi.git
cd renovi
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local dengan konfigurasi Anda
```

4. Setup database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 👥 Default Users

Setelah seeding, gunakan akun berikut untuk login:

- **Admin**: `admin` / `admin123`
- **Mandor**: `mandor` / `mandor123`
- **Klien**: `klien` / `klien123`

## 📁 Project Structure

```
renovi/
├── app/
│   ├── (auth)/          # Auth pages
│   ├── (public)/        # Public pages
│   ├── (dashboard)/     # Dashboard pages
│   │   ├── admin/       # Admin dashboard
│   │   ├── mandor/      # Mandor dashboard
│   │   └── klien/       # Klien dashboard
│   └── api/             # API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── public/          # Public components
│   └── dashboard/       # Dashboard components
├── lib/
│   ├── db/              # Database config & schema
│   ├── actions/         # Server actions
│   └── utils.ts         # Utility functions
└── middleware.ts        # Auth middleware
```

## 🔐 Role Permissions

### Admin
- Manage semua proyek
- Manage pengguna
- Manage artikel
- Approve portfolio
- Approve testimoni

### Mandor
- View proyek yang ditugaskan
- Update milestone
- Input bahan harian
- Upload foto progres

### Klien
- View proyek miliknya
- View milestone & bahan
- Submit testimoni (jika proyek selesai)
