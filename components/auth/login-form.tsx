"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getRoleHome, isUserRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email.trim(),
        password,
      },
    );

    if (signInError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !isUserRole(profile?.role)) {
      setError("Your account is not set up yet. Contact your school admin.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push(redirectTo || getRoleHome(profile.role));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Test account email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="student@test.msc.edu.hk"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in with password"
        )}
      </Button>
      <p className="text-center text-xs text-gray-500">
        For development and testing only. Students normally use School Google.
      </p>
    </form>
  );
}
