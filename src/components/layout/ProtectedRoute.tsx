"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login"); // redirect immediately
      } else {
        setSession(session);
      }

      setChecked(true); // we finished checking
    };

    checkUser();
  }, [router]);

  // nothing renders until we’ve checked the session
  if (!checked) return null;

  return <>{children}</>;
}
