// FILE: lib/actions/milestone.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { milestones, projeks, type NewMilestone } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateProgress } from '@/lib/utils'

export async function createMilestone(data: NewMilestone) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'mandor') {
      throw new Error('Unauthorized')
    }

    const [milestone] = await db.insert(milestones).values(data).returning()

    // Update project progress
    await updateProjectProgress(data.proyekId)

    revalidatePath(`/mandor/proyek/${data.proyekId}`)
    return { success: true, data: milestone }
  } catch (error) {
    console.error('Error creating milestone:', error)
    return { success: false, error: 'Gagal membuat milestone' }
  }
}

export async function updateMilestone(id: string, data: Partial<NewMilestone>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'mandor') {
      throw new Error('Unauthorized')
    }

    const [milestone] = await db
      .update(milestones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(milestones.id, id))
      .returning()

    // Update project progress
    if (milestone) {
      await updateProjectProgress(milestone.proyekId)
    }

    revalidatePath(`/mandor/proyek`)
    return { success: true, data: milestone }
  } catch (error) {
    console.error('Error updating milestone:', error)
    return { success: false, error: 'Gagal mengupdate milestone' }
  }
}

export async function deleteMilestone(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'mandor') {
      throw new Error('Unauthorized')
    }

    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    })

    if (milestone) {
      await db.delete(milestones).where(eq(milestones.id, id))
      await updateProjectProgress(milestone.proyekId)
    }

    revalidatePath(`/mandor/proyek`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return { success: false, error: 'Gagal menghapus milestone' }
  }
}

async function updateProjectProgress(proyekId: string) {
  const projectMilestones = await db.query.milestones.findMany({
    where: eq(milestones.proyekId, proyekId),
  })

  const progress = calculateProgress(projectMilestones)

  await db
    .update(projeks)
    .set({
      progress,
      lastUpdate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projeks.id, proyekId))
}