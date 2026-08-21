import api from "./api";

export interface PuntoRuta {
  id?: string;
  nombre: string;
  direccion: string;
  latitud?: number | string;
  longitud?: number | string;
  orden: number;
}

export interface RutaResumen {
  id: string;
  nombre: string;
  favorita: boolean;
}

export interface Ruta extends RutaResumen {
  creadorId?: string;
  estado?: string;
  fechaEliminacion?: string | null;
  puntos: PuntoRuta[];
}

export interface CrearRutaPayload {
  nombre: string;
  favorita: boolean;
  puntos: PuntoRuta[];
}

export async function getRutas(): Promise<RutaResumen[]> {
  const response = await api.get("/rutas");
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
}

export async function getRuta(id: string): Promise<Ruta> {
  const response = await api.get(`/rutas/${id}`);
  return response.data?.data ?? response.data;
}

export async function createRuta(payload: CrearRutaPayload): Promise<Ruta> {
  const response = await api.post("/rutas", payload);
  return response.data?.data ?? response.data;
}

export async function updateRuta(id: string, payload: CrearRutaPayload): Promise<Ruta> {
  const response = await api.patch(`/rutas/${id}`, payload);
  return response.data?.data ?? response.data;
}
