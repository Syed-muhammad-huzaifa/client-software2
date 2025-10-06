// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const COOKIE = process.env.AUTH_COOKIE_NAME || "simple_session";
const VALUE = "simple-ok";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();           // ⬅️ await here
  const session = cookieStore.get(COOKIE)?.value;

  if (session !== VALUE) {
    redirect("/login?next=/dashboard");
  }

  return <>{children}</>;
}
