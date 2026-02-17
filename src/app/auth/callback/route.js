import { supabase } from "@/supabase-client";
import { NextResponse } from "next/server";

// This route handles the OAuth callback from Supabase after the user
// completes the Google sign-in flow. It exchanges the `code` for a
// session and then redirects the user into the app (dashboard).
export async function GET(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // If there is no `code` we simply bounce the user back to the home page
  // with an error flag in the query string.
  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=missing_code", request.url)
    );
  }

  try {
    await supabase.auth.exchangeCodeForSession(code);

    // When the session is successfully created, send the user to the
    // bookmarks dashboard.
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error exchanging code for session:", error);

    // On failure, redirect back to the login page and let the UI
    // show an appropriate error message.
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(errorUrl);
  }
}
