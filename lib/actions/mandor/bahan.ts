// FILE: lib/actions/mandor/bahan.ts
'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth'
import { bahanHarians, milestones } from '@/lib/db/schema';
import { eq, and, desc, sum, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';

// Get bahan masuk by proyek
export async function getBahanMasukByProyek(proyekId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const bahan = await db
      .select({
        id: bahanHarians.id,
        nama: bahanHarians.nama,
        deskripsi: bahanHarians.deskripsi,
        status: bahanHarians.status,
        harga: bahanHarians.harga,
        kuantitas: bahanHarians.kuantitas,
        satuan: bahanHarians.satuan,
        tanggal: bahanHarians.tanggal,
        gambar: bahanHarians.gambar,
        milestoneId: bahanHarians.milestoneId,
        milestoneNama: milestones.nama
      })
      .from(bahanHarians)
      .leftJoin(milestones, eq(bahanHarians.milestoneId, milestones.id))
      .where(eq(bahanHarians.proyekId, proyekId))
      .orderBy(desc(bahanHarians.tanggal));
    
    return { success: true, data: bahan };
  } catch (error) {
    console.error('Error fetching bahan masuk:', error);
    return { success: false, error: 'Gagal memuat data bahan' };
  }
}

// Create new bahan masuk
export async function createBahanMasuk(data: {
  proyekId: string;
  milestoneId?: string;
  nama: string;
  deskripsi?: string;
  gambar?: string[];
  harga: number;
  kuantitas: number;
  satuan: string;
  tanggal: Date;
  status: 'Digunakan' | 'Sisa' | 'Rusak';
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const [newBahan] = await db
      .insert(bahanHarians)
      .values({
        ...data,
        harga: Number(data.harga),
        kuantitas: Number(data.kuantitas)
      })
      .returning();
    
    revalidatePath(`/mandor/proyek/${data.proyekId}`);
    return { success: true, data: newBahan };
  } catch (error: any) {
    console.error('Error creating bahan masuk:', error);
    return { 
      success: false, 
      error: error.message || 'Gagal menambahkan bahan masuk' 
    };
  }
}

// Get total bahan cost for proyek
export async function getTotalBahanCost(proyekId: string) {
  try {
    const result = await db
      .select({ 
        total: sum(sql`${bahanHarians.harga} * ${bahanHarians.kuantitas}`) 
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId));
    
    return Number(result[0]?.total) || 0;
  } catch (error) {
    console.error('Error calculating total bahan cost:', error);
    return 0;
  }
}

// Get bahan summary statistics
export async function getBahanSummary(proyekId: string) {
  try {
    const [totalCost, totalItems, byStatus] = await Promise.all([
      db.select({ total: sum(sql`${bahanHarians.harga} * ${bahanHarians.kuantitas}`) })
        .from(bahanHarians)
        .where(eq(bahanHarians.proyekId, proyekId)),
      
      db.select({ total: sql<number>`COUNT(*)` })
        .from(bahanHarians)
        .where(eq(bahanHarians.proyekId, proyekId)),
      
      db.select({
        status: bahanHarians.status,
        count: sql<number>`COUNT(*)`,
        total: sum(sql`${bahanHarians.harga} * ${bahanHarians.kuantitas}`)
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId))
      .groupBy(bahanHarians.status)
    ]);
    
    return {
      totalCost: Number(totalCost[0]?.total) || 0,
      totalItems: Number(totalItems[0]?.total) || 0,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: Number(item.count),
        total: Number(item.total) || 0
      }))
    };
  } catch (error) {
    console.error('Error getting bahan summary:', error);
    return { totalCost: 0, totalItems: 0, byStatus: [] };
  }
}