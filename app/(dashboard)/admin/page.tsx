/* File: app/(dashboard)/admin/beranda/page.tsx */
import { db } from "@/lib/db";
import { HeaderDashboard } from "@/components/dashboard/HeaderDashboard";
import { users, projeks, portfolios, testimonis } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  MessageSquareWarning,
  Plus,
  ArrowRight,
  XCircle,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ProjectProgressChart from "@/components/dashboard/ProjectChart";
import WiseWords from "@/components/dashboard/WiseWords";

const getStatusBadgeVariant = (
  status: string
): "success" | "info" | "danger" | "warning" | undefined => {
  switch (status) {
    case "Selesai":
      return "success";
    case "Dalam Progress":
      return "info";
    case "Dibatalkan":
      return "danger";
    case "Perencanaan":
      return "warning";
    default:
      return undefined;
  }
};

async function getDashboardStats() {
  const [
    totalUsers,
    totalProjects,
    completedProjects,
    inProgressProjects,
    planningProjects,
    cancelledProjects, // totalPortfolios - not used
    ,
    pendingTestimonials,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(projeks),
    db
      .select({ value: count() })
      .from(projeks)
      .where(eq(projeks.status, "Selesai")),
    db
      .select({ value: count() })
      .from(projeks)
      .where(eq(projeks.status, "Dalam Progress")),
    db
      .select({ value: count() })
      .from(projeks)
      .where(eq(projeks.status, "Perencanaan")),
    db
      .select({ value: count() })
      .from(projeks)
      .where(eq(projeks.status, "Dibatalkan")),
    db.select({ value: count() }).from(portfolios),
    db
      .select({ value: count() })
      .from(testimonis)
      .where(eq(testimonis.approved, false)),
  ]);

  const recentProjects = await db.query.projeks.findMany({
    orderBy: [desc(projeks.createdAt)],
    limit: 5,
    with: {
      pelanggan: { columns: { nama: true } },
    },
  });

  const chartData = [
    { name: "Perencanaan", total: planningProjects[0]?.value || 0 },
    { name: "Berlangsung", total: inProgressProjects[0]?.value || 0 },
    { name: "Selesai", total: completedProjects[0]?.value || 0 },
    { name: "Dibatalkan", total: cancelledProjects[0]?.value || 0 },
  ];

  return {
    totalUsers: totalUsers[0]?.value || 0,
    totalProjects: totalProjects[0]?.value || 0,
    completedProjects: completedProjects[0]?.value || 0,
    inProgressProjects: inProgressProjects[0]?.value || 0,
    cancelledProjects: cancelledProjects[0]?.value || 0,
    pendingTestimonials: pendingTestimonials[0]?.value || 0,
    recentProjects,
    chartData,
  };
}

export default async function AdminBerandaPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600 w-12 h-12 opacity-30",
    },
    {
      title: "Total Proyek",
      value: stats.totalProjects,
      icon: Briefcase,
      color: "text-purple-600 w-12 h-12 opacity-30",
    },
    {
      title: "Proyek Selesai",
      value: stats.completedProjects,
      icon: CheckCircle2,
      color: "text-green-600 w-12 h-12 opacity-30",
    },
    {
      title: "Proyek Berlangsung",
      value: stats.inProgressProjects,
      icon: Clock,
      color: "text-yellow-600 w-12 h-12 opacity-30",
    },
    {
      title: "Proyek Dibatalkan",
      value: stats.cancelledProjects,
      icon: XCircle,
      color: "text-red-600 w-12 h-12 opacity-30",
    },
    {
      title: "Testimoni Pending",
      value: stats.pendingTestimonials,
      icon: MessageSquareWarning,
      color: "text-orange-600 w-12 h-12 opacity-30",
      href: "/admin/testimoni",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <HeaderDashboard title="Selamat Datang, Admin!" />
        <WiseWords />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value.toString()}
                icon={stat.icon}
                color={stat.color}
                href={stat.href}
              />
            ))}
          </div>

          {/* Project Chart */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Ringkasan Status Proyek
                </CardTitle>
                <Badge
                  variant="info"
                  className="bg-blue-500/10 text-blue-600 w-12 h-12 opacity-30 border-0"
                >
                  Live Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* PERBAIKAN: Tambahkan wrapper dengan min-height */}
              <div className="w-full min-h-[320px]">
                <ProjectProgressChart
                  data={stats.chartData.map((d) => ({
                    name: d.name,
                    progress: d.total,
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {/* Quick Actions - Minimal Version */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/admin/proyek/tambah"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-medium">Tambah Proyek Baru</span>
              </Link>

              <Link
                href="/admin/testimoni"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquareWarning className="w-4 h-4 text-muted-foreground" />
                  <span>Persetujuan Testimoni</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/admin/pengguna"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Kelola Pengguna</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Proyek Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flow-root">
                <ul role="list" className="divide-y divide-border">
                  {stats.recentProjects.length > 0 ? (
                    stats.recentProjects.map((project) => (
                      <li key={project.id} className="group">
                        <Link
                          href={`/admin/proyek/${project.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors duration-200"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {project.nama}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span className="truncate">
                                {project.pelanggan?.nama || "Klien tidak ada"}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(project.status)}
                            className="shrink-0 text-xs px-2 py-1 bg-opacity-20 border-opacity-50"
                          >
                            {project.status}
                          </Badge>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-center p-8">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <FolderKanban className="w-12 h-12 opacity-50" />
                        <div>
                          <p className="font-medium">Belum ada proyek</p>
                          <p className="text-sm mt-1">
                            Proyek yang dibuat akan muncul di sini
                          </p>
                        </div>
                        <Button variant="outline" className="mt-2">
                          <Link href="/admin/proyek/tambah">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Proyek Pertama
                          </Link>
                        </Button>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Footer dengan link lihat semua */}
              {stats.recentProjects.length > 0 && (
                <div className="border-t border-border p-4">
                  <Button variant="ghost" className="w-full justify-center">
                    <Link
                      href="/admin/proyek"
                      className="flex items-center gap-2"
                    >
                      <span>Lihat Semua Proyek</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Improved StatCard Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-border/80 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold text-foreground">{value}</div>
          </div>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
