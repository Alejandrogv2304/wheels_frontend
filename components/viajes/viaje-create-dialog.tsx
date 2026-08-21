"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getRutas, type RutaResumen } from "@/lib/rutas";
import { getVehiculos, type Vehiculo } from "@/lib/vehiculos";
import { createViaje } from "@/lib/viajes";

interface ViajeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function ViajeCreateDialog({ open, onOpenChange, onCreated }: ViajeCreateDialogProps) {
  const [rutas, setRutas] = useState<RutaResumen[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [rutaId, setRutaId] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [precio, setPrecio] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedVehicle = vehiculos.find(
    (vehiculo) => String(vehiculo.id) === vehiculoId,
  );
  const calculatedCupos = selectedVehicle
    ? Math.max(0, Number(selectedVehicle.capacidad ?? 0) - 1)
    : null;

  function getNextFullHour() {
    const nextHour = new Date();
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);
    const year = nextHour.getFullYear();
    const month = String(nextHour.getMonth() + 1).padStart(2, "0");
    const day = String(nextHour.getDate()).padStart(2, "0");
    const hour = String(nextHour.getHours()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:00`;
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [rutasResponse, vehiculosResponse] = await Promise.all([
          getRutas(),
          getVehiculos(),
        ]);
        if (cancelled) return;
        const vehicles = Array.isArray(vehiculosResponse)
          ? vehiculosResponse
          : vehiculosResponse?.data ?? [];
        setRutas(rutasResponse);
        setVehiculos(vehicles);
        setFechaSalida(getNextFullHour());
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar rutas y vehículos");
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }
    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function resetForm() {
    setRutaId("");
    setVehiculoId("");
    setPrecio("");
    setFechaSalida("");
    setObservaciones("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rutaId || !vehiculoId || !precio || !calculatedCupos || !fechaSalida) {
      toast.error("Completa todos los datos obligatorios del viaje");
      return;
    }

    try {
      setSaving(true);
      await createViaje({
        rutaId,
        vehiculoId,
        precio: Number(precio),
        cupos: calculatedCupos,
        fechaSalida: new Date(fechaSalida).toISOString(),
        observaciones: observaciones.trim() || undefined,
      });
      toast.success("Viaje creado correctamente");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear el viaje");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger render={<Button />}>
        <Plus /> Nuevo viaje
      </AlertDialogTrigger>
      <AlertDialogContent size="default" className="max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Nuevo viaje</AlertDialogTitle>
          <AlertDialogDescription>
            Publica una instancia de una de tus rutas con sus cupos y horario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="viaje-ruta">Ruta</Label>
            <Select value={rutaId} onValueChange={(value) => setRutaId(value ?? "")} disabled={loadingOptions}>
              <SelectTrigger id="viaje-ruta" className="w-full"><SelectValue placeholder="Selecciona una ruta" /></SelectTrigger>
              <SelectContent>
                {rutas.map((ruta) => <SelectItem key={ruta.id} value={ruta.id}>{ruta.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="viaje-vehiculo">Vehículo</Label>
            <Select value={vehiculoId} onValueChange={(value) => setVehiculoId(value ?? "")} disabled={loadingOptions}>
              <SelectTrigger id="viaje-vehiculo" className="w-full"><SelectValue placeholder="Selecciona un vehículo" /></SelectTrigger>
              <SelectContent>
                {vehiculos.map((vehiculo) => <SelectItem key={String(vehiculo.id)} value={String(vehiculo.id)}>{vehiculo.marca} {vehiculo.referencia} {vehiculo.placa ? `- ${vehiculo.placa}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="viaje-precio">Precio por cupo</Label><Input id="viaje-precio" type="number" min="0" step="1" value={precio} onChange={(event) => setPrecio(event.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="viaje-cupos">Cupos disponibles</Label><Input id="viaje-cupos" type="number" min="1" step="1" value={calculatedCupos ?? ""} readOnly required /><p className="text-xs text-muted-foreground">Capacidad del vehículo menos el asiento del conductor.</p></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="viaje-fecha">Fecha y hora de salida</Label><Input id="viaje-fecha" type="datetime-local" value={fechaSalida} onChange={(event) => setFechaSalida(event.target.value)} required /></div>
          <div className="grid gap-2"><Label htmlFor="viaje-observaciones">Observaciones</Label><Textarea id="viaje-observaciones" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} placeholder="Punto de encuentro, equipaje..." /></div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={saving || loadingOptions}>{saving ? "Creando..." : "Crear viaje"}</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
