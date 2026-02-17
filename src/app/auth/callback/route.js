import { NextResponse } from "next/server";

// Supabase already completes the OAuth flow and sets the session.
// This route just forwards the user back into the app.
export async function GET(request) {
  const redirectUrl = new URL("/dashboard", request.url);
  return NextResponse.redirect(redirectUrl);
}
