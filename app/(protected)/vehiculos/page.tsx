/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import {
  getCatalogo,
  getVehiculos,
  createVehiculo,
  postCatalogo,
} from "@/lib/vehiculos";
import { toast } from "sonner";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

  // Form state
  const [tipo, setTipo] = useState<string | null>(null);
  const [marca, setMarca] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [placa, setPlaca] = useState("");
  const [color, setColor] = useState("");
  const [capacidad, setCapacidad] = useState<number | undefined>(undefined);

  // Catalogo cache for current tipo
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [referencias, setReferencias] = useState<string[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadVehiculos();
  }, []);

  async function loadVehiculos() {
    try {
      setLoadingVehiculos(true);
      const res = await getVehiculos();
      // assume res is array or { data: [] }
      const data = Array.isArray(res) ? res : res.data || [];
      setVehiculos(data);
    } catch (e) {
      console.error(e);
      toast.error("Error obteniendo vehículos");
    } finally {
      setLoadingVehiculos(false);
    }
  }

  async function handleTipoChange(value: string) {
    setTipo(value);
    setMarca(null);
    setReferencia(null);
    setMarcas([]);
    setReferencias([]);
    setCatalogo([]);
    if (value == "moto") {
      setCapacidad(2);
    } else {
      setCapacidad(5);
    }
    try {
      setLoadingCatalogo(true);
      const res = await getCatalogo({ tipo: value });
      const data = Array.isArray(res) ? res : res.data || [];
      setCatalogo(data);
      const marcasUnicas = Array.from(
        new Set(data.map((i: any) => String(i.marca))),
      ).filter(Boolean) as string[];
      setMarcas(marcasUnicas);
    } catch (e) {
      console.error(e);
      toast.error("Error obteniendo catálogo");
    } finally {
      setLoadingCatalogo(false);
    }
  }

  function handleMarcaChange(value: string) {
    setMarca(value);
    setReferencia(null);
    const refs = catalogo
      .filter((c) => c.marca === value)
      .map((c) => c.referencia);
    setReferencias(Array.from(new Set(refs)));
  }

  async function handleCreateVehiculo(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo || !marca || !referencia || !placa) {
      toast.error("Completa tipo, marca, referencia y placa");
      return;
    }

    if (placa.trim().length !== 6) {
      toast.error("La placa debe tener 6 caracteres");
      return;
    }

    try {
      // Ensure catalog item exists (if backend needs it)
      let found = catalogo.find(
        (c) =>
          c.marca === marca && c.referencia === referencia && c.tipo === tipo,
      );
      if (!found) {
        // Create in catalog
        const created = await postCatalogo({ marca, referencia, tipo });
        found = Array.isArray(created) ? created[0] : created;
        toast.success("Elemento agregado al catálogo");
        // refresh catalog list for type
        handleTipoChange(tipo);
      }

      const payload = {
        marca,
        referencia,
        placa,
        tipo,
        color,
        capacidad,
      };

      await createVehiculo(payload);
      toast.success("Vehículo creado correctamente");
      // reset form
      setPlaca("");
      setColor("");
      setCapacidad(undefined);
      setTipo(null);
      setMarca(null);
      setReferencia(null);
      setDialogOpen(false);
      // refresh list
      loadVehiculos();
    } catch (err) {
      console.error(err);
      toast.error("Error creando vehículo");
    }
  }

  const columns = useMemo(
    () => [
      { key: "marca", header: "Marca", sortable: true },
      { key: "referencia", header: "Referencia" },
      { key: "placa", header: "Placa" },
      { key: "tipo", header: "Tipo" },
      { key: "color", header: "Color" },
      { key: "capacidad", header: "Capacidad" },
    ],
    [],
  );

  const colores = [
    "Rojo",
    "Azul",
    "Negro",
    "Blanco",
    "Gris",
    "Verde",
    "Amarillo",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis Vehículos</h1>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger>Agregar vehículo</AlertDialogTrigger>

          <AlertDialogContent size="default">
            <AlertDialogHeader>
              <AlertDialogTitle>Agregar vehículo</AlertDialogTitle>
              <AlertDialogDescription>
                Completa los datos para agregar tu vehiculo.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form
              onSubmit={handleCreateVehiculo}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="text-sm text-muted-foreground">Tipo</label>
                <Select
                  value={tipo ?? ""}
                  onValueChange={(v: any) => handleTipoChange(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automovil">Automóvil</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Marca</label>
                <Select
                  value={marca ?? ""}
                  onValueChange={(v: any) => handleMarcaChange(v)}
                  disabled={!tipo}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marcas.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Referencia
                </label>
                <Select
                  value={referencia ?? ""}
                  onValueChange={(v: any) => setReferencia(v)}
                  disabled={!marca}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {referencias.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Placa</label>
                <Input
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Color</label>
                <Select
                  value={color ?? ""}
                  onValueChange={(v: any) => setColor(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colores.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Capacidad
                </label>
                <Input
                  type="number"
                  value={capacidad ?? ""}
                  onChange={(e) =>
                    setCapacidad(Number(e.target.value) || undefined)
                  }
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Crear vehículo</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardContent>
          <DataTable
            data={vehiculos}
            columns={columns}
            searchable
            loading={loadingVehiculos}
            emptyMessage="No tienes vehículos aún"
          />
        </CardContent>
      </Card>
    </div>
  );
}
