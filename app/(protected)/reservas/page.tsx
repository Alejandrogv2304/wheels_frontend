"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { cancelarReserva, getReservas, type Reserva } from "@/lib/viajes";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function routeName(reserva: Reserva) {
  return reserva.viaje?.ruta?.nombre ?? `Viaje ${reserva.viajeId}`;
}

function isCancelled(reserva: Reserva) {
  return (reserva.estado ?? "").toLocaleLowerCase("es").includes("cancel");
}

export default function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservaToCancel, setReservaToCancel] = useState<Reserva | null>(null);
  const [canceling, setCanceling] = useState(false);

  async function loadReservas() {
    try {
      setLoading(true);
      setReservas(await getReservas());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadReservas);
  }, []);

  async function handleCancel() {
    if (!reservaToCancel) return;

    try {
      setCanceling(true);
      await cancelarReserva(reservaToCancel.id);
      toast.success("Reserva cancelada correctamente");
      setReservaToCancel(null);
      await loadReservas();
    } catch (error) {
      console.error(error);
    } finally {
      setCanceling(false);
    }
  }

  const columns: DataTableColumn<Reserva>[] = [
    {
      key: "viaje.ruta.nombre",
      header: "Ruta",
      sortable: true,
      render: (_value, row) => routeName(row),
    },
    {
      key: "salida",
      header: "Salida",
      render: (_value, row) => formatDate(row.viaje?.fechaSalida),
    },
    {
      key: "conductor",
      header: "Conductor",
      render: (_value, row) =>
        row.viaje?.conductor?.nombre ?? row.conductor?.nombre ?? "—",
    },
    {
      key: "precio",
      header: "Precio",
      render: (_value, row) =>
        row.viaje?.precio == null
          ? "—"
          : `$${Number(row.viaje.precio).toLocaleString("es-CO")}`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (_value, row) => (
        <Badge variant={isCancelled(row) ? "outline" : "secondary"}>
          {row.estado || "Pendiente"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      cellClassName: "w-32 text-right",
      render: (_value, row) =>
        isCancelled(row) ? (
          <span className="text-sm text-muted-foreground">Sin acciones</span>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setReservaToCancel(row)}
          >
            Cancelar
          </Button>
        ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Mis reservas</h1>
        <p className="text-muted-foreground">
          Consulta y administra tus viajes como pasajero.
        </p>
      </div>

      <Card>
        <CardContent>
          <DataTable
            data={reservas}
            columns={columns}
            searchable
            searchFields={[
              "id",
              "estado",
              "viaje.ruta.nombre",
              "viaje.conductor.nombre",
              "conductor.nombre",
            ]}
            loading={loading}
            pagination
            emptyMessage="Aún no tienes reservas."
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(reservaToCancel)}
        onOpenChange={(open) => {
          if (!open && !canceling) setReservaToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Quieres cancelar tu reserva para {reservaToCancel && routeName(reservaToCancel)}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>Volver</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancel}
              disabled={canceling}
            >
              {canceling ? "Cancelando..." : "Cancelar reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}