import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { projeks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Activity,
  CalendarDays,
  LayoutGrid,
  ImageIcon,
  MapPin,
  User,
} from "lucide-react";

// ============================================
// HELPER FUNCTIONS - Clean Code Best Practice
// ============================================

/**
 * Get status badge color based on project status
 */
function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    "Dalam Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Selesai: "bg-green-100 text-green-700 border-green-200",
    Perencanaan: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Dibatalkan: "bg-red-100 text-red-700 border-red-200",
  };
  return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

/**
 * Get progress bar color based on percentage
 */
function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-gradient-to-r from-emerald-500 to-emerald-400";
  if (progress >= 50) return "bg-gradient-to-r from-blue-500 to-blue-400";
  if (progress >= 30) return "bg-gradient-to-r from-amber-500 to-amber-400";
  return "bg-gradient-to-r from-rose-500 to-rose-400";
}

/**
 * Format date to Indonesian locale
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// TYPES
// ============================================

interface ProjectWithMandor {
  id: string;
  nama: string;
  tipeLayanan: string;
  deskripsi: string;
  alamat: string;
  status: string;
  progress: number;
  gambar: string[] | null;
  lastUpdate: Date;
  mandor: {
    id: string;
    nama: string;
    telpon: string | null;
  } | null;
}

// ============================================
// COMPONENTS
// ============================================

/**
 * Project Image Component - Reusable image display with fallback
 */
function ProjectImage({
  gambar,
  nama,
  tipeLayanan,
}: {
  gambar: string[] | null;
  nama: string;
  tipeLayanan: string;
}) {
  if (gambar && gambar.length > 0) {
    return (
      <Image
        src={gambar[0]}
        alt={nama}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
      <span className="text-xs text-slate-400 font-medium">{tipeLayanan}</span>
    </div>
  );
}

/**
 * Project Card Component - Displays individual project information
 */
function ProjectCard({ project }: { project: ProjectWithMandor }) {
  return (
    <Link href={`/klien/proyek/${project.id}`}>
      <Card
        hover
        className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
      >
        {/* Project Image Section */}
        <div className="relative w-full h-44 bg-slate-100">
          <ProjectImage
            gambar={project.gambar}
            nama={project.nama}
            tipeLayanan={project.tipeLayanan}
          />

          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <Badge
              className={`px-3 py-1 shadow-md ${getStatusColor(
                project.status
              )}`}
            >
              {project.status}
            </Badge>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-5">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {project.nama}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {project.tipeLayanan}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {project.deskripsi}
          </p>

          {/* Info Grid - Mandor & Location */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  Mandor
                </p>
                <p className="text-xs font-bold text-gray-800 truncate">
                  {project.mandor?.nama || "Belum ada"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  Lokasi
                </p>
                <p className="text-xs text-gray-700 truncate">
                  {project.alamat}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Progress
              </span>
              <span className="text-base font-black text-gray-900">
                {project.progress}%
              </span>
            </div>
            <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor(
                  project.progress
                )}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Footer - Last Update */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays className="w-3.5 h-3.5" />
              <p className="text-xs">
                Update:{" "}
                <span className="font-semibold text-gray-600">
                  {formatDate(project.lastUpdate)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Stats Card Component - Displays individual statistic
 */
function StatsCard({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  iconColor,
}: {
  title: string;
  value: number;
  icon: typeof Building2;
  bgColor: string;
  textColor: string;
  iconColor: string;
}) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty State Component - Shown when no projects exist
 */
function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Belum ada proyek</h3>
      <p className="text-gray-500 max-w-sm mx-auto mt-2">
        Anda belum memiliki proyek yang terdaftar. Hubungi admin untuk informasi
        lebih lanjut.
      </p>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default async function KlienProyekPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "pelanggan") redirect("/unauthorized");

  // Fetch client's projects with mandor relation
  const klienProjects = (await db.query.projeks.findMany({
    where: eq(projeks.pelangganId, session.user.id),
    orderBy: [desc(projeks.lastUpdate)],
    with: {
      mandor: {
        columns: {
          id: true,
          nama: true,
          telpon: true,
        },
      },
    },
  })) as ProjectWithMandor[];

  // Calculate stats
  const stats = {
    total: klienProjects.length,
    aktif: klienProjects.filter((p) => p.status === "Dalam Progress").length,
    selesai: klienProjects.filter((p) => p.status === "Selesai").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Daftar Proyek
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola dan pantau semua proyek konstruksi Anda.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
          <CalendarDays className="w-4 h-4" />
          {new Date().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Proyek"
          value={stats.total}
          icon={Building2}
          bgColor="bg-gray-50"
          textColor="text-gray-900"
          iconColor="text-gray-500"
        />
        <StatsCard
          title="Sedang Berjalan"
          value={stats.aktif}
          icon={Activity}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Selesai"
          value={stats.selesai}
          icon={CheckCircle2}
          bgColor="bg-green-50"
          textColor="text-green-600"
          iconColor="text-green-500"
        />
      </div>

      {/* Projects Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Semua Proyek
            </h2>
          </div>
          <span className="text-sm text-gray-500">
            {klienProjects.length} proyek
          </span>
        </div>

        {klienProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {klienProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}
