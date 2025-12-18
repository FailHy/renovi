import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { projeks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  MapPin,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
  CalendarDays,
} from "lucide-react";

export default async function KlienDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "pelanggan") redirect("/unauthorized");

  // Fetch client's projects
  const klienProjects = await db.query.projeks.findMany({
    where: eq(projeks.pelangganId, session.user.id),
    orderBy: (projeks, { desc }) => [desc(projeks.lastUpdate)],
    limit: 3, // Ambil 3 proyek terbaru untuk dashboard
    with: {
      mandor: {
        columns: {
          id: true,
          nama: true,
          telpon: true,
        },
      },
    },
  });

  // Calculate simple stats
  const totalProyek = klienProjects.length;
  const proyekAktif = klienProjects.filter(
    (p) => p.status === "Dalam Progress"
  ).length;
  const proyekSelesai = klienProjects.filter(
    (p) => p.status === "Selesai"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dalam Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Selesai":
        return "bg-green-100 text-green-700 border-green-200";
      case "Perencanaan":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Halo, {session.user.name?.split(" ")[0] || "Klien"}
          </h1>
          <p className="text-gray-500 mt-1">
            Pantau perkembangan proyek konstruksi Anda di sini.
          </p>
        </div>
        <Link
          href="/klien/proyek"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          Semua Proyek <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Sedang Berjalan
              </p>
              <p className="text-3xl font-bold text-blue-600">{proyekAktif}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Proyek Selesai
              </p>
              <p className="text-3xl font-bold text-green-600">
                {proyekSelesai}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Proyek
              </p>
              <p className="text-3xl font-bold text-gray-900">{totalProyek}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Projects List (The "Value" Part) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Aktivitas Terbaru
          </h2>
        </div>

        {klienProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {klienProjects.map((proyek) => (
              <Link
                key={proyek.id}
                href={`/klien/proyek/${proyek.id}`}
                className="group block h-full"
              >
                <Card className="h-full border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative">
                  {/* Status Strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      proyek.status === "Dalam Progress"
                        ? "bg-blue-500"
                        : proyek.status === "Selesai"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />

                  <CardContent className="p-6 pl-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                          {proyek.nama}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">
                            {proyek.alamat}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`px-3 py-1 ${getStatusColor(proyek.status)}`}
                      >
                        {proyek.status}
                      </Badge>
                    </div>

                    {/* Progress Bar Visual */}
                    <div className="mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">
                          Progress
                        </span>
                        <span className="font-bold text-gray-900">
                          {proyek.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            proyek.progress === 100
                              ? "bg-green-500"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${proyek.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Mandor</p>
                          <p className="font-medium">
                            {proyek.mandor?.nama || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Update:{" "}
                        {new Date(
                          proyek.lastUpdate || proyek.updatedAt
                        ).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Belum ada proyek
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              Saat ini Anda belum memiliki proyek yang aktif. Hubungi admin
              untuk memulai proyek baru.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
