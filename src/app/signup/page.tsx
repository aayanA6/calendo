"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react"; // ← add this import

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/calendar` },
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
          <p className="text-gray-300">We've sent a confirmation link. Check your inbox (and spam).</p>
          <Button onClick={() => router.push("/calendar")} className="mt-4 bg-indigo-600 hover:bg-indigo-500">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-400 underline hover:text-indigo-300">
              Sign in
            </a>
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          {error && <div className="rounded-lg border border-red-800/50 bg-red-950/50 p-4 text-sm text-red-300">{error}</div>}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="border-gray-700 bg-gray-800 pr-10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
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
              <p className="mt-1.5 text-xs text-gray-500">Minimum 6 characters</p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 font-medium text-white hover:bg-indigo-500">
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
