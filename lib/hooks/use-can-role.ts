import { useAuth } from "@/context/AuthContext";
import { Action, Resource, hasPermission } from "@/types/Permissions";
import { Role } from "@/types/Roles";

export function useCan() {
  const { user } = useAuth();
  const role = user?.role ?? Role.USER;

  function can(resource: Resource, action: Action) {
    if (!user) return false;

    return hasPermission(role, resource, action);
  }

  return { can };
}
