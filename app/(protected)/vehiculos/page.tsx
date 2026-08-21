/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getVehiculos, deleteVehiculo } from "@/lib/vehiculos";
import { VehiculoCreateDialog } from "@/components/vehiculos/vehiculo-create-dialog";
import { VehiculoTable } from "@/components/vehiculos/vehiculo-table";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  async function loadVehiculos() {
    try {
      setLoadingVehiculos(true);
      const response = await getVehiculos();
      setVehiculos(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Error obteniendo vehículos");
    } finally {
      setLoadingVehiculos(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadVehiculos);
  }, []);

  async function handleDeleteVehiculo() {
    const vehicleId = vehicleToDelete?.id ?? vehicleToDelete?._id;
    if (!vehicleId) {
      toast.error("No se encontró el identificador del vehículo");
      return;
    }

    try {
      setDeletingVehicle(true);
      await deleteVehiculo(vehicleId);
      toast.success("Vehículo eliminado correctamente");
      setVehicleToDelete(null);
      await loadVehiculos();
    } catch (error) {
      console.error(error);
      toast.error("Error eliminando vehículo");
    } finally {
      setDeletingVehicle(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-semibold tracking-tight">Mis vehículos</h1>
        <VehiculoCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={loadVehiculos}
        />
      </div>

      <Card>
        <CardContent>
          <VehiculoTable vehiculos={vehiculos} loading={loadingVehiculos} onDelete={setVehicleToDelete} />
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(vehicleToDelete)} onOpenChange={(open) => { if (!open && !deletingVehicle) setVehicleToDelete(null); }}>
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vehículo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar {vehicleToDelete?.marca} {vehicleToDelete?.referencia} con placa {vehicleToDelete?.placa}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingVehicle}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehiculo} disabled={deletingVehicle} variant="destructive">
              {deletingVehicle ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
