// app/api/documents/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isAllowed } from "@/lib/accessStore";

const MAYAN_API_URL = process.env.NEXT_PUBLIC_MAYAN_API_URL;
const MAYAN_API_TOKEN = process.env.MAYAN_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!MAYAN_API_URL || !MAYAN_API_TOKEN) {
    return NextResponse.json(
      { success: false, message: "Mayan API config missing." },
      { status: 500 }
    );
  }

  // ✅ get id from params (Next passes it from [id] folder)
  const documentId = Number(params.id);

  if (Number.isNaN(documentId)) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid document id: ${params.id}`,
      },
      { status: 400 }
    );
  }

  // 👤 username from header
  const usernameHeader = request.headers.get("x-username");
  const username = usernameHeader || "anonymous";

  // 🔐 reuse same access control: if they can view, they can download
  if (!(await isAllowed(username, documentId))) {
    return NextResponse.json(
      {
        success: false,
        message: `User ${username} is not allowed to download document ${documentId}`,
      },
      { status: 403 }
    );
  }

  // 1️⃣ Get document details from Mayan
  const detailUrl = `${MAYAN_API_URL}/documents/${documentId}/?format=json`;

  try {
    const detailRes = await fetch(detailUrl, {
      headers: {
        Authorization: `Token ${MAYAN_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!detailRes.ok) {
      const txt = await detailRes.text();
      return NextResponse.json(
        {
          success: false,
          message: `Mayan error ${detailRes.status} while fetching document details: ${txt}`,
        },
        { status: 500 }
      );
    }

    const detailJson: any = await detailRes.json();

    // 🔗 Path to latest file's download URL
    const downloadPath = detailJson?.latest_file?.download_url;
    if (!downloadPath) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not find latest file download URL in Mayan response.",
        },
        { status: 404 }
      );
    }

    const downloadUrl = downloadPath.startsWith("http")
      ? downloadPath
      : `${MAYAN_API_URL}${downloadPath}`;

    // 2️⃣ Fetch the binary file from Mayan
    const fileRes = await fetch(downloadUrl, {
      headers: {
        Authorization: `Token ${MAYAN_API_TOKEN}`,
      },
    });

    if (!fileRes.ok || !fileRes.body) {
      const txt = await fileRes.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          message: `Mayan error ${fileRes.status} while downloading file: ${txt}`,
        },
        { status: 500 }
      );
    }

    const contentType =
      fileRes.headers.get("Content-Type") || "application/octet-stream";
    const disposition =
      fileRes.headers.get("Content-Disposition") ||
      `attachment; filename="document-${documentId}"`;

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    console.error("Error while downloading from Mayan:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Network error while downloading from Mayan.",
      },
      { status: 500 }
    );
  }
}
