// ========================================
// FILE: app/api/projects/[id]/milestones/[milestoneId]/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import {
  updateMilestone,
  deleteMilestone,
} from "@/lib/actions/mandor/milestone";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DEFINISIKAN TIPE PARAMS SESUAI NAMA FOLDER [Milestonesid]
type Params = Promise<{ id: string; Milestonesid: string }>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "mandor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AWAIT PARAMS & SESUAIKAN NAMA
    const { Milestonesid } = await params;
    const body = await request.json();

    // Gunakan Milestonesid
    const result = await updateMilestone(Milestonesid, {
      nama: body.nama,
      deskripsi: body.deskripsi,
      tanggal: body.tanggal,
      status: body.status,
      gambar: body.gambar,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("API Error updating milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "mandor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AWAIT PARAMS
    const { Milestonesid } = await params;

    const result = await deleteMilestone(Milestonesid);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error("API Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
