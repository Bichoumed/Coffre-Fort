import { NextRequest, NextResponse } from "next/server";

const MAYAN_API_URL = process.env.NEXT_PUBLIC_MAYAN_API_URL;
const MAYAN_API_TOKEN = process.env.MAYAN_API_TOKEN;

export async function GET(_request: NextRequest) {
  if (!MAYAN_API_URL || !MAYAN_API_TOKEN) {
    return NextResponse.json(
      { success: false, message: "Mayan API config is missing." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${MAYAN_API_URL}/documents/`, {
      headers: {
        Authorization: `Token ${MAYAN_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Mayan API error:", res.status, text);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch documents from Mayan.",
          status: res.status,
        },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calling Mayan API:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error calling Mayan API." },
      { status: 500 }
    );
  }
}
