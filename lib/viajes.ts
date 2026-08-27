import api from "./api";
import type { Ruta } from "./rutas";
import type { Vehiculo } from "./vehiculos";

export interface Viaje {
  id: string;
  conductorId: string;
  vehiculoId: string;
  rutaId: string;
  precio: number | string;
  cupos: number;
  fechaSalida: string;
  observaciones?: string | null;
  estado: string;
  fechaCreacion: string;
  ruta?: Ruta;
  vehiculo?: Pick<Vehiculo, "id" | "marca" | "referencia" | "tipo">;
  reservaId?: string | null;
  reserva?: { id: string; estado?: string } | null;
}

export interface Reserva {
  id: string;
  viajeId: string;
  estado?: string;
}

export interface CrearViajePayload {
  vehiculoId: string;
  rutaId: string;
  precio: number;
  cupos: number;
  fechaSalida: string;
  observaciones?: string;
}

export interface ViajesMeta {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
}

export interface ViajesResponse {
  viajes: Viaje[];
  meta: ViajesMeta;
}

export async function createViaje(payload: CrearViajePayload): Promise<Viaje> {
  const response = await api.post("/viajes", payload);
  return response.data?.data ?? response.data;
}

export async function getViajesConductor(conductorId: string): Promise<Viaje[]> {
  const response = await api.get(`/viajes/conductor/${conductorId}`);
  const data = response.data?.data ?? response.data;
  return Array.isArray(data) ? data : data?.viajes ?? [];
}

export async function getViaje(id: string): Promise<Viaje> {
  const response = await api.get(`/viajes/${id}`);
  return response.data?.data ?? response.data;
}

export async function reservarViaje(viajeId: string): Promise<Reserva> {
  const response = await api.post("/reservas", { viajeId });
  return response.data?.data ?? response.data;
}

export async function cancelarReserva(reservaId: string): Promise<void> {
  await api.patch(`/reservas/${reservaId}/cancelar`);
}

export async function getViajes(params?: {
  page?: number;
  limit?: number;
  rutaId?: string;
  fecha?: string;
}): Promise<ViajesResponse> {
  const response = await api.get("/viajes", { params });
  const data = response.data?.data ?? response.data;
  return {
    viajes: Array.isArray(data) ? data : data?.viajes ?? [],
    meta: data?.meta ?? { page: 1, limit: 10, skip: 0, total: 0, totalPages: 1 },
  };
}
