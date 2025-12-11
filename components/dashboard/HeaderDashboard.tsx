"use client";

interface HeaderDashboardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

interface HeaderDashboardKlienProps {
  nama: string;           // Dari tabel 'users' - field 'nama'
  totalProyek: number;    // Jumlah total proyek klien
  proyekAktif?: number;   // Proyek dengan status 'Dalam Progress' (default 0)
  proyekSelesai?: number; // Proyek dengan status 'Selesai' (default 0)
  action?: React.ReactNode;
}

export function HeaderDashboardKlien({ 
  nama, 
  totalProyek,
  proyekAktif = 0,
  proyekSelesai = 0,
  action 
}: HeaderDashboardKlienProps) {
  // Static date - tidak menyebabkan hydration error
  const now = new Date();
  
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const namaHari = hari[now.getDay()];
  const tanggal = now.getDate();
  const namaBulan = bulan[now.getMonth()];
  const tahun = now.getFullYear();

  // Format waktu tanpa detik untuk mengurangi perbedaan
  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Hitung progress keseluruhan
  const progressPercentage = totalProyek > 0 
    ? Math.round((proyekSelesai / totalProyek) * 100) 
    : 0;

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat datang, {nama}!
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <div className="text-sm">
            <span className="text-gray-600">Total Proyek: </span>
            <span className="font-semibold text-gray-900">{totalProyek}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Sedang Berjalan: </span>
            <span className="font-semibold text-amber-600">{proyekAktif}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Selesai: </span>
            <span className="font-semibold text-emerald-600">{proyekSelesai}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Progress: </span>
            <span className="font-semibold text-blue-600">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* TANGGAL & JAM - Static */}
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {namaHari}, {tanggal} {namaBulan} {tahun}
          </p>
          <p className="text-sm text-gray-600">{jam}</p>
        </div>

        {/* ACTION BUTTONS */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function HeaderDashboard({ title, description, action }: HeaderDashboardProps) {
  // Static date - tidak menyebabkan hydration error
  const now = new Date();
  
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const namaHari = hari[now.getDay()];
  const tanggal = now.getDate();
  const namaBulan = bulan[now.getMonth()];
  const tahun = now.getFullYear();

  // Format waktu tanpa detik untuk mengurangi perbedaan
  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
    // Hilangkan second untuk mengurangi kemungkinan mismatch
  });

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* TANGGAL & JAM - Static */}
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {namaHari}, {tanggal} {namaBulan} {tahun}
          </p>
          <p className="text-sm text-gray-600">{jam}</p>
        </div>

        {/* ACTION BUTTONS */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

// ... (specific headers tetap sama)

// Specific headers untuk setiap modul - TAMBAHKAN ACTION PROP
export function HeaderManajemenPengguna({ action }: { action?: React.ReactNode }) {
  return (
    <HeaderDashboard 
      title="Manajemen Pengguna"
      description="Kelola data pengguna, role, dan akses sistem"
      action={action}
    />
  );
}

export function HeaderManajemenArtikel({ action }: { action?: React.ReactNode }) {
  return (
    <HeaderDashboard 
      title="Manajemen Artikel"
      description="Kelola konten artikel dan postingan blog"
      action={action}
    />
  );
}

export function HeaderManajemenPortfolio({ action }: { action?: React.ReactNode }) {
  return (
    <HeaderDashboard 
      title="Manajemen Portfolio"
      description="Kelola project portfolio dan karya"
      action={action}
    />
  );
}

export function HeaderManajemenTestimoni({ action }: { action?: React.ReactNode }) {
  return (
    <HeaderDashboard 
      title="Manajemen Testimoni"
      description="Kelola testimoni dan review dari klien"
      action={action}
    />
  );
}

export function HeaderManajemenProyek({ action }: { action?: React.ReactNode }) {
  return (
    <HeaderDashboard 
      title="Manajemen Proyek"
      description="Pantau dan kelala progress proyek yang sedang berjalan"
      action={action}
    />
  );
}