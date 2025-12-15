// FILE: lib/actions/mandor/pengeluaran.ts
// ========================================
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks, bahanHarians, milestones, notaBelanjas } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Get Expenses (Bahan Harians) by Project ID
 * Only returns expenses if project belongs to the logged-in mandor
 */
export async function getExpensesByProjectId(projectId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: []
      }
    }

    const mandorId = session.user.id

    // Check if project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, projectId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized',
        data: []
      }
    }

    // Get expenses with milestone info
    const expenses = await db.query.bahanHarians.findMany({
      where: eq(bahanHarians.proyekId, projectId),
      orderBy: [desc(bahanHarians.createdAt)],
      with: {
        milestone: {
          columns: {
            id: true,
            nama: true
          }
        }
      }
    })

    return {
      success: true,
      data: expenses
    }
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return {
      success: false,
      error: 'Failed to fetch expenses',
      data: []
    }
  }
}

/**
 * Get Expenses Summary by Project ID
 * Returns total expenses grouped by status
 */
export async function getExpensesSummary(projectId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: null
      }
    }

    const mandorId = session.user.id

    // Check if project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, projectId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized',
        data: null
      }
    }

    // Get total by status
    const [totalAll, totalUsed, totalRemaining, totalDamaged] = await Promise.all([
      db.select({ 
        total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`,
        count: sql<number>`COUNT(*)`
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, projectId)),

      db.select({ 
        total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`,
        count: sql<number>`COUNT(*)`
      })
      .from(bahanHarians)
      .where(and(
        eq(bahanHarians.proyekId, projectId),
        eq(bahanHarians.status, 'Digunakan')
      )),

      db.select({ 
        total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`,
        count: sql<number>`COUNT(*)`
      })
      .from(bahanHarians)
      .where(and(
        eq(bahanHarians.proyekId, projectId),
        eq(bahanHarians.status, 'Sisa')
      )),

      db.select({ 
        total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`,
        count: sql<number>`COUNT(*)`
      })
      .from(bahanHarians)
      .where(and(
        eq(bahanHarians.proyekId, projectId),
        eq(bahanHarians.status, 'Rusak')
      ))
    ])

    return {
      success: true,
      data: {
        total: {
          amount: Number(totalAll[0].total || 0),
          count: Number(totalAll[0].count || 0)
        },
        used: {
          amount: Number(totalUsed[0].total || 0),
          count: Number(totalUsed[0].count || 0)
        },
        remaining: {
          amount: Number(totalRemaining[0].total || 0),
          count: Number(totalRemaining[0].count || 0)
        },
        damaged: {
          amount: Number(totalDamaged[0].total || 0),
          count: Number(totalDamaged[0].count || 0)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching expenses summary:', error)
    return {
      success: false,
      error: 'Failed to fetch expenses summary',
      data: null
    }
  }
}

/**
 * Create Expense (Bahan Harian)
 * Creates a new expense entry with optional receipt photo
 */
export async function createExpense(data: {
  proyekId: string
  milestoneId?: string
  nama: string
  deskripsi?: string
  harga: number
  kuantitas: number
  satuan: string
  status: 'Digunakan' | 'Sisa' | 'Rusak'
  tanggal: string
  gambar?: string[]
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Check if project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, data.proyekId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized'
      }
    }

    // If milestoneId provided, verify it belongs to the project
    if (data.milestoneId) {
      const milestone = await db.query.milestones.findFirst({
        where: and(
          eq(milestones.id, data.milestoneId),
          eq(milestones.proyekId, data.proyekId)
        )
      })

      if (!milestone) {
        return {
          success: false,
          error: 'Milestone not found or does not belong to this project'
        }
      }
    }

    // Validate input
    if (data.harga < 0) {
      return {
        success: false,
        error: 'Price cannot be negative'
      }
    }

    if (data.kuantitas <= 0) {
      return {
        success: false,
        error: 'Quantity must be greater than 0'
      }
    }

    // FIX: Create a Nota automatically first because notaId is required
    const [newNota] = await db.insert(notaBelanjas)
      .values({
        proyekId: data.proyekId,
        createdBy: mandorId,
        tanggalBelanja: new Date(data.tanggal),
        namaToko: 'Pengeluaran Langsung',
        // Use first image as nota image or a placeholder if none
        fotoNotaUrl: data.gambar?.[0] || 'https://placehold.co/400x600?text=No+Receipt',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    // Create expense linked to the new Nota
    const [newExpense] = await db.insert(bahanHarians)
      .values({
        proyekId: data.proyekId,
        notaId: newNota.id, // Link to the created nota
        milestoneId: data.milestoneId || null,
        nama: data.nama,
        deskripsi: data.deskripsi || '',
        harga: data.harga.toString(), // Convert to string for decimal
        kuantitas: data.kuantitas.toString(), // Convert to string for decimal
        satuan: data.satuan as any, // Cast to any to bypass strict Enum check if needed
        status: data.status as any, // Cast to any to bypass strict Enum check if needed
        gambar: data.gambar || [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, data.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${data.proyekId}`)

    return {
      success: true,
      data: newExpense
    }
  } catch (error) {
    console.error('Error creating expense:', error)
    return {
      success: false,
      error: 'Failed to create expense'
    }
  }
}

/**
 * Update Expense
 * Updates expense details
 */
export async function updateExpense(
  expenseId: string,
  data: {
    nama?: string
    deskripsi?: string
    harga?: number
    kuantitas?: number
    satuan?: string
    status?: 'Digunakan' | 'Sisa' | 'Rusak'
    tanggal?: string
    milestoneId?: string | null
    gambar?: string[]
  }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Get expense with project check
    const expense = await db.query.bahanHarians.findFirst({
      where: eq(bahanHarians.id, expenseId),
      with: {
        projek: true
      }
    })

    if (!expense) {
      return {
        success: false,
        error: 'Expense not found'
      }
    }

    // Check if project belongs to mandor
    if (expense.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Validate input
    if (data.harga !== undefined && data.harga < 0) {
      return {
        success: false,
        error: 'Price cannot be negative'
      }
    }

    if (data.kuantitas !== undefined && data.kuantitas <= 0) {
      return {
        success: false,
        error: 'Quantity must be greater than 0'
      }
    }

    // If milestoneId provided, verify it belongs to the project
    if (data.milestoneId) {
      const milestone = await db.query.milestones.findFirst({
        where: and(
          eq(milestones.id, data.milestoneId),
          eq(milestones.proyekId, expense.proyekId)
        )
      })

      if (!milestone) {
        return {
          success: false,
          error: 'Milestone not found or does not belong to this project'
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.nama !== undefined) updateData.nama = data.nama
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi
    // Fix: Convert number to string for decimal columns
    if (data.harga !== undefined) updateData.harga = data.harga.toString()
    if (data.kuantitas !== undefined) updateData.kuantitas = data.kuantitas.toString()
    if (data.satuan !== undefined) updateData.satuan = data.satuan as any
    if (data.status !== undefined) updateData.status = data.status as any
    // Note: 'tanggal' is likely in notaBelanja, not bahanHarian, but if bahan has it...
    // Schema says bahanHarian doesn't have 'tanggal', it relies on Nota. 
    // If you need to update date, you update the parent Nota.
    // However, if your schema DOES have createdAt/updatedAt or custom date field, use it.
    // Assuming we update the Nota date if needed:
    if (data.tanggal !== undefined) {
        // Optional: Update parent Nota date
        await db.update(notaBelanjas)
            .set({ tanggalBelanja: new Date(data.tanggal) })
            .where(eq(notaBelanjas.id, expense.notaId))
    }

    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId
    if (data.gambar !== undefined) updateData.gambar = data.gambar

    // Update expense
    const updated = await db.update(bahanHarians)
      .set(updateData)
      .where(eq(bahanHarians.id, expenseId))
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, expense.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${expense.proyekId}`)

    return {
      success: true,
      data: updated[0]
    }
  } catch (error) {
    console.error('Error updating expense:', error)
    return {
      success: false,
      error: 'Failed to update expense'
    }
  }
}

/**
 * Delete Expense
 * Deletes an expense entry
 */
export async function deleteExpense(expenseId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Get expense with project check
    const expense = await db.query.bahanHarians.findFirst({
      where: eq(bahanHarians.id, expenseId),
      with: {
        projek: true
      }
    })

    if (!expense) {
      return {
        success: false,
        error: 'Expense not found'
      }
    }

    // Check if project belongs to mandor
    if (expense.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Delete expense
    await db.delete(bahanHarians)
      .where(eq(bahanHarians.id, expenseId))

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, expense.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${expense.proyekId}`)

    return {
      success: true,
      message: 'Expense deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return {
      success: false,
      error: 'Failed to delete expense'
    }
  }
}

/**
 * Get Expenses by Milestone
 * Get all expenses related to a specific milestone
 */
export async function getExpensesByMilestoneId(projectId: string, milestoneId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: []
      }
    }

    const mandorId = session.user.id

    // Check if project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, projectId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized',
        data: []
      }
    }

    // Get expenses
    const expenses = await db.query.bahanHarians.findMany({
      where: and(
        eq(bahanHarians.proyekId, projectId),
        eq(bahanHarians.milestoneId, milestoneId)
      ),
      orderBy: [desc(bahanHarians.createdAt)]
    })

    return {
      success: true,
      data: expenses
    }
  } catch (error) {
    console.error('Error fetching expenses by milestone:', error)
    return {
      success: false,
      error: 'Failed to fetch expenses',
      data: []
    }
  }
}