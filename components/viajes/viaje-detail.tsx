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
              <div className="grid gap-3">
                <p className="text-sm font-medium">Trayecto</p>
                {[...viaje.ruta.puntos]
                  .sort((a, b) => a.orden - b.orden)
                  .map((punto, index, puntos) => {
                    const isEnd = index === puntos.length - 1;
                    const isMiddle = index > 0 && !isEnd;
                    return (
                    <p
                      key={punto.id ?? punto.orden}
                      className="relative flex gap-3 pb-2 last:pb-0"
                    >
                      {!isEnd && (
                        <span
                          aria-hidden="true"
                          className="absolute left-3 top-7 bottom-0 border-l-2 border-dotted border-muted-foreground/40"
                        />
                      )}
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isMiddle ? "border border-primary bg-background text-primary" : "bg-primary text-primary-foreground"}`}
                      >
                        {isEnd ? "L" : index === 0 ? "S" : punto.orden}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">
                          {index === 0
                            ? "Salida: "
                            : isEnd
                              ? "Llegada: "
                              : "Punto: "}
                          {punto.nombre}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="size-3" />
                          {punto.direccion}
                        </span>
                      </span>
                    </p>
                    );
                  })}
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
