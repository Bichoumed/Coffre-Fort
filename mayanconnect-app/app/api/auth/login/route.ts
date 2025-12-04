import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  // Basic validation
  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: "Username and password are required." },
      { status: 400 }
    );
  }

  // ⚠️ TEMPORARY: accept any non-empty credentials
  // Later we will replace this with a real user check + tokens.
  const fakeUser = {
    username,
    role: username === "admin" ? "admin" : "user",
  };

  return NextResponse.json(
    {
      success: true,
      user: fakeUser,
      // Simple fake token for now
      token: `fake-token-${username}`,
    },
    { status: 200 }
  );
}
