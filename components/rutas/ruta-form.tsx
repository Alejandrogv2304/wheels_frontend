"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createRuta, PuntoRuta, Ruta, updateRuta } from "@/lib/rutas";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface RutaFormProps {
  onCreated: () => void;
  onCancel: () => void;
  footer?: ReactNode;
  ruta?: Ruta | null;
}

const emptyPoint = (orden: number): PuntoRuta => ({
  nombre: "",
  direccion: "",
  orden,
});

export function RutaForm({ onCreated, onCancel, footer, ruta }: RutaFormProps) {
  // Estado local del formulario
  const [nombre, setNombre] = useState(ruta?.nombre ?? "");
  const [favorita, setFavorita] = useState(ruta?.favorita ?? false);
  const [puntos, setPuntos] = useState<PuntoRuta[]>(
    ruta?.puntos?.length ? ruta.puntos : [emptyPoint(1), emptyPoint(2)],
  );
  const [saving, setSaving] = useState(false);

  // Patrón oficial de React para ajustar estado cuando cambia una prop (evita useEffect y renders en cascada)
  const [prevRuta, setPrevRuta] = useState(ruta);
  if (ruta !== prevRuta) {
    setPrevRuta(ruta);
    setNombre(ruta?.nombre ?? "");
    setFavorita(ruta?.favorita ?? false);
    setPuntos(
      ruta?.puntos?.length ? ruta.puntos : [emptyPoint(1), emptyPoint(2)],
    );
  }

  const updatePoint = (
    index: number,
    field: keyof PuntoRuta,
    value: string,
  ) => {
    setPuntos((current) =>
      current.map((point, pointIndex) => {
        if (pointIndex !== index) return point;
        return { ...point, [field]: value };
      }),
    );
  };

  const addPoint = () =>
    setPuntos((current) => [...current, emptyPoint(current.length + 1)]);

  const removePoint = (index: number) => {
    if (puntos.length <= 2) return;
    setPuntos((current) =>
      current
        .filter((_, pointIndex) => pointIndex !== index)
        .map((point, pointIndex) => ({ ...point, orden: pointIndex + 1 })),
    );
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !nombre.trim() ||
      puntos.some((point) => !point.nombre.trim() || !point.direccion.trim())
    ) {
      toast.error("Completa el nombre y los datos de cada punto");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre: nombre.trim(),
        favorita,
        puntos: puntos.map((point, index) => ({
          ...(point.id ? { id: point.id } : {}),
          nombre: point.nombre.trim(),
          direccion: point.direccion.trim(),
          latitud: point.latitud ?? undefined,
          longitud: point.longitud ?? undefined,
          orden: index + 1,
        })),
      };

      if (ruta?.id) {
        await updateRuta(ruta.id, payload);
        toast.success("Ruta actualizada correctamente");
      } else {
        await createRuta(payload);
        toast.success("Ruta creada correctamente");
      }
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la ruta");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="ruta-nombre" className="text-sm font-medium">
          Nombre de la ruta
        </label>
        <Input
          id="ruta-nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Bucaramanga - UIS"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={favorita}
          onCheckedChange={(checked) => setFavorita(checked === true)}
        />
        Marcar como favorita
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div>
            <h3 className="font-medium">Puntos de la ruta</h3>
            <p className="text-sm text-muted-foreground">
              Se enviarán en el orden mostrado.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={addPoint}
          >
            <Plus /> Añadir punto
          </Button>
        </div>

        {puntos.map((point, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
          >
            <div className="flex items-center justify-between sm:col-span-2">
              <span className="text-sm font-medium">
                {index === 0
                  ? "Salida"
                  : index === puntos.length - 1
                    ? "Llegada"
                    : `Punto intermedio ${index}`}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removePoint(index)}
                disabled={puntos.length <= 2}
                aria-label={`Eliminar punto ${index + 1}`}
              >
                <Trash2 />
              </Button>
            </div>
            <Input
              placeholder="Nombre"
              value={point.nombre}
              onChange={(event) =>
                updatePoint(index, "nombre", event.target.value)
              }
              required
            />
            <Input
              placeholder="Dirección"
              value={point.direccion}
              onChange={(event) =>
                updatePoint(index, "direccion", event.target.value)
              }
              required
            />
          </div>
        ))}
      </div>

      {footer ?? (
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Crear ruta"}
          </Button>
        </div>
      )}
    </form>
  );
}