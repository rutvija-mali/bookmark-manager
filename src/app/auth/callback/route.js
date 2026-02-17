import { supabase } from "@/supabase-client";
import { NextResponse } from "next/server";

export async function GET(request) {
    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase client not configured" },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        try {
            await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
            console.error("Error exchanging code for session:", error);
            const errorUrl = new URL('/', request.url);
            errorUrl.searchParams.set('error', 'auth_failed');
            return NextResponse.redirect(errorUrl);
        }
    }
    
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
}
