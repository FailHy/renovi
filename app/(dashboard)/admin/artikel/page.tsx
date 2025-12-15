"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Newspaper,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { HeaderManajemenArtikel } from "@/components/dashboard/HeaderDashboard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import {
  getAllArtikels,
  createArtikel,
  updateArtikel,
  deleteArtikel,
  getKategoriOptions,
} from "@/lib/actions/admin/artikel";

const artikelSchema = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  konten: z.string().min(50, "Konten minimal 50 karakter"),
  kategori: z.string().optional(),
  gambar: z.string().optional(),
  published: z.boolean(),
});

type ArtikelFormData = z.infer<typeof artikelSchema>;

// 1. UPDATE INTERFACE AGAR SESUAI DENGAN DATABASE
interface Artikel {
  id: string;
  judul: string;
  konten: string;
  kategori: string | null; // Ubah dari ? (undefined) ke null
  gambar: string | null; // Ubah dari ? (undefined) ke null
  published: boolean;
  posting: Date; // Ubah dari string ke Date
  author: {
    nama: string;
  } | null; // Izinkan null jika author terhapus
}

export default function ManajemenArtikelPage() {
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtikel, setEditingArtikel] = useState<Artikel | null>(null);
  const [artikels, setArtikels] = useState<Artikel[]>([]);
  const [kategoriOptions, setKategoriOptions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterPublished, setFilterPublished] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingArtikel, setDeletingArtikel] = useState<Artikel | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ArtikelFormData>({
    resolver: zodResolver(artikelSchema),
  });

  const imagePreview = watch("gambar");

  // Data fetching
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artikelsData, kategoriData] = await Promise.all([
        getAllArtikels(),
        getKategoriOptions(),
      ]);

      setArtikels(artikelsData);
      setKategoriOptions(kategoriData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setArtikels([]);
      setKategoriOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Image upload handling
  const handleImageUpload = async (
    file: File,
    isUpdate: boolean = false,
    oldImageUrl?: string | null
  ) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      if (isUpdate && oldImageUrl) {
        const oldFilename = oldImageUrl.split("/").pop();
        if (oldFilename) {
          formData.append("oldFilename", oldFilename);
        }
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setValue("gambar", result.url);
      } else {
        alert(result.error || "Gagal mengupload gambar");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi client-side
      if (!file.type.startsWith("image/")) {
        alert("Harap pilih file gambar yang valid (PNG, JPG, JPEG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      // Tentukan apakah ini update atau create baru
      const isUpdate = !!editingArtikel;
      const oldImageUrl = editingArtikel?.gambar;

      handleImageUpload(file, isUpdate, oldImageUrl);
    }
  };

  const removeImage = () => {
    setValue("gambar", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Filtering logic
  const filteredArtikels = artikels.filter((artikel) => {
    const matchSearch =
      artikel.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artikel.konten.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKategori = filterKategori
      ? artikel.kategori === filterKategori
      : true;

    const matchPublished =
      filterPublished === ""
        ? true
        : filterPublished === "published"
        ? artikel.published
        : !artikel.published;

    return matchSearch && matchKategori && matchPublished;
  });

  // Modal handlers
  const handleOpenModal = (artikel?: Artikel) => {
    if (artikel) {
      setEditingArtikel(artikel);
      reset({
        judul: artikel.judul,
        konten: artikel.konten,
        kategori: artikel.kategori || "", // Handle null
        gambar: artikel.gambar || "", // Handle null
        published: artikel.published,
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setEditingArtikel(null);
      reset({
        judul: "",
        konten: "",
        kategori: "",
        gambar: "",
        published: false,
      });
      // Reset file input untuk create baru
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArtikel(null);
    reset();
    // Reset file input saat modal ditutup
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission
  const onSubmit = async (data: ArtikelFormData) => {
    try {
      let result;
      if (editingArtikel) {
        result = await updateArtikel(editingArtikel.id, data);
      } else {
        result = await createArtikel(data);
      }

      if (result.success) {
        await fetchData();
        handleCloseModal();
      } else {
        alert(
          result.error ||
            `Gagal ${editingArtikel ? "mengupdate" : "membuat"} artikel`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    }
  };

  // Delete handlers
  const handleDelete = (artikel: Artikel) => {
    setDeletingArtikel(artikel);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingArtikel) return;

    try {
      const result = await deleteArtikel(deletingArtikel.id);
      if (result.success) {
        await fetchData();
      } else {
        alert(result.error || "Gagal menghapus artikel");
      }
      setIsDeleteModalOpen(false);
      setDeletingArtikel(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  // Stats calculation
  const getStats = () => {
    const published = artikels.filter((a) => a.published).length;
    const draft = artikels.filter((a) => !a.published).length;
    return { published, draft, total: artikels.length };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section artikel */}
      <HeaderManajemenArtikel
        action={
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Artikel
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Artikel</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Newspaper className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.published}
                </p>
              </div>
              <Eye className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.draft}
                </p>
              </div>
              <EyeOff className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari judul atau konten..."
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>

            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content Section */}
      {loading ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-3 text-gray-600 font-medium">
              Memuat data artikel...
            </p>
          </CardContent>
        </Card>
      ) : filteredArtikels.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <Newspaper className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm || filterKategori || filterPublished
                ? "Tidak ada artikel yang ditemukan"
                : "Belum ada artikel"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || filterKategori || filterPublished
                ? "Coba ubah filter pencarian atau kata kunci"
                : "Mulai dengan membuat artikel pertama untuk blog Anda"}
            </p>
            {!searchTerm && !filterKategori && !filterPublished && (
              <Button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Artikel Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtikels.map((artikel) => (
            <Card
              key={artikel.id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              {/* Image Section */}
              <div className="relative flex-shrink-0">
                <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                  {artikel.gambar ? (
                    <img
                      src={artikel.gambar}
                      alt={artikel.judul}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Newspaper className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={artikel.published ? "success" : "warning"}
                    className="text-xs px-2.5 py-1 font-medium shadow-sm"
                  >
                    {artikel.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-5 flex flex-col flex-grow">
                {artikel.kategori && (
                  <Badge
                    variant="info"
                    className="mb-3 text-xs w-fit px-2.5 py-1"
                  >
                    {artikel.kategori}
                  </Badge>
                )}

                <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {artikel.judul}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow leading-relaxed">
                  {artikel.konten}
                </p>

                {/* Footer with Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex flex-col min-w-0 flex-1">
                    {/* 2. SAFE ACCESS FOR AUTHOR */}
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {artikel.author?.nama || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {/* 3. FORMAT DATE (Assuming helper handles Date) */}
                      {formatDate(artikel.posting)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenModal(artikel)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                      title="Edit artikel"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(artikel)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                      title="Hapus artikel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingArtikel ? "Edit Artikel" : "Tambah Artikel"}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Artikel
              </label>
              <Input
                placeholder="Contoh: Tips Memilih Kontraktor Terbaik"
                error={errors.judul?.message}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                {...register("judul")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <Select
                options={kategoriOptions.map((k) => ({ value: k, label: k }))}
                error={errors.kategori?.message}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                {...register("kategori")}
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Artikel
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
                disabled={isSubmitting || uploading}
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={removeImage}
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm"
                      disabled={isSubmitting || uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Gambar berhasil diupload
                  </p>
                </div>
              ) : (
                <div
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-600 font-medium">Mengupload...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        PNG, JPG, JPEG (max. 5MB)
                      </p>
                    </>
                  )}
                </div>
              )}
              {errors.gambar?.message && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.gambar.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Artikel
              </label>
              <Textarea
                placeholder="Tulis konten artikel di sini..."
                rows={10}
                error={errors.konten?.message}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                {...register("konten")}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register("published")}
              />
              <label htmlFor="published" className="text-sm text-gray-700">
                Publikasikan artikel sekarang
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              disabled={isSubmitting || uploading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || uploading
                ? "Menyimpan..."
                : editingArtikel
                ? "Update Artikel"
                : "Simpan Artikel"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus artikel{" "}
            <strong className="text-red-600">{deletingArtikel?.judul}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-sm rounded-lg font-medium transition-colors"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
