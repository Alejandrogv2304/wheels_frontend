"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruta } from "@/lib/rutas";

interface RutaDetailProps {
  ruta: Ruta | null;
  loading: boolean;
}

export function RutaDetail({ ruta, loading }: RutaDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ruta && !loading && ruta.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        {!ruta ? (
          <p className="text-sm text-muted-foreground">
            Selecciona una ruta para consultar sus puntos.
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Cargando detalle...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm capitalize text-muted-foreground">
                {ruta.estado ?? "activa"}
              </p>
            </div>
            <ol className="flex flex-col gap-3">
              {[...ruta.puntos]
                .sort((a, b) => a.orden - b.orden)
                .map((punto, index, puntos) => {
                  const isEnd = index === puntos.length - 1;
                  const isMiddle = index > 0 && !isEnd;
                  return (
                    <li
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
                    </li>
                  );
                })}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
