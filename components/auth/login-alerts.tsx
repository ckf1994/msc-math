"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "Sign in failed. Please try again.",
  domain: "Please use your @msc.edu.hk school Google account.",
  profile: "Your account is not set up yet. Contact your school admin.",
};

export function LoginAlerts({ error }: { error?: string }) {
  const searchParams = useSearchParams();
  const errorCode = error || searchParams.get("error");

  if (!errorCode) return null;

  const message = ERROR_MESSAGES[errorCode] || "Something went wrong. Please try again.";

  return (
    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
      {message}
    </p>
  );
}
