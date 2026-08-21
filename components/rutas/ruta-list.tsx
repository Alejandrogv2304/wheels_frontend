"use client";

import { Pencil, Route as RouteIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RutaResumen } from "@/lib/rutas";

interface RutaListProps {
  rutas: RutaResumen[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}

export function RutaList({ rutas, loading, search, onSearchChange, onSelect, onEdit }: RutaListProps) {
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
              <div key={ruta.id} className="flex w-full items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <button type="button" onClick={() => onSelect(ruta.id)} className="min-w-0 flex-1 truncate text-left font-medium hover:underline">
                  {ruta.nombre}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Star className={ruta.favorita ? "size-5 fill-primary text-primary" : "size-5 text-muted-foreground"} />
                  <Button type="button" variant="ghost" size="icon-sm" title="Editar ruta" aria-label={`Editar ${ruta.nombre}`} onClick={() => onEdit(ruta.id)}>
                    <Pencil />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}