"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, MapPin, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getViajes, type Viaje } from "@/lib/viajes";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function Inicio() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [search, setSearch] = useState("");
  const [rutaId, setRutaId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadViajes() {
      try {
        setLoading(true);
        const response = await getViajes({ page: 1, limit: 50 });
        setViajes(response.viajes);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los viajes disponibles");
      } finally {
        setLoading(false);
      }
    }
    void Promise.resolve().then(loadViajes);
  }, []);

  const rutas = useMemo(() => Array.from(new Map(viajes.filter((viaje) => viaje.ruta).map((viaje) => [viaje.rutaId, viaje.ruta])).values()), [viajes]);
  const viajesFiltrados = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return viajes.filter((viaje) => (rutaId === "all" || viaje.rutaId === rutaId) && (!query || viaje.ruta?.nombre.toLocaleLowerCase().includes(query)));
  }, [viajes, rutaId, search]);

  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div><p className="text-sm font-medium text-primary">Encuentra tu próximo trayecto</p><h1 className="text-3xl font-semibold tracking-tight">Viajes disponibles</h1><p className="text-muted-foreground">Explora salidas publicadas por conductores de la comunidad.</p></div>
    <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_220px]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar por ruta..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><Select value={rutaId} onValueChange={(value) => setRutaId(value ?? "all")}><SelectTrigger className="w-full"><SelectValue placeholder="Todas las rutas" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las rutas</SelectItem>{rutas.map((ruta) => ruta && <SelectItem key={ruta.id} value={ruta.id}>{ruta.nombre}</SelectItem>)}</SelectContent></Select></CardContent></Card>
    {loading ? <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">Cargando viajes disponibles...</div> : viajesFiltrados.length === 0 ? <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">No hay viajes que coincidan con los filtros.</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2">{viajesFiltrados.map((viaje) => <Card key={viaje.id}><CardHeader><CardTitle className="flex items-start justify-between gap-3"><span>{viaje.ruta?.nombre ?? "Ruta sin nombre"}</span><span className="shrink-0 text-lg">${Number(viaje.precio).toLocaleString("es-CO")}</span></CardTitle></CardHeader><CardContent className="grid gap-3 text-sm text-muted-foreground"><p className="flex items-center gap-2"><CalendarClock className="size-4 text-primary" />{formatDate(viaje.fechaSalida)}</p><p className="flex items-center gap-2"><Users className="size-4 text-primary" />{viaje.cupos} cupos disponibles</p>{viaje.ruta?.puntos?.length ? <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{viaje.ruta.puntos[0].nombre} a {viaje.ruta.puntos[viaje.ruta.puntos.length - 1].nombre}</p> : null}{viaje.observaciones && <p className="border-t pt-3">{viaje.observaciones}</p>}</CardContent></Card>)}</div>}
  </div>;
}
