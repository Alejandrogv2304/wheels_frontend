"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getRuta, getRutas, Ruta, RutaResumen } from "@/lib/rutas";
import { RutaCreateDialog } from "@/components/rutas/ruta-create-dialog";
import { RutaDetail } from "@/components/rutas/ruta-detail";
import { RutaList } from "@/components/rutas/ruta-list";

export default function Rutas() {
  const [rutas, setRutas] = useState<RutaResumen[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  async function loadRutas() {
    try {
      setLoading(true);
      setRutas(await getRutas());
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las rutas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadRutas);
  }, []);

  async function selectRuta(id: string) {
    try {
      setLoadingDetalle(true);
      setRutaSeleccionada(await getRuta(id));
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el detalle de la ruta");
    } finally {
      setLoadingDetalle(false);
    }
  }

  const rutasFiltradas = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return rutas;
    return rutas.filter((ruta) => ruta.nombre.toLocaleLowerCase().includes(query));
  }, [rutas, search]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-semibold tracking-tight">Mis rutas</h1>
        <RutaCreateDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onCreated={async () => {
            setFormOpen(false);
            await loadRutas();
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <RutaList
          rutas={rutasFiltradas}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          onSelect={selectRuta}
        />
        <RutaDetail ruta={rutaSeleccionada} loading={loadingDetalle} />
      </div>
    </div>
  );
}
