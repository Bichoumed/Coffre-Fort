import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, label, uuid } = body;

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: "documentId is required" },
        { status: 400 }
      );
    }

    // 🔮 FAKE AI SUMMARY FOR NOW
    const summary = `
This is a placeholder AI summary for document "${label ?? "unknown"}" (ID: ${
      documentId
    }).
In the real version, this endpoint will:
- Download the document content from Mayan
- Extract the text
- Call a local AI model to generate a structured summary
- Return key points, entities, etc.
    `.trim();

    return NextResponse.json(
      { success: true, summary },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/ai/summary:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error in summary API" },
      { status: 500 }
    );
  }
}