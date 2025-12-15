// ========================================
// FILE: app/api/projects/[id]/milestones/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import {
  createMilestone,
  getMilestonesByProjectId,
} from "@/lib/actions/mandor/milestone";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "mandor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params
    const { id } = await params;
    const body = await request.json();

    const result = await createMilestone({
      proyekId: id, // Gunakan id yang sudah di-await
      nama: body.nama,
      deskripsi: body.deskripsi,
      tanggal: body.tanggal,
      status: body.status || "Belum Dimulai",
      gambar: body.gambar || [],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("API Error creating milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "mandor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params
    const { id } = await params;

    const result = await getMilestonesByProjectId(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("API Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
