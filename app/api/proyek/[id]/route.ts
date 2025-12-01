// FILE: app/api/projects/[id]/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProjectProgress, updateProjectStatus } from '@/lib/actions/mandor/proyek'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getProjectById(params.id)
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === 'Unauthorized' ? 401 : 404 }
    )
  }

  return NextResponse.json({ data: result.data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  // Update progress
  if (body.progress !== undefined) {
    const result = await updateProjectProgress(params.id, body.progress)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: result.data })
  }

  // Update status
  if (body.status !== undefined) {
    const result = await updateProjectStatus(params.id, body.status)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: result.data })
  }

  return NextResponse.json(
    { error: 'No valid update data provided' },
    { status: 400 }
  )
}

