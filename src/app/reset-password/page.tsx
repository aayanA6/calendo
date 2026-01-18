// app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Verify we're in recovery mode
  useEffect(() => {
    const checkRecovery = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token && session.user?.aud === "authenticated") {
        // Recovery flow successful → user is now "logged in" temporarily
        setReady(true);
      } else {
        setError("This reset link is invalid or has expired. Please request a new one.");
      }
    };

    checkRecovery();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2500);
    }

    setLoading(false);
  };

  if (!ready && !error && !success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Verifying reset link...</div>
      </div>
    );
  }

  if (error && !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900/80 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-400">Invalid Link</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <Button onClick={() => router.push("/forgot-password")} className="bg-indigo-600 hover:bg-indigo-500">
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900/80 p-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-green-400">Password Updated</h2>
          <p className="text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Set new password</h2>
          <p className="mt-2 text-sm text-gray-400">Choose a strong password</p>
        </div>

        <form onSubmit={handleReset} className="mt-8 space-y-6">
          {error && <div className="rounded-lg border border-red-800/50 bg-red-950/50 p-4 text-sm text-red-300">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">New Password</label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="border-gray-700 bg-gray-800 pr-10 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative mt-1">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-700 bg-gray-800 pr-10 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  disabled={loading}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white hover:bg-indigo-500">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
