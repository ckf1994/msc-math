import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
  );
}

type UpdateSessionOptions = {
  /** When false, skip the remote getUser() call if there is no session cookie. */
  requireAuth?: boolean;
};

export async function updateSession(
  request: NextRequest,
  options: UpdateSessionOptions = {},
) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const requireAuth = options.requireAuth ?? true;
  if (!requireAuth && !hasSupabaseSessionCookie(request)) {
    return { supabase, supabaseResponse, user: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, supabaseResponse, user };
}
