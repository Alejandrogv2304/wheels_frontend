"use client";

import { usePathname } from "next/navigation";
import { Car, Road, Route, Home, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";

type SidebarItem = {
  title: string;
  url: string;
  icon: React.ComponentType;
};

// Config declarativa
const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Inicio",
    url: "/inicio",
    icon: Home,
  },
  {
    title: "Rutas",
    url: "/rutas",
    icon: Route,
  },
  {
    title: "Viajes",
    url: "/viajes",
    icon: Road,
  },
  {
    title: "Vehiculos",
    url: "/vehiculos",
    icon: Car,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const handleLogout = () => {
    logout(true);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Wheels UIS</SidebarGroupLabel>

          <Separator className="my-2" />

          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {SIDEBAR_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(`${item.url}/`)
                    }
                    className="data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="my-2" />

        <ProfileEditDialog
          trigger={
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-3 border-0 bg-transparent px-2 py-2 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
            >
              {user?.foto ? (
                <Image
                  src={user.foto}
                  alt={`Foto de ${user.nombre}`}
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground ring-1 ring-border">
                  {(user?.nombre || "U").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">
                  {user?.nombre || "Mi perfil"}
                </span>
              </span>
            </Button>
          }
        />

        <Button onClick={handleLogout} variant="destructive">
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          © {currentYear} GuatauvaTech.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
