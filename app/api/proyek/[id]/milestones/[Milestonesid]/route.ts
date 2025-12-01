// ========================================
// FILE: app/api/projects/[id]/milestones/[milestoneId]/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server'
import { updateMilestone, deleteMilestone } from '@/lib/actions/mandor/milestone'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'mandor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const result = await updateMilestone(params.milestoneId, {
      nama: body.nama,
      deskripsi: body.deskripsi,
      tanggal: body.tanggal,
      status: body.status,
      gambar: body.gambar
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('API Error updating milestone:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'mandor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await deleteMilestone(params.milestoneId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('API Error deleting milestone:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}