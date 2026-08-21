/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVehiculo, getCatalogo, postCatalogo } from "@/lib/vehiculos";
import { Plus } from "lucide-react";

interface VehiculoCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const colores = [
  "Rojo",
  "Azul",
  "Negro",
  "Blanco",
  "Gris",
  "Verde",
  "Amarillo",
];

export function VehiculoCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: VehiculoCreateDialogProps) {
  const [tipo, setTipo] = useState<string | null>(null);
  const [marca, setMarca] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [placa, setPlaca] = useState("");
  const [color, setColor] = useState("");
  const [capacidad, setCapacidad] = useState<number | undefined>(undefined);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [referencias, setReferencias] = useState<string[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleTipoChange(value: string) {
    setTipo(value);
    setMarca(null);
    setReferencia(null);
    setMarcas([]);
    setReferencias([]);
    setCatalogo([]);
    setCapacidad(value === "moto" ? 2 : 5);

    try {
      setLoadingCatalogo(true);
      const response = await getCatalogo({ tipo: value });
      const data = Array.isArray(response) ? response : response.data || [];
      setCatalogo(data);
      setMarcas(
        Array.from(new Set(data.map((item: any) => String(item.marca)))).filter(
          Boolean,
        ) as string[],
      );
    } catch (error) {
      console.error(error);
      toast.error("Error obteniendo catálogo");
    } finally {
      setLoadingCatalogo(false);
    }
  }

  function handleMarcaChange(value: string) {
    setMarca(value);
    setReferencia(null);
    setReferencias(
      Array.from(
        new Set(
          catalogo
            .filter((item) => item.marca === value)
            .map((item) => item.referencia),
        ),
      ),
    );
  }

  function resetForm() {
    setTipo(null);
    setMarca(null);
    setReferencia(null);
    setPlaca("");
    setColor("");
    setCapacidad(undefined);
    setCatalogo([]);
    setMarcas([]);
    setReferencias([]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tipo || !marca || !referencia || !placa || placa.trim().length !== 6) {
      toast.error(
        "Completa tipo, marca, referencia y una placa de 6 caracteres",
      );
      return;
    }

    try {
      setSaving(true);
      const exists = catalogo.some(
        (item) =>
          item.marca === marca &&
          item.referencia === referencia &&
          item.tipo === tipo,
      );
      if (!exists) await postCatalogo({ marca, referencia, tipo });
      await createVehiculo({
        marca,
        referencia,
        placa: placa.trim(),
        tipo,
        color,
        capacidad,
      });
      toast.success("Vehículo creado correctamente");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Error creando vehículo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger render={<Button />}>
        <Plus /> Nuevo vehículo
      </AlertDialogTrigger>
      <AlertDialogContent
        size="default"
        className="max-h-[90vh] overflow-y-auto"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Nuevo vehículo</AlertDialogTitle>
          <AlertDialogDescription>
            Completa los datos para agregar tu vehículo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Tipo</label>
            <Select
              value={tipo ?? ""}
              onValueChange={(value: any) => handleTipoChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Marca</label>
            <Select
              value={marca ?? ""}
              onValueChange={(value: any) => handleMarcaChange(value)}
              disabled={!tipo || loadingCatalogo}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Referencia</label>
            <Select
              value={referencia ?? ""}
              onValueChange={(value: any) => setReferencia(value)}
              disabled={!marca}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {referencias.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Placa</label>
            <Input
              value={placa}
              maxLength={6}
              onChange={(event) => setPlaca(event.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Color</label>
            <Select
              value={color}
              onValueChange={(value: any) => setColor(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colores.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Capacidad</label>
            <Input
              type="number"
              value={capacidad ?? ""}
              onChange={(event) =>
                setCapacidad(Number(event.target.value) || undefined)
              }
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Crear vehículo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
