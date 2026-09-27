"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { useAuth } from "@/context/AuthContext";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";
import { Input } from "@/components/ui/input";
import {
  getViajes,
  reservarViaje,
  cancelarReserva,
  type Viaje,
  type ViajesMeta,
} from "@/lib/viajes";
import { Button } from "@/components/ui/button";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number | string) {
  return `$${Number(value).toLocaleString("es-CO")}`;
}

function formatDateTimeInput(value: Date) {
  const localValue = new Date(
    value.getTime() - value.getTimezoneOffset() * 60_000,
  );
  return localValue.toISOString().slice(0, 16);
}

function ViajeExpandedDetail({
  viaje,
  reservaId,
  reservando,
  onReserve,
  onCancel,
}: {
  viaje: Viaje;
  reservaId?: string;
  reservando: boolean;
  onReserve: () => void;
  onCancel: () => void;
}) {
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
      <div className="flex flex-wrap flex-col md:flex-row items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {reservaId
            ? "Tienes un cupo reservado en este viaje."
            : "Reserva un cupo para este viaje."}
        </p>
        {reservaId ? (
          <Button
            className="w-full"
            type="button"
            variant="destructive"
            onClick={onCancel}
            disabled={reservando}
          >
            {reservando ? "Cancelando..." : "Cancelar reserva"}
          </Button>
        ) : (
          <Button
            className="w-full"
            type="button"
            onClick={onReserve}
            disabled={reservando || viaje.cupos < 1}
          >
            {reservando ? "Reservando..." : "Reservar cupo"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Inicio() {
  const { user } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [meta, setMeta] = useState<ViajesMeta | null>(null);
  const [search, setSearch] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<Record<string, string>>({});
  const [reservaProcesando, setReservaProcesando] = useState<string | null>(
    null,
  );
  const [minimumFechaSalida, setMinimumFechaSalida] = useState("");

  useEffect(() => {
    const updateMinimum = () => {
      setMinimumFechaSalida(
        formatDateTimeInput(
          new Date(Math.ceil(Date.now() / 60_000) * 60_000),
        ),
      );
    };
    const initialUpdate = window.setTimeout(updateMinimum, 0);
    const interval = window.setInterval(updateMinimum, 30_000);

    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    async function loadViajes() {
      try {
        setLoading(true);
        const response = await getViajes({
          page: 1,
          limit: 50,
          fechaSalida: fechaSalida
            ? new Date(fechaSalida).toISOString()
            : undefined,
        });
        setViajes(response.viajes);
        setMeta(response.meta);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    void Promise.resolve().then(loadViajes);
  }, [fechaSalida]);

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
        !query || viaje.ruta?.nombre.toLocaleLowerCase().includes(query),
    );
  }, [viajes, search]);
  const cuposDisponibles = viajes.reduce(
    (total, viaje) => total + viaje.cupos,
    0,
  );
  const precioPromedio = viajes.length
    ? viajes.reduce((total, viaje) => total + Number(viaje.precio), 0) /
      viajes.length
    : 0;

  function getReservaId(viaje: Viaje) {
    return reservas[viaje.id] ?? viaje.reservaId ?? viaje.reserva?.id;
  }

  function handleFechaSalidaChange(value: string) {
    if (value && new Date(value).getTime() < Date.now()) {
      toast.error("Selecciona una fecha y hora a partir de ahora.");
      return;
    }
    setFechaSalida(value);
  }

  async function handleReserve(viajeId: string) {
    try {
      setReservaProcesando(viajeId);
      const reserva = await reservarViaje(viajeId);
      setReservas((current) => ({ ...current, [viajeId]: reserva.id }));
      setViajes((current) =>
        current.map((viaje) =>
          viaje.id === viajeId
            ? { ...viaje, cupos: Math.max(0, viaje.cupos - 1) }
            : viaje,
        ),
      );
      toast.success("Cupo reservado correctamente");
    } catch (error) {
      console.error(error);
    } finally {
      setReservaProcesando(null);
    }
  }

  async function handleCancel(viajeId: string, reservaId: string) {
    try {
      setReservaProcesando(viajeId);
      await cancelarReserva(reservaId);
      setReservas((current) => {
        return { ...current, [viajeId]: "" };
      });
      setViajes((current) =>
        current.map((viaje) =>
          viaje.id === viajeId ? { ...viaje, cupos: viaje.cupos + 1 } : viaje,
        ),
      );
      toast.success("Reserva cancelada correctamente");
    } catch (error) {
      console.error(error);
    } finally {
      setReservaProcesando(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {user?.foto ? (
            <Image
              src={user.foto}
              alt={`Foto de ${user.nombre}`}
              width={48}
              height={48}
              unoptimized
              className="size-12 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {(user?.nombre || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-primary">
              Panel de movilidad
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Hola, {user?.nombre || "viajero"}
            </h1>
            <p className="text-muted-foreground">
              Consulta salidas de la comunidad y encuentra un trayecto
              conveniente.
            </p>
          </div>
        </div>
        <ProfileEditDialog />
      </div>
      <div className="grid grid-cols-4 divide-x rounded-lg border bg-card">
        {[
          ["Viajes", meta?.total ?? viajes.length],
          ["Cupos", cuposDisponibles],
          ["Rutas", rutas.length],
          ["Precio medio", formatPrice(precioPromedio)],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 px-1.5 py-2 text-center sm:px-3">
            <p className="truncate text-[10px] leading-4 text-muted-foreground sm:text-xs">
              {label}
            </p>
            <p className="truncate text-sm font-semibold sm:text-lg">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid gap-1">
          <label
            htmlFor="buscarRuta"
            className="text-xs font-medium text-muted-foreground"
          >
            Buscar ruta
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
            <Input
              id="buscarRuta"
              type="search"
              className="pl-9"
              placeholder="Nombre de la ruta..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-1">
          <label
            htmlFor="fechaSalida"
            className="text-xs font-medium text-muted-foreground"
          >
            Fecha y hora de salida
          </label>
          <Input
            id="fechaSalida"
            type="datetime-local"
            min={minimumFechaSalida}
            step={60}
            value={fechaSalida}
            onChange={(event) => handleFechaSalidaChange(event.target.value)}
          />
        </div>
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
              <ViajeExpandedDetail
                viaje={viaje}
                reservaId={getReservaId(viaje)}
                reservando={reservaProcesando === viaje.id}
                onReserve={() => void handleReserve(viaje.id)}
                onCancel={() => {
                  const reservaId = getReservaId(viaje);
                  if (reservaId) void handleCancel(viaje.id, reservaId);
                }}
              />
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
