// FILE: lib/db/seed.ts
import { db } from './index'
import {
  users,
  projeks,
  milestones,
  bahanHarians,
  artikels,
  portfolios,
  testimonis,
} from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('🌱 Starting seed...')

    // ========================================
    // 1. SEED USERS
    // ========================================
    console.log('👥 Seeding users...')
    
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const [admin] = await db.insert(users).values({
      nama: 'Administrator Renovi',
      username: 'admin',
      email: 'admin@renovi.com',
      password: hashedPassword,
      role: 'admin',
      telpon: '081234567890',
      alamat: 'Jl. Sudirman No. 123, Pekanbaru, Riau',
    }).returning()

    // Mandor accounts
    const mandorPassword = await bcrypt.hash('mandor123', 10)
    
    const [mandor1] = await db.insert(users).values({
      nama: 'Ahmad Suryadi',
      username: 'ahmad_mandor',
      email: 'ahmad@renovi.com',
      password: mandorPassword,
      role: 'mandor',
      telpon: '082345678901',
      alamat: 'Jl. Jendral Sudirman No. 45, Pekanbaru',
    }).returning()

    const [mandor2] = await db.insert(users).values({
      nama: 'Budi Santoso',
      username: 'budi_mandor',
      email: 'budi@renovi.com',
      password: mandorPassword,
      role: 'mandor',
      telpon: '083456789012',
      alamat: 'Jl. Gatot Subroto No. 78, Pekanbaru',
    }).returning()

    const [mandor3] = await db.insert(users).values({
      nama: 'Cahyo Nugroho',
      username: 'cahyo_mandor',
      email: 'cahyo@renovi.com',
      password: mandorPassword,
      role: 'mandor',
      telpon: '084567890123',
      alamat: 'Jl. Ahmad Yani No. 90, Pekanbaru',
    }).returning()

    // Pelanggan accounts
    const pelangganPassword = await bcrypt.hash('pelanggan123', 10)

    const [pelanggan1] = await db.insert(users).values({
      nama: 'Dewi Lestari',
      username: 'dewi_lestari',
      email: 'dewi@email.com',
      password: pelangganPassword,
      role: 'pelanggan',
      telpon: '085678901234',
      alamat: 'Perumahan Griya Asri Blok A No. 15, Pekanbaru',
    }).returning()

    const [pelanggan2] = await db.insert(users).values({
      nama: 'Eko Prasetyo',
      username: 'eko_prasetyo',
      email: 'eko@email.com',
      password: pelangganPassword,
      role: 'pelanggan',
      telpon: '086789012345',
      alamat: 'Perumahan Bukit Indah Blok C No. 27, Pekanbaru',
    }).returning()

    const [pelanggan3] = await db.insert(users).values({
      nama: 'Fitri Handayani',
      username: 'fitri_handayani',
      email: 'fitri@email.com',
      password: pelangganPassword,
      role: 'pelanggan',
      telpon: '087890123456',
      alamat: 'Jl. Imam Bonjol No. 56, Pekanbaru',
    }).returning()

    const [pelanggan4] = await db.insert(users).values({
      nama: 'Gunawan Wijaya',
      username: 'gunawan_wijaya',
      email: 'gunawan@email.com',
      password: pelangganPassword,
      role: 'pelanggan',
      telpon: '088901234567',
      alamat: 'Komplek Ruko Senapelan Blok D No. 12, Pekanbaru',
    }).returning()

    console.log('   Users seeded!')

    // ========================================
    // 2. SEED PROJEKS
    // ========================================
    console.log('🏗️  Seeding projects...')

    // Project 1: Selesai
    const [proyek1] = await db.insert(projeks).values({
      pelangganId: pelanggan1.id,
      mandorId: mandor1.id,
      nama: 'Renovasi Dapur & Kamar Mandi Minimalis',
      tipeLayanan: 'Renovasi Rumah',
      deskripsi: 'Renovasi total dapur dan kamar mandi dengan konsep minimalis modern. Termasuk penggantian keramik, kabinet custom, dan sistem plumbing baru.',
      alamat: pelanggan1.alamat || '',
      telpon: pelanggan1.telpon || '',
      status: 'Selesai',
      progress: 100,
      mulai: new Date('2024-01-05'),
      selesai: new Date('2024-02-20'),
      gambar: ['/images/projects/dapur-1.jpg', '/images/projects/dapur-2.jpg'],
    }).returning()

    // Project 2: Dalam Progress
    const [proyek2] = await db.insert(projeks).values({
      pelangganId: pelanggan2.id,
      mandorId: mandor2.id,
      nama: 'Pembangunan Rumah Tinggal 2 Lantai',
      tipeLayanan: 'Konstruksi Bangunan',
      deskripsi: 'Pembangunan rumah tinggal 2 lantai dengan luas bangunan 150m2. Desain modern dengan 3 kamar tidur, 2 kamar mandi, ruang keluarga, dan carport.',
      alamat: pelanggan2.alamat || '',
      telpon: pelanggan2.telpon || '',
      status: 'Dalam Progress',
      progress: 65,
      mulai: new Date('2024-02-01'),
      gambar: ['/images/projects/rumah-1.jpg'],
    }).returning()

    // Project 3: Dalam Progress
    const [proyek3] = await db.insert(projeks).values({
      pelangganId: pelanggan3.id,
      mandorId: mandor1.id,
      nama: 'Desain Interior Kantor Modern',
      tipeLayanan: 'Desain Interior',
      deskripsi: 'Desain dan renovasi interior kantor dengan konsep modern industrial. Termasuk furniture custom, partisi ruangan, dan sistem pencahayaan.',
      alamat: pelanggan3.alamat || '',
      telpon: pelanggan3.telpon || '',
      status: 'Dalam Progress',
      progress: 45,
      mulai: new Date('2024-03-10'),
      gambar: ['/images/projects/kantor-1.jpg'],
    }).returning()

    // Project 4: Perencanaan
    const [proyek4] = await db.insert(projeks).values({
      pelangganId: pelanggan4.id,
      mandorId: mandor3.id,
      nama: 'Renovasi Ruko 3 Lantai',
      tipeLayanan: 'Renovasi Komersial',
      deskripsi: 'Renovasi total ruko 3 lantai untuk dijadikan cafe dan co-working space. Termasuk perombakan struktur, interior, dan eksterior.',
      alamat: pelanggan4.alamat || '',
      telpon: pelanggan4.telpon || '',
      status: 'Perencanaan',
      progress: 10,
      mulai: new Date('2024-04-01'),
      gambar: [],
    }).returning()

    // Project 5: Selesai (untuk portfolio & testimoni)
    const [proyek5] = await db.insert(projeks).values({
      pelangganId: pelanggan1.id,
      mandorId: mandor2.id,
      nama: 'Landscaping Taman Minimalis',
      tipeLayanan: 'Landscaping',
      deskripsi: 'Penataan taman halaman depan dan belakang dengan konsep minimalis tropis. Termasuk vertical garden, water feature, dan outdoor lighting.',
      alamat: pelanggan1.alamat || '',
      telpon: pelanggan1.telpon || '',
      status: 'Selesai',
      progress: 100,
      mulai: new Date('2023-11-01'),
      selesai: new Date('2023-12-15'),
      gambar: ['/images/projects/taman-1.jpg', '/images/projects/taman-2.jpg'],
    }).returning()

    console.log('   Projects seeded!')

    // ========================================
    // 3. SEED MILESTONES
    // ========================================
    console.log('📍 Seeding milestones...')

    // Milestones untuk Proyek 1 (Selesai)
    await db.insert(milestones).values([
      {
        proyekId: proyek1.id,
        nama: 'Pembongkaran & Demolisi',
        deskripsi: 'Pembongkaran keramik lama, kabinet, dan fixtures dapur & kamar mandi',
        status: 'Selesai',
        tanggal: new Date('2024-01-08'),
        mulai: new Date('2024-01-05'),
        selesai: new Date('2024-01-08'),
        gambar: ['/images/milestone/demo-1.jpg'],
      },
      {
        proyekId: proyek1.id,
        nama: 'Pekerjaan Plumbing',
        deskripsi: 'Instalasi pipa air bersih, air kotor, dan sistem drainage baru',
        status: 'Selesai',
        tanggal: new Date('2024-01-15'),
        mulai: new Date('2024-01-09'),
        selesai: new Date('2024-01-15'),
        gambar: ['/images/milestone/plumbing-1.jpg'],
      },
      {
        proyekId: proyek1.id,
        nama: 'Pemasangan Keramik',
        deskripsi: 'Pemasangan keramik lantai dan dinding dapur & kamar mandi',
        status: 'Selesai',
        tanggal: new Date('2024-01-28'),
        mulai: new Date('2024-01-16'),
        selesai: new Date('2024-01-28'),
        gambar: ['/images/milestone/keramik-1.jpg'],
      },
      {
        proyekId: proyek1.id,
        nama: 'Instalasi Kabinet & Fixtures',
        deskripsi: 'Pemasangan kabinet custom, sink, kran, shower, dan toilet',
        status: 'Selesai',
        tanggal: new Date('2024-02-10'),
        mulai: new Date('2024-01-29'),
        selesai: new Date('2024-02-10'),
        gambar: ['/images/milestone/kabinet-1.jpg'],
      },
      {
        proyekId: proyek1.id,
        nama: 'Finishing & Cleaning',
        deskripsi: 'Pengecatan, grouting, silicon, dan pembersihan akhir',
        status: 'Selesai',
        tanggal: new Date('2024-02-20'),
        mulai: new Date('2024-02-11'),
        selesai: new Date('2024-02-20'),
        gambar: ['/images/milestone/finishing-1.jpg'],
      },
    ])

    // Milestones untuk Proyek 2 (Dalam Progress)
    await db.insert(milestones).values([
      {
        proyekId: proyek2.id,
        nama: 'Persiapan Lahan & Pondasi',
        deskripsi: 'Pembersihan lahan, pengukuran, dan pembuatan pondasi tapak',
        status: 'Selesai',
        tanggal: new Date('2024-02-10'),
        mulai: new Date('2024-02-01'),
        selesai: new Date('2024-02-10'),
        gambar: ['/images/milestone/pondasi-1.jpg'],
      },
      {
        proyekId: proyek2.id,
        nama: 'Struktur Lantai 1',
        deskripsi: 'Pemasangan kolom, balok, dan struktur lantai 1',
        status: 'Selesai',
        tanggal: new Date('2024-03-01'),
        mulai: new Date('2024-02-11'),
        selesai: new Date('2024-03-01'),
        gambar: ['/images/milestone/struktur-1.jpg'],
      },
      {
        proyekId: proyek2.id,
        nama: 'Struktur Lantai 2',
        deskripsi: 'Pemasangan kolom, balok, dan plat lantai 2',
        status: 'Selesai',
        tanggal: new Date('2024-03-20'),
        mulai: new Date('2024-03-02'),
        selesai: new Date('2024-03-20'),
        gambar: ['/images/milestone/struktur-2.jpg'],
      },
      {
        proyekId: proyek2.id,
        nama: 'Pemasangan Dinding & Atap',
        deskripsi: 'Pemasangan dinding bata ringan dan rangka atap',
        status: 'Dalam Progress',
        tanggal: new Date('2024-04-05'),
        mulai: new Date('2024-03-21'),
        gambar: [],
      },
      {
        proyekId: proyek2.id,
        nama: 'Plumbing & Electrical',
        deskripsi: 'Instalasi sistem plumbing dan kelistrikan',
        status: 'Belum Dimulai',
        tanggal: new Date('2024-04-20'),
        gambar: [],
      },
      {
        proyekId: proyek2.id,
        nama: 'Finishing Interior & Eksterior',
        deskripsi: 'Pengecatan, keramik, dan finishing akhir',
        status: 'Belum Dimulai',
        tanggal: new Date('2024-05-15'),
        gambar: [],
      },
    ])

    // Milestones untuk Proyek 3 (Dalam Progress)
    await db.insert(milestones).values([
      {
        proyekId: proyek3.id,
        nama: 'Survey & Pengukuran',
        deskripsi: 'Survey lokasi dan pengukuran ruangan untuk desain',
        status: 'Selesai',
        tanggal: new Date('2024-03-12'),
        mulai: new Date('2024-03-10'),
        selesai: new Date('2024-03-12'),
        gambar: [],
      },
      {
        proyekId: proyek3.id,
        nama: 'Pembuatan Desain 3D',
        deskripsi: 'Pembuatan visualisasi 3D dan approval klien',
        status: 'Selesai',
        tanggal: new Date('2024-03-20'),
        mulai: new Date('2024-03-13'),
        selesai: new Date('2024-03-20'),
        gambar: ['/images/milestone/desain-1.jpg'],
      },
      {
        proyekId: proyek3.id,
        nama: 'Demolisi & Partisi',
        deskripsi: 'Pembongkaran interior lama dan pemasangan partisi baru',
        status: 'Dalam Progress',
        tanggal: new Date('2024-04-05'),
        mulai: new Date('2024-03-21'),
        gambar: [],
      },
      {
        proyekId: proyek3.id,
        nama: 'Furniture & Fitting Out',
        deskripsi: 'Pemasangan furniture custom dan fitting out',
        status: 'Belum Dimulai',
        tanggal: new Date('2024-04-25'),
        gambar: [],
      },
    ])

    console.log('   Milestones seeded!')

    // ========================================
    // 4. SEED BAHAN HARIANS
    // ========================================
    console.log('📦 Seeding materials...')

    // Bahan untuk Proyek 1
    await db.insert(bahanHarians).values([
      {
        proyekId: proyek1.id,
        nama: 'Keramik Lantai 40x40',
        deskripsi: 'Keramik lantai dapur warna abu-abu',
        kuantitas: 45,
        satuan: 'meter',
        harga: 85000,
        status: 'Digunakan',
        tanggal: new Date('2024-01-16'),
        gambar: [],
      },
      {
        proyekId: proyek1.id,
        nama: 'Keramik Dinding 30x60',
        deskripsi: 'Keramik dinding kamar mandi warna putih glossy',
        kuantitas: 35,
        satuan: 'meter',
        harga: 95000,
        status: 'Digunakan',
        tanggal: new Date('2024-01-18'),
        gambar: [],
      },
      {
        proyekId: proyek1.id,
        nama: 'Semen',
        deskripsi: 'Semen portland untuk pemasangan keramik',
        kuantitas: 15,
        satuan: 'sak',
        harga: 65000,
        status: 'Digunakan',
        tanggal: new Date('2024-01-15'),
        gambar: [],
      },
      {
        proyekId: proyek1.id,
        nama: 'Pipa PVC 3 inch',
        deskripsi: 'Pipa untuk sistem drainage',
        kuantitas: 8,
        satuan: 'meter',
        harga: 45000,
        status: 'Digunakan',
        tanggal: new Date('2024-01-10'),
        gambar: [],
      },
      {
        proyekId: proyek1.id,
        nama: 'Cat Tembok',
        deskripsi: 'Cat tembok putih untuk finishing',
        kuantitas: 3,
        satuan: 'pcs',
        harga: 250000,
        status: 'Digunakan',
        tanggal: new Date('2024-02-15'),
        gambar: [],
      },
    ])

    // Bahan untuk Proyek 2
    await db.insert(bahanHarians).values([
      {
        proyekId: proyek2.id,
        nama: 'Besi Beton 12mm',
        deskripsi: 'Besi untuk struktur pondasi dan kolom',
        kuantitas: 500,
        satuan: 'kg',
        harga: 15000,
        status: 'Digunakan',
        tanggal: new Date('2024-02-05'),
        gambar: [],
      },
      {
        proyekId: proyek2.id,
        nama: 'Semen Portland',
        deskripsi: 'Semen untuk cor beton',
        kuantitas: 120,
        satuan: 'sak',
        harga: 65000,
        status: 'Digunakan',
        tanggal: new Date('2024-02-05'),
        gambar: [],
      },
      {
        proyekId: proyek2.id,
        nama: 'Pasir Beton',
        deskripsi: 'Pasir untuk campuran beton',
        kuantitas: 8,
        satuan: 'meter',
        harga: 350000,
        status: 'Digunakan',
        tanggal: new Date('2024-02-06'),
        gambar: [],
      },
      {
        proyekId: proyek2.id,
        nama: 'Bata Ringan',
        deskripsi: 'Bata ringan untuk dinding',
        kuantitas: 1200,
        satuan: 'buah',
        harga: 8500,
        status: 'Digunakan',
        tanggal: new Date('2024-03-22'),
        gambar: [],
      },
      {
        proyekId: proyek2.id,
        nama: 'Rangka Atap Baja Ringan',
        deskripsi: 'Rangka untuk atap',
        kuantitas: 150,
        satuan: 'meter',
        harga: 85000,
        status: 'Sisa',
        tanggal: new Date('2024-03-25'),
        gambar: [],
      },
    ])

    console.log('   Materials seeded!')

    // ========================================
    // 5. SEED ARTIKELS
    // ========================================
    console.log('📰 Seeding articles...')

    await db.insert(artikels).values([
      {
        authorId: admin.id,
        judul: 'Tips Memilih Kontraktor Renovasi yang Tepat',
        konten: `
Memilih kontraktor renovasi yang tepat adalah langkah penting untuk memastikan proyek Anda berjalan lancar. Berikut beberapa tips yang bisa Anda terapkan:

1. **Cek Portfolio dan Pengalaman**
   Lihat hasil pekerjaan sebelumnya dan berapa lama mereka berkecimpung di industri ini.

2. **Minta Referensi**
   Tanyakan kepada klien sebelumnya tentang pengalaman mereka bekerja dengan kontraktor tersebut.

3. **Bandingkan Penawaran**
   Dapatkan minimal 3 penawaran dari kontraktor berbeda untuk membandingkan harga dan layanan.

4. **Perhatikan Komunikasi**
   Kontraktor yang baik akan responsif dan komunikatif dalam menjawab pertanyaan Anda.

5. **Pastikan Ada Kontrak Tertulis**
   Semua kesepakatan harus tertulis jelas dalam kontrak, termasuk timeline dan biaya.

Dengan mengikuti tips di atas, Anda akan lebih mudah menemukan kontraktor yang sesuai dengan kebutuhan proyek renovasi Anda.
        `,
        gambar: '/images/articles/artikel-1.jpg',
        kategori: 'Tips Renovasi',
        published: true,
        posting: new Date('2024-03-15'),
      },
      {
        authorId: admin.id,
        judul: 'Tren Desain Interior 2024: Minimalis Modern',
        konten: `
Desain interior minimalis modern terus menjadi tren di tahun 2024. Konsep ini mengedepankan kesederhanaan, fungsionalitas, dan estetika yang bersih.

**Karakteristik Minimalis Modern:**

- **Warna Netral**: Dominasi warna putih, abu-abu, dan earth tone
- **Furniture Multifungsi**: Maksimalkan ruang dengan furniture yang memiliki banyak fungsi
- **Natural Material**: Penggunaan kayu, batu, dan material alami lainnya
- **Pencahayaan Alami**: Maksimalkan cahaya matahari dengan jendela besar
- **Clean Lines**: Desain dengan garis-garis yang bersih dan tegas

**Tips Implementasi:**

1. Declutter ruangan dari barang-barang yang tidak perlu
2. Pilih furniture dengan desain simple namun berkualitas
3. Gunakan storage tersembunyi untuk menyimpan barang
4. Tambahkan tanaman sebagai aksen natural
5. Pilih artwork yang minimalis dan meaningful

Desain minimalis modern cocok untuk Anda yang menginginkan rumah yang terlihat luas, bersih, dan nyaman.
        `,
        gambar: '/images/articles/artikel-2.jpg',
        kategori: 'Inspirasi Desain',
        published: true,
        posting: new Date('2024-03-10'),
      },
      {
        authorId: admin.id,
        judul: 'Panduan Lengkap Renovasi Dapur: Budget hingga Eksekusi',
        konten: `
Renovasi dapur adalah investasi yang akan meningkatkan kenyamanan dan nilai rumah Anda. Berikut panduan lengkapnya:

**1. Perencanaan Budget**
- Set budget realistis (biasanya 10-15% dari nilai rumah)
- Sisihkan 20% untuk biaya tidak terduga
- Prioritaskan elemen yang paling penting

**2. Layout dan Desain**
- Pertimbangkan work triangle (kompor, sink, kulkas)
- Pastikan ada ruang sirkulasi yang cukup
- Perhatikan pencahayaan task dan ambient

**3. Material Pilihan**
- Countertop: Granit, marmer, atau quartz
- Kabinet: Kayu solid atau HPL sesuai budget
- Backsplash: Keramik atau kaca

**4. Appliances**
- Pilih appliances energy efficient
- Sesuaikan dengan kebutuhan memasak
- Pertimbangkan built-in appliances

**5. Timeline Pengerjaan**
- Survey dan desain: 1-2 minggu
- Pembelian material: 1 minggu
- Demolisi: 3-5 hari
- Instalasi: 2-3 minggu
- Finishing: 1 minggu

Dengan perencanaan matang, renovasi dapur Anda akan berjalan lancar dan hasilnya memuaskan!
        `,
        gambar: '/images/articles/artikel-3.jpg',
        kategori: 'Tips Renovasi',
        published: true,
        posting: new Date('2024-03-05'),
      },
    ])

    console.log('   Articles seeded!')

    // ========================================
    // 6. SEED PORTFOLIOS
    // ========================================
    console.log('💼 Seeding portfolios...')

    await db.insert(portfolios).values([
      {
        proyekId: proyek1.id,
        name: 'Renovasi Dapur & Kamar Mandi Minimalis',
        client: 'Dewi Lestari',
        location: 'Pekanbaru, Riau',
        category: 'Renovasi Rumah',
        duration: '1.5 Bulan',
        completedDate: new Date('2024-02-20'),
        description: 'Transformasi total dapur dan kamar mandi dengan konsep minimalis modern. Menggunakan material berkualitas tinggi dan desain yang fungsional untuk menciptakan ruang yang nyaman dan estetis.',
        imageUrl: [
          '/images/portfolio/dapur-before.jpg',
          '/images/portfolio/dapur-after-1.jpg',
          '/images/portfolio/dapur-after-2.jpg',
          '/images/portfolio/kamar-mandi-after.jpg',
        ],
        published: true,
      },
      {
        proyekId: proyek5.id,
        name: 'Landscaping Taman Minimalis Tropis',
        client: 'Dewi Lestari',
        location: 'Pekanbaru, Riau',
        category: 'Landscaping',
        duration: '1.5 Bulan',
        completedDate: new Date('2023-12-15'),
        description: 'Penataan taman dengan konsep minimalis tropis yang memadukan elemen modern dan natural. Dilengkapi dengan vertical garden, water feature, dan sistem pencahayaan outdoor yang estetis.',
        imageUrl: [
          '/images/portfolio/taman-1.jpg',
          '/images/portfolio/taman-2.jpg',
          '/images/portfolio/taman-3.jpg',
        ],
        published: true,
      },
    ])

    console.log('   Portfolios seeded!')

    // ========================================
    // 7. SEED TESTIMONIS
    // ========================================
    console.log('⭐ Seeding testimonials...')

    await db.insert(testimonis).values([
      {
        proyekId: proyek1.id,
        userId: pelanggan1.id,
        komentar: 'Sangat puas dengan hasil renovasi! Tim Renovi sangat profesional, komunikatif, dan hasil kerjanya rapi. Dapur dan kamar mandi sekarang terlihat seperti baru dengan desain yang modern. Highly recommended!',
        rating: 5,
        gambar: '/images/testimonials/test-1.jpg',
        approved: true,
        approvedAt: new Date('2024-02-22'),
        approvedBy: admin.id,
        posting: new Date('2024-02-21'),
      },
      {
        proyekId: proyek5.id,
        userId: pelanggan1.id,
        komentar: 'Taman rumah saya sekarang jadi lebih asri dan indah. Konsep minimalis tropisnya pas banget dengan suasana rumah. Terima kasih Renovi dan tim untuk pekerjaan yang luar biasa!',
        rating: 5,
        gambar: '/images/testimonials/test-2.jpg',
        approved: true,
        approvedAt: new Date('2023-12-17'),
        approvedBy: admin.id,
        posting: new Date('2023-12-16'),
      },
    ])

    console.log('   Testimonials seeded!')

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log('👥 Users: 8 (1 admin, 3 mandor, 4 pelanggan)')
    console.log('🏗️  Projects: 5 (2 selesai, 2 dalam progress, 1 perencanaan)')
    console.log('📍 Milestones: 15')
    console.log('📦 Materials: 10')
    console.log('📰 Articles: 3')
    console.log('💼 Portfolios: 2')
    console.log('⭐ Testimonials: 2')
    console.log('\n🔑 Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Admin:')
    console.log('  Username: admin')
    console.log('  Password: admin123')
    console.log('\nMandor (pilih salah satu):')
    console.log('  Username: ahmad_mandor | Password: mandor123')
    console.log('  Username: budi_mandor | Password: mandor123')
    console.log('  Username: cahyo_mandor | Password: mandor123')
    console.log('\nPelanggan (pilih salah satu):')
    console.log('  Username: dewi_lestari | Password: pelanggan123')
    console.log('  Username: eko_prasetyo | Password: pelanggan123')
    console.log('  Username: fitri_handayani | Password: pelanggan123')
    console.log('  Username: gunawan_wijaya | Password: pelanggan123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ Database is ready to use!')
    console.log('Run "npm run dev" to start the application\n')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

seed()