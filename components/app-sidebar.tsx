"use client";

import { usePathname } from "next/navigation";
import { User, Home, Settings, LogOut } from "lucide-react";
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
    title: "Usuarios",
    url: "/usuarios",
    icon: User,
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
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
                  <SidebarMenuButton isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="my-2" />

        <p className="text-sm font-medium text-center">{user?.name}</p>

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
