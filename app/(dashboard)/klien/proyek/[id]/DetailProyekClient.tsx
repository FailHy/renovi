"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Star,
  MessageSquare,
  Package,
  Clock,
  Eye,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/TextArea";
import { createTestimoni } from "@/lib/actions/klien/testimoni";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { normalizeProgress, getProgressColor } from "@/lib/utils/progressUtils";
import Link from "next/link";
import Image from "next/image";

interface DetailProyekKlienClientProps {
  proyek: {
    id: string;
    nama: string;
    tipeLayanan: string;
    deskripsi: string | null;
    alamat: string;
    status: string;
    progress: number;
    gambar?: string[] | null;
    tanggalMulai: Date;
    tanggalSelesai: Date | null;
    mandor: {
      id: string;
      nama: string;
      telpon: string | null;
    };
    hasTestimoni: boolean;
    testimoniData?: {
      id: string;
      rating: number;
      komentar: string;
      approved: boolean;
      createdAt: Date;
    } | null;
  };
  milestones: Array<{
    id: string;
    nama: string;
    deskripsi: string | null;
    status: string;
    targetSelesai: Date | null;
    tanggalSelesai: Date | null;
  }>;
  bahan: Array<{
    id: string;
    nama: string;
    deskripsi: string | null;
    harga: string;
    kuantitas: string;
    satuan: string;
    kategori: string | null;
    status: string;
    createdAt: Date;
    nota: {
      id: string;
      namaToko: string | null;
      tanggalBelanja: Date;
    };
  }>;
  klienId: string;
}

export function DetailProyekKlienClient({
  proyek,
  milestones,
  bahan,
  klienId,
}: DetailProyekKlienClientProps) {
  const [activeTab, setActiveTab] = useState<"info" | "milestone" | "bahan">(
    "info"
  );
  const [isTestimoniModalOpen, setIsTestimoniModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayProgress = normalizeProgress(proyek.progress);
  const displayStatus = proyek.status || "Perencanaan";

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Perencanaan: "bg-blue-100 text-blue-800 border-blue-300",
      "Dalam Progress": "bg-yellow-100 text-yellow-800 border-yellow-300",
      Selesai: "bg-green-100 text-green-800 border-green-300",
      Dibatalkan: "bg-red-100 text-red-800 border-red-300",
      "Belum Dimulai": "bg-gray-100 text-gray-800 border-gray-300",
      Digunakan: "bg-green-100 text-green-800 border-green-300",
      Sisa: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Rusak: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const handleSubmitTestimoni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!komentar.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Mengirim testimoni...");
    try {
      const result = await createTestimoni({
        proyekId: proyek.id,
        klienId: klienId,
        rating,
        komentar: komentar.trim(),
      });
      if (result.success) {
        toast.success("Testimoni berhasil dikirim!", { id: toastId });
        setIsTestimoniModalOpen(false);
        setKomentar("");
        setRating(5);
        window.location.reload();
      } else {
        toast.error(result.error || "Gagal mengirim testimoni", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error submitting testimoni:", error);
      toast.error("Terjadi kesalahan", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBahanCost = bahan.reduce((sum, item) => {
    return sum + parseFloat(item.harga) * parseFloat(item.kuantitas);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Hero Section dengan Gambar Proyek */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {/* Project Image */}
        <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-slate-100 to-slate-200">
          {proyek.gambar && proyek.gambar.length > 0 ? (
            <Image
              src={proyek.gambar[0]}
              alt={proyek.nama}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <ImageIcon className="w-16 h-16 text-blue-300 mb-3" />
              <span className="text-sm text-blue-400 font-medium">
                Belum ada foto proyek
              </span>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm mb-3">
                  {proyek.tipeLayanan}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {proyek.nama}
                </h1>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{proyek.alamat}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 shadow-lg ${getStatusColor(
                    displayStatus
                  )}`}
                >
                  {displayStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimoni Button Section */}
      {displayStatus === "Selesai" && displayProgress === 100 && (
        <div className="flex justify-end">
          {!proyek.testimoniData ? (
            <Button
              onClick={() => setIsTestimoniModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Star className="w-4 h-4 mr-2" /> Berikan Testimoni
            </Button>
          ) : proyek.testimoniData.approved === false ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              <Clock className="w-4 h-4" />{" "}
              <span className="text-sm font-medium">
                Testimoni menunggu persetujuan admin
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <MessageSquare className="w-4 h-4" />{" "}
              <span className="text-sm font-medium">
                Testimoni sudah diberikan
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Informasi Proyek
        </button>
        <button
          onClick={() => setActiveTab("milestone")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "milestone"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Milestone ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab("bahan")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "bahan"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Bahan Material ({bahan.length})
        </button>
      </div>

      {activeTab === "info" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Proyek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Progress Proyek
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {displayProgress}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(
                        displayProgress
                      )}`}
                      style={{ width: `${displayProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              {proyek.deskripsi && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Deskripsi
                  </label>
                  <p className="text-gray-700 leading-relaxed">
                    {proyek.deskripsi}
                  </p>
                </div>
              )}

              {/* Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Tanggal Mulai
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDate(proyek.tanggalMulai)}
                    </p>
                  </div>
                </div>
                {proyek.tanggalSelesai && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
                        Tanggal Selesai
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formatDate(proyek.tanggalSelesai)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Mandor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Nama Mandor
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {proyek.mandor.nama}
                  </p>
                </div>
              </div>
              {proyek.mandor.telpon && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Nomor Telepon
                    </label>
                    <a
                      href={`tel:${proyek.mandor.telpon}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {proyek.mandor.telpon}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "milestone" && (
        <div className="space-y-4">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-xl text-gray-900 mb-2">
                            {milestone.nama}
                          </h4>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ml-4 ${getStatusColor(
                            milestone.status
                          )}`}
                        >
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Belum ada milestone
                </h3>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "bahan" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Bahan Material</CardTitle>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Biaya Bahan</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalBahanCost)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bahan.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Nama Bahan
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Toko
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Kuantitas
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Total
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bahan.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          {item.nama}
                        </td>
                        <td className="py-4 px-4">
                          {item.nota?.namaToko || "-"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {item.kuantitas} {item.satuan}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-green-600">
                          {formatCurrency(
                            parseFloat(item.harga) * parseFloat(item.kuantitas)
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.nota?.id ? (
                            <Link
                              href={`/klien/proyek/${proyek.id}/nota/${item.nota.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" /> Detail
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No Nota
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Belum ada bahan material
                </h3>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isTestimoniModalOpen}
        onClose={() => setIsTestimoniModalOpen(false)}
        title="Bagikan Pengalaman Anda"
        size="lg"
      >
        <form onSubmit={handleSubmitTestimoni} className="space-y-6">
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-2"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            placeholder="Ceritakan pengalaman Anda..."
            rows={5}
            required
          />
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTestimoniModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || rating === 0 || komentar.trim().length === 0
              }
              className="hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Testimoni"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
