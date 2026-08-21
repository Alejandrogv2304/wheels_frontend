"use client";

import { CalendarClock, Car, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Viaje } from "@/lib/viajes";

interface ViajeDetailProps {
  viaje: Viaje | null;
  loading: boolean;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ViajeDetail({ viaje, loading }: ViajeDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{viaje && !loading && viaje.ruta?.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        {!viaje ? (
          <p className="text-sm text-muted-foreground">
            Selecciona un viaje para consultar sus detalles.
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Cargando detalle...</p>
        ) : (
          <div className="grid gap-4">
            <div>
              <p className="text-sm capitalize text-muted-foreground">
                {viaje.estado}
              </p>
            </div>
            <div className="grid gap-3 text-sm">
              <p className="flex items-center gap-2">
                <CalendarClock className="size-4 text-primary" />
                {formatDate(viaje.fechaSalida)}
              </p>
              <p className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                {viaje.cupos} cupos disponibles
              </p>
              {viaje.vehiculo && (
                <p className="flex items-center gap-2">
                  <Car className="size-4 text-primary" />
                  {viaje.vehiculo.marca} {viaje.vehiculo.referencia} (
                  {viaje.vehiculo.tipo})
                </p>
              )}
            </div>
            {viaje.ruta?.puntos?.length ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Trayecto</p>
                {[...viaje.ruta.puntos]
                  .sort((a, b) => a.orden - b.orden)
                  .map((punto) => (
                    <p
                      key={punto.id ?? punto.orden}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      {punto.nombre} · {punto.direccion}
                    </p>
                  ))}
              </div>
            ) : null}
            {viaje.observaciones && (
              <p className="border-t pt-3 text-sm text-muted-foreground">
                {viaje.observaciones}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
