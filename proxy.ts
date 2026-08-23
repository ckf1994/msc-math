import { NextResponse, type NextRequest } from "next/server";
import { getRoleHome, isUserRole } from "@/lib/auth/roles";
import {
  hasSupabaseSessionCookie,
  updateSession,
} from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/auth/callback"];
const AUTH_ROUTES = ["/auth/signout"];

function isPublicRoute(pathname: string) {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    AUTH_ROUTES.includes(pathname) ||
    pathname.startsWith("/auth/")
  );
}

function getRolePrefix(pathname: string): "student" | "teacher" | "admin" | null {
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = getRolePrefix(pathname);
  const requireAuth =
    pathname === "/auth/callback" ||
    Boolean(requiredRole) ||
    hasSupabaseSessionCookie(request);

  const { supabase, supabaseResponse, user } = await updateSession(request, {
    requireAuth,
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return supabaseResponse;
  }

  if (!user) {
    if (requiredRole && !isPublicRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = isUserRole(profile?.role) ? profile.role : null;
    if (role) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleHome(role);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

