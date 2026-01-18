// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-800 bg-gray-900/80 p-8 text-center shadow-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-green-400">Check your email</h2>
          <p className="text-gray-300">If an account exists with that email, you’ll receive a password reset link shortly.</p>
          <p className="mt-4 text-sm text-gray-500">Check spam/junk folder if you don't see it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset password</h2>
          <p className="mt-2 text-sm text-gray-400">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleReset} className="mt-8 space-y-6">
          {error && <div className="rounded-lg border border-red-800/50 bg-red-950/50 p-4 text-sm text-red-300">{error}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 font-medium text-white hover:bg-indigo-500">
            {loading ? "Sending reset link..." : "Send reset link"}
          </Button>

          <p className="mt-4 text-center text-sm text-gray-500">
            <a href="/login" className="text-indigo-400 hover:text-indigo-300">
              Back to sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
