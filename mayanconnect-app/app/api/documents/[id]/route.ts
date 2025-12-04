// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isAllowed } from "@/lib/accessStore";

const MAYAN_API_URL = process.env.NEXT_PUBLIC_MAYAN_API_URL;
const MAYAN_API_TOKEN = process.env.MAYAN_API_TOKEN;

export async function GET(request: NextRequest) {
  if (!MAYAN_API_URL || !MAYAN_API_TOKEN) {
    return NextResponse.json(
      { success: false, message: "Mayan API config missing." },
      { status: 500 }
    );
  }

  // 🔍 Extract id from the URL path: /api/documents/1 -> "1"
  const pathname = request.nextUrl.pathname; // e.g. "/api/documents/1"
  const segments = pathname.split("/").filter(Boolean);
  const idStr = segments[segments.length - 1]; // last segment
  const documentId = Number(idStr);

  if (!idStr || Number.isNaN(documentId)) {
    return NextResponse.json(
      { success: false, message: "Invalid document id." },
      { status: 400 }
    );
  }

  // 👤 username from header (later can come from session)
  const usernameHeader = request.headers.get("x-username");
  const username = usernameHeader || "anonymous";

  // 🔐 enforce access control
  if (!(await isAllowed(username, documentId))) {
    return NextResponse.json(
      {
        success: false,
        message: `User ${username} is not allowed to view document ${documentId}`,
      },
      { status: 403 }
    );
  }

  const mayanUrl = `${MAYAN_API_URL}/documents/${documentId}/?format=json`;

  try {
    const res = await fetch(mayanUrl, {
      headers: {
        Authorization: `Token ${MAYAN_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Mayan error ${res.status}: ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Network error contacting Mayan:", error);
    return NextResponse.json(
      { success: false, message: "Network error contacting Mayan." },
      { status: 500 }
    );
  }

  
}
