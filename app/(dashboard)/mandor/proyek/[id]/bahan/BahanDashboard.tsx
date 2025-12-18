// FILE: app/(dashboard)/mandor/proyek/[id]/bahan/BahanDashboard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Package, DollarSign, List } from "lucide-react";

interface Proyek {
  id: string;
  nama: string;
}

interface BahanItem {
  id: string;
  nama?: string;
  harga: number | string;
  kuantitas: number | string;
  status?: string;
}

interface Milestone {
  id: string;
  nama: string;
}

interface BahanDashboardProps {
  proyek: Proyek;
  bahanList: BahanItem[];
  milestones: Milestone[];
  mandorId: string;
}
export default function BahanDashboard({
  proyek,
  bahanList = [], // Default value untuk array
}: BahanDashboardProps) {
  // const [filterStatus, setFilterStatus] = useState<string>('all');

  // Safety check untuk bahanList
  const safeBahanList = Array.isArray(bahanList) ? bahanList : [];

  // Calculate statistics
  const totalCost = safeBahanList.reduce(
    (sum, item) => sum + Number(item.harga) * Number(item.kuantitas),
    0
  );

  // Definisikan tipe untuk accumulator
  const bahanByStatus = safeBahanList.reduce((acc, item) => {
    const status = item.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>); // Tambahkan tipe Record

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bahan Harian</h1>
        {/* Gunakan optional chaining (?.) untuk mencegah error jika proyek null */}
        <p className="text-gray-600">Proyek: {proyek?.nama || "Loading..."}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Bahan</p>
                <p className="text-2xl font-bold">
                  {safeBahanList.length} item
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Biaya</p>
                <p className="text-2xl font-bold">
                  Rp {totalCost.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <List className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Status Bahan</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(bahanByStatus).map(([status, count]) => (
                    <span
                      key={status}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {status}: {count as number}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
