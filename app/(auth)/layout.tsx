import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/dal";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return <div className="flex flex-1 items-center justify-center p-4">{children}</div>;
}
