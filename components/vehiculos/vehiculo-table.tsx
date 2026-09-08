/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

interface VehiculoTableProps {
  vehiculos: any[];
  loading: boolean;
  onDelete: (vehiculo: any) => void;
}

export function VehiculoTable({ vehiculos, loading, onDelete }: VehiculoTableProps) {
  const columns = [
    { key: "marca", header: "Marca", sortable: true },
    { key: "referencia", header: "Referencia" },
    { key: "placa", header: "Placa" },
    { key: "tipo", header: "Tipo" },
    { key: "color", header: "Color" },
    { key: "capacidad", header: "Capacidad" },
    {
      key: "acciones",
      header: "Acciones",
      cellClassName: "w-20 text-right",
      render: (_value: unknown, row: any) => (
        <Button type="button" variant="destructive" size="icon" aria-label={`Eliminar ${row.marca} ${row.referencia}`} title="Eliminar vehículo" onClick={() => onDelete(row)}>
          <Trash2 />
        </Button>
      ),
    },
  ];

  return <DataTable data={vehiculos} columns={columns} searchable loading={loading} emptyMessage="No tienes vehículos aún" />;
}