// FILE: app/(dashboard)/mandor/proyek/[id]/nota/[notaId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getNotaById, deleteNota } from "@/lib/actions/mandor/nota";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Store,
  User,
  Package,
  Tag,
  FileText,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
// import { Button } from '@/components/ui/Button'
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/mandor/modals/DeleteModal";
import { NotaModal } from "@/components/mandor/modals/NotaModal";
import { BahanFormSection } from "@/components/mandor/BahanForm";
import { getMilestonesByProjectId } from "@/lib/actions/mandor/milestone";

interface MilestoneData {
  id: string;
  nama: string;
  status: string;
}

interface NotaItem {
  id: string;
  nama: string;
  harga: number | string;
  kuantitas: number | string;
  satuan: string;
  milestoneId?: string | null;
  notaId?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  kategori?: string | null;
  [key: string]: unknown;
}

interface NotaData {
  id: string;
  nomorNota?: string | null;
  namaToko?: string | null;
  tanggalBelanja?: string | Date | null;
  fotoNotaUrl?: string | null;
  total_harga?: number;
  jumlah_item?: number;
  items?: NotaItem[];
  createdAt?: string | Date;
  milestone?: {
    nama: string;
  } | null;
  creator?: {
    nama: string;
  } | null;
  [key: string]: unknown;
}

export default function NotaDetailPage({
  params,
}: {
  params: Promise<{ id: string; notaId: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [nota, setNota] = useState<NotaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>("");

  // State untuk modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "bahan" as "bahan" | "nota",
    itemId: "",
    itemName: "",
    isLoading: false,
  });

  const [notaModal, setNotaModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  // Milestones untuk dropdown
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { id: projId, notaId } = await params;

        console.log("🔍 Params:", { projId, notaId });
        setProjectId(projId);

        if (!notaId) {
          console.error("❌ notaId is missing!");
          notFound();
        }

        const result = await getNotaById(notaId);

        console.log("📦 Nota Result:", result);

        if (!result.success || !result.data) {
          console.error("❌ Failed to fetch nota:", result.error);
          setError(result.error || "Gagal memuat data nota");
          return;
        }

        setNota(result.data as NotaData);

        // Fetch milestones untuk project ini
        try {
          const milestonesResult = await getMilestonesByProjectId(projId);
          console.log("📦 Milestones Result:", milestonesResult);

          if (milestonesResult.success && milestonesResult.data) {
            // Pastikan milestone ID adalah UUID valid
            const validMilestones = milestonesResult.data
              .map(
                (milestone: {
                  id?: string;
                  nama?: string;
                  status?: string;
                }) => ({
                  id: milestone.id || "",
                  nama: milestone.nama || "Unnamed Milestone",
                  status: milestone.status || "",
                })
              )
              .filter(
                (milestone: MilestoneData) => milestone.id
              ) as MilestoneData[];

            setMilestones(validMilestones);
            console.log("   Valid milestones:", validMilestones);
          } else {
            console.warn(
              "  No milestones found or error:",
              milestonesResult.error
            );
            setMilestones([]);
          }
        } catch (milestoneError) {
          console.error("❌ Error fetching milestones:", milestoneError);
          setMilestones([]);
        }
      } catch (err) {
        console.error("Error fetching nota:", err);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params]);

  // Refresh data
  const refreshData = async () => {
    try {
      const { notaId } = await params;
      const result = await getNotaById(notaId);
      if (result.success && result.data) {
        setNota(result.data as NotaData);
        toast.success("Data diperbarui");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Handle delete nota
  const handleDeleteNotaClick = () => {
    if (!nota) return;
    setDeleteModal({
      isOpen: true,
      type: "nota",
      itemId: nota.id,
      itemName: `Nota #${nota.nomorNota || "Tanpa Nomor"}`,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      if (deleteModal.type === "bahan") {
        // Hapus bahan
        const result = await fetch(`/api/bahan/${deleteModal.itemId}`, {
          method: "DELETE",
        });

        if (result.ok) {
          toast.success(`${deleteModal.itemName} berhasil dihapus`);
          refreshData();
        } else {
          toast.error("Gagal menghapus bahan");
        }
      } else {
        // Hapus nota
        const result = await deleteNota(deleteModal.itemId);

        if (result.success) {
          toast.success("Nota berhasil dihapus");
          router.push(`/mandor/proyek/${projectId}`);
          return;
        } else {
          toast.error(result.error || "Gagal menghapus nota");
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Terjadi kesalahan saat menghapus");
    } finally {
      setDeleteModal({
        isOpen: false,
        type: "bahan",
        itemId: "",
        itemName: "",
        isLoading: false,
      });
    }
  };

  // Handle open nota modal untuk update
  const handleOpenNotaModal = () => {
    setNotaModal({ isOpen: true, isLoading: false });
  };

  const handleCloseNotaModal = () => {
    setNotaModal({ isOpen: false, isLoading: false });
    refreshData(); // Refresh data setelah modal ditutup
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail nota...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !nota) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/mandor/proyek/${projectId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Proyek
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gagal Memuat Data
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "Data nota tidak ditemukan"}
            </p>
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header dengan Back Button dan Actions */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <Link
              href={`/mandor/proyek/${projectId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Proyek
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Detail Nota Belanja
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600">
                  Nota #{nota.nomorNota || "Tanpa Nomor"} •{" "}
                  {nota.namaToko || "Tanpa Nama Toko"}
                </p>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {nota.items?.length || 0} bahan
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg md:text-xl font-bold text-green-600">
                Rp {(nota.total_harga || 0).toLocaleString("id-ID")}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Total nilai pembelian
              </div>
            </div>
          </div>
        </div>

        {/* Info Nota Card dengan Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Action Bar di atas card */}
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">
                  Informasi Nota
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenNotaModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteNotaClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          </div>

          {/* Konten Info Nota */}
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Nama Toko
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {nota.namaToko || "-"}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">
                      Tanggal Belanja
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {nota.tanggalBelanja
                    ? new Date(nota.tanggalBelanja).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wider">
                      Jumlah Item
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {nota.jumlah_item || 0} item
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-orange-700 uppercase tracking-wider">
                      Dibuat Oleh
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {nota.creator?.nama || "-"}
                </p>
              </div>
            </div>

            {/* Informasi Tambahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-2">Dibuat pada</p>
                <p className="font-medium text-gray-900">
                  {nota.createdAt
                    ? new Date(nota.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>

              {nota.milestone && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Milestone Terkait
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    {nota.milestone.nama}
                  </div>
                </div>
              )}
            </div>

            {/* Foto Nota */}
            {nota.fotoNotaUrl && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Foto Nota{" "}
                  </p>
                </div>
                <div className="relative max-w-2xl mx-auto">
                  <Image
                    src={nota.fotoNotaUrl}
                    alt="Foto Nota"
                    width={800}
                    height={600}
                    className="w-full rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      nota.fotoNotaUrl &&
                      window.open(nota.fotoNotaUrl, "_blank")
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: BAHAN HARIAN */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Header dengan tombol aksi */}
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bahan Harian
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tambah atau kelola bahan dalam nota ini
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2"></div>
            </div>
          </div>

          {/* Konten BahanFormSection */}
          <div className="p-5 md:p-6">
            <BahanFormSection
              notaId={nota.id}
              proyekId={projectId}
              existingBahan={nota.items || []}
              milestones={milestones}
              onBahanUpdated={refreshData}
              // onDeleteBahan={handleDeleteBahanClick}
            />
          </div>
        </div>

        {/* Nota Modal untuk Update */}
        <NotaModal
          isOpen={notaModal.isOpen}
          onClose={handleCloseNotaModal}
          proyekId={projectId}
          notaData={nota}
          milestones={milestones}
        />

        {/* Modal Konfirmasi Delete */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({
              isOpen: false,
              type: "bahan",
              itemId: "",
              itemName: "",
              isLoading: false,
            })
          }
          title={`Konfirmasi Hapus ${
            deleteModal.type === "nota" ? "Nota" : "Bahan"
          }`}
          description={`Apakah Anda yakin ingin menghapus ${
            deleteModal.type === "nota" ? "nota ini" : "bahan ini"
          }?`}
          itemName={deleteModal.itemName}
          itemType={deleteModal.type}
          onConfirm={handleConfirmDelete}
          isLoading={deleteModal.isLoading}
        />
      </div>
    </div>
  );
}
