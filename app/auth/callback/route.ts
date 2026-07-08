import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRoleHome, isUserRole } from "@/lib/auth/roles";

const ALLOWED_DOMAIN = "msc.edu.hk";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?error=domain`);
  }

  const emailDomain = user.email.split("@")[1]?.toLowerCase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_test_account")
    .eq("id", user.id)
    .single();

  const isTestAccount = profile?.is_test_account === true;

  if (!isTestAccount && emailDomain !== ALLOWED_DOMAIN) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?error=domain`);
  }

  if (!isUserRole(profile?.role)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?error=profile`);
  }

  return NextResponse.redirect(`${origin}${next === "/" ? getRoleHome(profile.role) : next}`);
}
