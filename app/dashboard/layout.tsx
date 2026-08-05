import { requireUser } from "@/lib/auth/dal";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  await requireUser();
  return children;
}
