"use client";

import { CalendarClock, Car, Road as RoadIcon, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Viaje } from "@/lib/viajes";

interface ViajeListProps {
  viajes: Viaje[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ViajeList({ viajes, loading, search, onSearchChange, onSelect }: ViajeListProps) {
  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2"><RoadIcon /> Mis viajes</CardTitle>
        <Input className="sm:max-w-xs" placeholder="Buscar por ruta..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">Cargando viajes...</div> : viajes.length === 0 ? <div className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">{search ? "No hay viajes que coincidan con tu búsqueda." : "Aún no has publicado viajes."}</div> : (
          <div className="divide-y">
            {viajes.map((viaje) => <button type="button" key={viaje.id} onClick={() => onSelect(viaje.id)} className="grid w-full gap-3 py-4 text-left first:pt-0 hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <span className="min-w-0"><span className="block truncate font-medium">{viaje.ruta?.nombre ?? "Ruta sin nombre"}</span><span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1"><CalendarClock className="size-3" />{formatDate(viaje.fechaSalida)}</span><span className="flex items-center gap-1"><Users className="size-3" />{viaje.cupos} cupos</span>{viaje.vehiculo && <span className="flex items-center gap-1"><Car className="size-3" />{viaje.vehiculo.marca} {viaje.vehiculo.referencia}</span>}</span></span>
              <span className="font-semibold">${Number(viaje.precio).toLocaleString("es-CO")}</span>
            </button>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
