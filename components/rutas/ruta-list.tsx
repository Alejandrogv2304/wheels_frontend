"use client";

import { Route as RouteIcon, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RutaResumen } from "@/lib/rutas";

interface RutaListProps {
  rutas: RutaResumen[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
}

export function RutaList({ rutas, loading, search, onSearchChange, onSelect }: RutaListProps) {
  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2"><RouteIcon /> Rutas guardadas</CardTitle>
        <Input className="sm:max-w-xs" placeholder="Buscar ruta..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">Cargando rutas...</div>
        ) : rutas.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
            {search ? "No hay rutas que coincidan con tu búsqueda." : "Aún no tienes rutas guardadas."}
          </div>
        ) : (
          <div className="divide-y">
            {rutas.map((ruta) => (
              <button key={ruta.id} type="button" onClick={() => onSelect(ruta.id)} className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors first:pt-0 last:pb-0 hover:bg-muted/50">
                <span className="min-w-0 truncate font-medium">{ruta.nombre}</span>
                <Star className={ruta.favorita ? "size-5 shrink-0 fill-primary text-primary" : "size-5 shrink-0 text-muted-foreground"} />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}