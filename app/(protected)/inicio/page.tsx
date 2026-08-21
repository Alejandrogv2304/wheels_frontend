"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CalendarClock,
  CarFront,
  ChevronDown,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getViaje,
  getViajes,
  type Viaje,
  type ViajesMeta,
} from "@/lib/viajes";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number | string) {
  return `$${Number(value).toLocaleString("es-CO")}`;
}

function ViajeExpandedDetail({ viaje }: { viaje: Viaje }) {
  const puntos = [...(viaje.ruta?.puntos ?? [])].sort(
    (a, b) => a.orden - b.orden,
  );
  const VehicleIcon = viaje?.vehiculo?.tipo.toLowerCase().includes("moto")
    ? Bike
    : CarFront;

  return (
    <div className="grid gap-5 border-t px-4 py-5 sm:px-6">
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <p className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="size-4 text-primary" />
          {formatDate(viaje.fechaSalida)}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 text-primary" />
          {viaje.cupos} cupos disponibles
        </p>
        {viaje.vehiculo && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <VehicleIcon className="size-4 text-primary" />
            {viaje.vehiculo.marca} {viaje.vehiculo.referencia} - (
            {viaje.vehiculo.tipo})
          </p>
        )}
      </div>

      {puntos.length > 0 && (
        <div className="grid gap-3">
          <p className="text-sm font-medium">Trayecto</p>
          <ol className="flex flex-col gap-3">
            {puntos.map((punto, index) => {
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
      {viaje.observaciones && (
        <p className="border-t pt-3 text-sm text-muted-foreground">
          {viaje.observaciones}
        </p>
      )}
    </div>
  );
}

export default function Inicio() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [meta, setMeta] = useState<ViajesMeta | null>(null);
  const [search, setSearch] = useState("");
  const [rutaId, setRutaId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [detalles, setDetalles] = useState<Record<string, Viaje>>({});
  const [detalleCargando, setDetalleCargando] = useState<string | null>(null);

  useEffect(() => {
    async function loadViajes() {
      try {
        setLoading(true);
        const response = await getViajes({ page: 1, limit: 50 });
        setViajes(response.viajes);
        setMeta(response.meta);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los viajes disponibles");
      } finally {
        setLoading(false);
      }
    }
    void Promise.resolve().then(loadViajes);
  }, []);

  const rutas = useMemo(
    () =>
      Array.from(
        new Map(
          viajes
            .filter((viaje) => viaje.ruta)
            .map((viaje) => [viaje.rutaId, viaje.ruta]),
        ).values(),
      ),
    [viajes],
  );
  const viajesFiltrados = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return viajes.filter(
      (viaje) =>
        (rutaId === "all" || viaje.rutaId === rutaId) &&
        (!query || viaje.ruta?.nombre.toLocaleLowerCase().includes(query)),
    );
  }, [viajes, rutaId, search]);
  const cuposDisponibles = viajes.reduce(
    (total, viaje) => total + viaje.cupos,
    0,
  );
  const precioPromedio = viajes.length
    ? viajes.reduce((total, viaje) => total + Number(viaje.precio), 0) /
      viajes.length
    : 0;

  async function handleViajeToggle(id: string, open: boolean) {
    if (!open || detalles[id]) return;

    try {
      setDetalleCargando(id);
      const detalle = await getViaje(id);
      setDetalles((current) => ({ ...current, [id]: detalle }));
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el trayecto del viaje");
    } finally {
      setDetalleCargando(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Panel de movilidad</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Viajes disponibles
        </h1>
        <p className="text-muted-foreground">
          Consulta salidas de la comunidad y encuentra un trayecto conveniente.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            "Viajes activos",
            meta?.total ?? viajes.length,
            "salidas publicadas",
          ],
          ["Cupos disponibles", cuposDisponibles, "asientos para compartir"],
          ["Rutas activas", rutas.length, "trayectos diferentes"],
          ["Precio promedio", formatPrice(precioPromedio), "por cupo"],
        ].map(([label, value, description]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por ruta..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          value={rutaId}
          onValueChange={(value) => setRutaId(value ?? "all")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las rutas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las rutas</SelectItem>
            {rutas.map(
              (ruta) =>
                ruta && (
                  <SelectItem key={ruta.id} value={ruta.id}>
                    {ruta.nombre}
                  </SelectItem>
                ),
            )}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          Cargando viajes disponibles...
        </div>
      ) : viajesFiltrados.length === 0 ? (
        <div className="border-y py-16 text-center text-sm text-muted-foreground">
          No hay viajes que coincidan con los filtros.
        </div>
      ) : (
        <div className="grid gap-3">
          {viajesFiltrados.map((viaje) => (
            <details
              key={viaje.id}
              className="group border-y bg-background"
              onToggle={(event) =>
                void handleViajeToggle(viaje.id, event.currentTarget.open)
              }
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-5 sm:px-6">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {viaje.ruta?.nombre ?? "Ruta sin nombre"}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {formatDate(viaje.fechaSalida)} · {viaje.cupos} cupos
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 font-semibold">
                  {formatPrice(viaje.precio)}
                  <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
                </span>
              </summary>
              {detalleCargando === viaje.id && !detalles[viaje.id] ? (
                <div className="border-t px-4 py-5 text-sm text-muted-foreground sm:px-6">
                  Cargando puntos del trayecto...
                </div>
              ) : (
                <ViajeExpandedDetail viaje={detalles[viaje.id] ?? viaje} />
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
