"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/loader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading)
    return <Loader message="Redirigiendo..." color="blue" size="lg" />;
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex min-h-screen w-full flex-1 flex-col transition-all px-12 py-8">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
