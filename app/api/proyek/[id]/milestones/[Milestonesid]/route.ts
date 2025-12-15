// ========================================
// FILE: app/api/projects/[id]/milestones/[Milestonesid]/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import {
  updateMilestone,
  deleteMilestone,
} from "@/lib/actions/mandor/milestone";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. Definisikan tipe Params agar sesuai dengan NAMA FOLDER [Milestonesid]
//    Perhatikan huruf besar 'M' pada 'Milestonesid' dan tipe Promise
type Params = Promise<{ id: string; Milestonesid: string }>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Params } // Gunakan tipe Params yang benar
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "mandor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await params terlebih dahulu untuk mengambil Milestonesid
    const { Milestonesid } = await params;

    const body = await request.json();

    // 3. Gunakan variabel Milestonesid (sesuai nama folder)
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

    return NextResponse.json({ data: result });
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
  { params }: { params: Params } // Gunakan tipe Params yang benar
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "mandor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await params terlebih dahulu
    const { Milestonesid } = await params;

    // 3. Gunakan variabel Milestonesid
    const result = await deleteMilestone(Milestonesid);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: result });
  } catch (error) {
    console.error("API Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
