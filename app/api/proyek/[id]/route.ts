// FILE: app/api/proyek/[id]/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import {
  getProjectById,
  updateProjectProgress,
  updateProjectStatus,
} from "@/lib/actions/mandor/proyek";

// 1. Definisikan tipe Params sebagai Promise
type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params } // Gunakan tipe Params (Promise)
) {
  // 2. Await params terlebih dahulu
  const { id } = await params;

  // 3. Gunakan id yang sudah di-await
  const result = await getProjectById(id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Unauthorized" ? 401 : 404 }
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params } // Gunakan tipe Params (Promise)
) {
  // 2. Await params terlebih dahulu
  const { id } = await params;

  const body = await request.json();

  // Update progress
  if (body.progress !== undefined) {
    // Gunakan id yang sudah di-await
    const result = await updateProjectProgress(id, body.progress);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  }

  // Update status
  if (body.status !== undefined) {
    // Gunakan id yang sudah di-await
    const result = await updateProjectStatus(id, body.status);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  }

  return NextResponse.json(
    { error: "No valid update data provided" },
    { status: 400 }
  );
}
