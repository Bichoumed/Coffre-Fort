import { NextRequest, NextResponse } from "next/server";
import { deleteRule } from "@/lib/accessStore";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const ok = deleteRule(id);
  if (!ok) {
    return NextResponse.json(
      { success: false, message: "Rule not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
