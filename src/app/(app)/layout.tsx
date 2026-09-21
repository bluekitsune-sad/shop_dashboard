import { Toaster } from "@/components/ui/sonner";
import { LoginForm } from "@/components/login-form";
import { SiteNav } from "@/components/site-nav";
import { hasValidSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await hasValidSession();

  if (!authenticated) {
    return (
      <>
        <LoginForm />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-dvh">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-10">{children}</main>
      <Toaster position="top-center" />
    </div>
  );
}