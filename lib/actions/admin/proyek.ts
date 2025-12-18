// FILE: lib/actions/admin/proyek.ts
// ========================================
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projeks, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm"; // Import inArray untuk query user yang efisien
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Definisi tipe status sesuai database untuk Type Casting
type StatusProyek = "Perencanaan" | "Dalam Progress" | "Selesai" | "Dibatalkan";

// Type untuk data dari form
interface ProyekFormData {
  nama: string;
  tipeLayanan: string;
  pelangganId: string;
  mandorId?: string;
  gambar?: string; // URL gambar dari upload
  deskripsi: string;
  alamat: string;
  telpon?: string;
  mulai: string;
  status: string;
}

export async function createProyek(formData: ProyekFormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const projekData = {
      nama: formData.nama,
      tipeLayanan: formData.tipeLayanan,
      pelangganId: formData.pelangganId,
      mandorId: formData.mandorId || null,
      gambar: formData.gambar ? [formData.gambar] : null, // Convert single URL to array
      deskripsi: formData.deskripsi,
      alamat: formData.alamat,
      telpon: formData.telpon || null,
      mulai: new Date(formData.mulai),
      // PERBAIKAN: Cast string ke tipe Enum StatusProyek
      status: formData.status as StatusProyek,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [proyek] = await db.insert(projeks).values(projekData).returning();
    revalidatePath("/admin/proyek");
    return { success: true, data: proyek };
  } catch (error) {
    console.error("Error creating proyek:", error);
    return { success: false, error: "Gagal membuat proyek" };
  }
}

export async function updateProyek(
  id: string,
  formData: Partial<ProyekFormData>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Handle each field
    if (formData.nama !== undefined) updateData.nama = formData.nama;
    if (formData.tipeLayanan !== undefined)
      updateData.tipeLayanan = formData.tipeLayanan;
    if (formData.pelangganId !== undefined)
      updateData.pelangganId = formData.pelangganId;
    if (formData.mandorId !== undefined)
      updateData.mandorId = formData.mandorId || null;
    if (formData.gambar !== undefined)
      updateData.gambar = formData.gambar ? [formData.gambar] : null;
    if (formData.deskripsi !== undefined)
      updateData.deskripsi = formData.deskripsi;
    if (formData.alamat !== undefined) updateData.alamat = formData.alamat;
    if (formData.telpon !== undefined)
      updateData.telpon = formData.telpon || null;
    if (formData.mulai !== undefined)
      updateData.mulai = new Date(formData.mulai);

    // PERBAIKAN: Cast string ke tipe Enum StatusProyek
    if (formData.status !== undefined)
      updateData.status = formData.status as StatusProyek;

    const [proyek] = await db
      .update(projeks)
      .set(updateData)
      .where(eq(projeks.id, id))
      .returning();

    revalidatePath("/admin/proyek");
    return { success: true, data: proyek };
  } catch (error) {
    console.error("Error updating proyek:", error);
    return { success: false, error: "Gagal mengupdate proyek" };
  }
}

export async function deleteProyek(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await db.delete(projeks).where(eq(projeks.id, id));
    revalidatePath("/admin/proyek");
    return { success: true };
  } catch (error) {
    console.error("Error deleting proyek:", error);
    return { success: false, error: "Gagal menghapus proyek" };
  }
}

// Fungsi untuk mendapatkan semua proyek dengan data user
export async function getAllProyeks() {
  try {
    console.log("🔄 Fetching all proyeks with user data...");

    const proyeksData = await db
      .select({
        id: projeks.id,
        nama: projeks.nama,
        tipeLayanan: projeks.tipeLayanan,
        pelangganId: projeks.pelangganId,
        mandorId: projeks.mandorId,
        gambar: projeks.gambar,
        status: projeks.status,
        progress: projeks.progress,
        alamat: projeks.alamat,
        deskripsi: projeks.deskripsi,
        telpon: projeks.telpon,
        mulai: projeks.mulai,
        lastUpdate: projeks.lastUpdate,
      })
      .from(projeks);

    // Ambil data user secara terpisah (Batching)
    const pelangganIds = proyeksData.map((p) => p.pelangganId).filter(Boolean);
    const mandorIds = proyeksData
      .map((p) => p.mandorId)
      .filter((id): id is string => Boolean(id));

    const allUserIds = Array.from(new Set([...pelangganIds, ...mandorIds]));

    let usersData: Array<{
      id: string;
      nama: string;
      username: string;
      email: string;
    }> = [];

    // PERBAIKAN LOGIKA FETCH USER
    if (allUserIds.length > 0) {
      usersData = await db
        .select({
          id: users.id,
          nama: users.nama,
          username: users.username,
          email: users.email,
        })
        .from(users)
        .where(inArray(users.id, allUserIds)); // Gunakan inArray untuk ambil banyak user sekaligus
    }

    // Format data dengan menggabungkan proyek dan user
    const formattedData = proyeksData.map((proyek) => {
      // Cari data pelanggan
      const pelanggan = usersData.find(
        (user) => user.id === proyek.pelangganId
      );
      const pelangganName =
        pelanggan?.nama ||
        pelanggan?.username ||
        pelanggan?.email ||
        "Pelanggan Tidak Diketahui";

      // Cari data mandor
      const mandor = proyek.mandorId
        ? usersData.find((user) => user.id === proyek.mandorId)
        : null;
      const mandorName = mandor
        ? mandor.nama ||
          mandor.username ||
          mandor.email ||
          "Mandor Tidak Diketahui"
        : undefined;

      return {
        id: proyek.id,
        nama: proyek.nama,
        tipeLayanan: proyek.tipeLayanan,
        pelangganId: proyek.pelangganId,
        pelanggan: pelangganName,
        mandorId: proyek.mandorId,
        mandor: mandorName,
        gambar:
          proyek.gambar && proyek.gambar.length > 0 ? proyek.gambar[0] : null, // Return first image URL
        status: proyek.status,
        progress: proyek.progress || 0,
        alamat: proyek.alamat,
        deskripsi: proyek.deskripsi,
        telpon: proyek.telpon,
        mulai:
          proyek.mulai instanceof Date
            ? proyek.mulai.toISOString()
            : new Date(proyek.mulai).toISOString(),
        lastUpdate:
          proyek.lastUpdate instanceof Date
            ? proyek.lastUpdate.toISOString()
            : new Date(proyek.lastUpdate || new Date()).toISOString(),
      };
    });

    return formattedData;
  } catch (error) {
    console.error("❌ Error fetching proyeks:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan data pelanggan
export async function getPelangganOptions() {
  try {
    const pelangganData = await db
      .select({
        id: users.id,
        nama: users.nama,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, "pelanggan"));

    const options = pelangganData.map((user) => ({
      value: user.id,
      label: user.nama || user.username || user.email,
    }));

    return options;
  } catch (error) {
    console.error("❌ Error fetching pelanggan:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan data mandor
export async function getMandorOptions() {
  try {
    const mandorData = await db
      .select({
        id: users.id,
        nama: users.nama,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, "mandor"));

    const options = [
      { value: "", label: "Belum ditentukan" },
      ...mandorData.map((user) => ({
        value: user.id,
        label: user.nama || user.username || user.email,
      })),
    ];

    return options;
  } catch (error) {
    console.error("❌ Error fetching mandor:", error);
    return [{ value: "", label: "Belum ditentukan" }];
  }
}
