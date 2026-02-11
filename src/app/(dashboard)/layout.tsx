import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
