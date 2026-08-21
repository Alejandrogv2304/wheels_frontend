"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getViaje, getViajesConductor, type Viaje } from "@/lib/viajes";
import { ViajeCreateDialog } from "@/components/viajes/viaje-create-dialog";
import { ViajeDetail } from "@/components/viajes/viaje-detail";
import { ViajeList } from "@/components/viajes/viaje-list";

export default function Viajes() {
  const { user } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<Viaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadViajes() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setViajes(await getViajesConductor(String(user.id)));
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar tus viajes");
      } finally {
        setLoading(false);
      }
    }
    void Promise.resolve().then(loadViajes);
  }, [user?.id]);

  async function reloadViajes() {
    if (!user?.id) return;
    setLoading(true);
    try {
      setViajes(await getViajesConductor(String(user.id)));
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar tus viajes");
    } finally {
      setLoading(false);
    }
  }

  async function selectViaje(id: string) {
    try {
      setLoadingDetalle(true);
      setViajeSeleccionado(await getViaje(id));
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el detalle del viaje");
    } finally {
      setLoadingDetalle(false);
    }
  }

  const viajesFiltrados = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return viajes;
    return viajes.filter((viaje) => viaje.ruta?.nombre.toLocaleLowerCase().includes(query));
  }, [viajes, search]);

  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-semibold tracking-tight">Mis viajes</h1><p className="text-muted-foreground">Publica y administra las salidas de tus rutas.</p></div><ViajeCreateDialog open={formOpen} onOpenChange={setFormOpen} onCreated={reloadViajes} /></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]"><ViajeList viajes={viajesFiltrados} loading={loading} search={search} onSearchChange={setSearch} onSelect={selectViaje} /><ViajeDetail viaje={viajeSeleccionado} loading={loadingDetalle} /></div>
  </div>;
}
