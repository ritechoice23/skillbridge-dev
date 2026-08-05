import { requireUser } from "@/lib/auth/dal";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Mentor workspace
        </h1>
        <p className="text-muted-foreground">
          Manage your profile and respond to mentorship requests.
        </p>
      </div>
      {children}
    </div>
  );
}
