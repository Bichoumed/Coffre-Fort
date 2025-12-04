import { NextRequest, NextResponse } from "next/server";
import { addRule, listRules, AccessRule } from "@/lib/accessStore";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: listRules(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, documentId, expiresAt, createdBy } = body;

    if (!username || !documentId) {
      return NextResponse.json(
        {
          success: false,
          message: "username and documentId are required",
        },
        { status: 400 }
      );
    }

    const rule = addRule({
      username,
      documentId: Number(documentId),
      expiresAt: expiresAt || null,
      createdBy: createdBy || "admin",
    });

    return NextResponse.json(
      { success: true, data: rule },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Error creating rule" },
      { status: 500 }
    );
  }
}
