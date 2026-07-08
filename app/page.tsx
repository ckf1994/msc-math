import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Calculator, GraduationCap } from "lucide-react";
import { getProfile } from "@/lib/auth/get-profile";
import { getRoleHome } from "@/lib/auth/roles";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginForm } from "@/components/auth/login-form";
import LoadingQuote from "@/components/auth/loading-quote";
import { LoginAlerts } from "@/components/auth/login-alerts";

type HomePageProps = {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const profile = await getProfile();
  const params = await searchParams;

  if (profile) {
    redirect(params.redirect || getRoleHome(profile.role));
  }

  return (
    <div className="flex min-h-full flex-col bg-[linear-gradient(160deg,#fafafa_0%,#fff8e6_45%,#fff5f5_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <section className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-msc-red/15 bg-white px-4 py-1.5 text-sm font-medium text-msc-red shadow-sm">
              <GraduationCap className="h-4 w-4" />
              Munsang College · F.1–F.6
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-msc-ink sm:text-5xl">
                <span className="text-msc-red">MSC</span> Math
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-msc-muted">
                Practice smarter, track your progress, and build confidence —
                one question at a time.
              </p>
            </div>
            <div className="hidden lg:block">
              <LoadingQuote />
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-msc-muted lg:justify-start">
              <Calculator className="h-4 w-4 text-msc-yellow-dark" />
              HKDSE-aligned · Gamified learning · Growth mindset
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-msc-red/5 backdrop-blur sm:p-8">
              <div className="mb-6 space-y-1 text-center">
                <h2 className="text-xl font-semibold text-msc-ink">Welcome back</h2>
                <p className="text-sm text-msc-muted">
                  Sign in to continue your math journey
                </p>
              </div>

              <Suspense fallback={null}>
                <LoginAlerts error={params.error} />
              </Suspense>

              <div className="space-y-6">
                <GoogleSignInButton />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400">
                      Test accounts
                    </span>
                  </div>
                </div>

                <Suspense fallback={null}>
                  <LoginForm redirectTo={params.redirect} />
                </Suspense>
              </div>
            </div>

            <div className="mt-6 lg:hidden">
              <LoadingQuote />
            </div>
          </section>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-msc-muted">
        © {new Date().getFullYear()} MSC Math · Munsang College
      </footer>
    </div>
  );
}
