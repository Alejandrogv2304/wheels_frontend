import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/Roles";
import type { Servicio } from "@/types/Servicio";

type ServiceStatus = Servicio["estado"];

// Mapeo de permisos por rol y estado actual
// Basado en matriz de estados y roles permitidos
const ROLE_STATUS_PERMISSIONS: Record<
  Role,
  (currentStatus?: ServiceStatus) => ServiceStatus[]
> = {
  // Directores Generales: pueden revisar asignación y cambiar informes
  [Role.DIRECTOR_GENERAL]: (currentStatus) => {
    const allowed: ServiceStatus[] = [
      "Revision para asignacion",
      "Informe para revision",
    ];
    // Solo puede cambiar SI el estado actual está en su lista permitida
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  [Role.DIRECTOR_TECNICO_FARMA]: (currentStatus) => {
    const allowed: ServiceStatus[] = [
      "En preparacion",
      "Revision para asignacion",
      "Informe para revision",
      "Enviado",
    ];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  [Role.DIRECTOR_TECNICO_INDUSTRIAL]: (currentStatus) => {
    const allowed: ServiceStatus[] = [
      "En preparacion",
      "Revision para asignacion",
      "Informe para revision",
      "Enviado",
    ];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  // Coordinador Administrativo: prepara envío de informes
  [Role.COORDINADOR_ADMINISTRATIVO]: (currentStatus) => {
    const allowed: ServiceStatus[] = ["Informe para enviar"];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  // Auxiliar Administrativo: asignación y preparación inicial
  [Role.AUXILIAR_ADMINISTRATIVO]: (currentStatus) => {
    const allowed: ServiceStatus[] = [
      "Revision para asignacion",
      "En preparacion",
    ];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  // Profesionales Analistas (Farma e Industrial): todo el flujo de análisis
  [Role.PROFESIONAL_ANALISTA_FARMA]: (currentStatus) => {
    const allowed: ServiceStatus[] = [
      "En preparacion",
      "En registro de datos",
      "En analisis",
      "Elaboracion del informe",
      "Informe para revision",
    ];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  [Role.PROFESIONAL_ANALISTA_INDUSTRIAL]: (currentStatus) => {
    const allowed: ServiceStatus[] = [
      "En preparacion",
      "En registro de datos",
      "En analisis",
      "Elaboracion del informe",
      "Informe para revision",
    ];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  // Técnicos: preparación y registro de datos
  [Role.TECNICO]: (currentStatus) => {
    const allowed: ServiceStatus[] = ["En preparacion", "En registro de datos"];
    if (!currentStatus || !allowed.includes(currentStatus)) return [];
    return allowed.filter((s) => s !== currentStatus);
  },

  [Role.USER]: () => [],
};

export function useCanChangeStatus() {
  const { user } = useAuth();
  const role = user?.role ?? Role.USER;

  /**
   * Determina si el usuario puede cambiar el estado
   * @param currentStatus Estado actual de la orden
   * @returns true si el usuario puede cambiar el estado
   */
  function canChangeStatus(currentStatus?: ServiceStatus): boolean {
    if (!user) return false;
    const allowedStates = getAllowedNextStates(currentStatus);
    return allowedStates.length > 0;
  }

  /**
   * Obtiene los estados permitidos a los que puede cambiar el usuario
   * @param currentStatus Estado actual
   * @returns Array de estados permitidos
   */
  function getAllowedNextStates(
    currentStatus?: ServiceStatus,
  ): ServiceStatus[] {
    const permissionFn = ROLE_STATUS_PERMISSIONS[role];
    if (!permissionFn) return [];
    return permissionFn(currentStatus);
  }

  return { canChangeStatus, getAllowedNextStates };
}

export type { ServiceStatus };
