"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/loader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [loading, isAuthenticated, router]);

  if (loading)
    return <Loader message="Redirigiendo..." color="blue" size="lg" />;

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex min-h-screen w-full flex-1 flex-col transition-all px-2 md:px-6 py-6">
        <header className="flex items-center justify-between w-full gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile large trigger + logo */}
            <div className="md:hidden">
              <SidebarTrigger size="icon-lg" className="!h-10 !w-10" />
            </div>

            <Link href="/inicio" className="text-lg font-bold">
              Wheels
            </Link>
          </div>

          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
        </header>

        {children}
      </main>
    </SidebarProvider>
  );
}
