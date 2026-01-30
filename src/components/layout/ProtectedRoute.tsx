"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [status, router]);

  // nothing renders until we’ve checked the session
  if (!checked) return null;

  return <>{children}</>;
}
