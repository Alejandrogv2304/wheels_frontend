"use client";

import { Plus } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RutaForm } from "@/components/rutas/ruta-form";
import { ReactNode } from "react";

interface RutaCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  ruta?: import("@/lib/rutas").Ruta | null;
  trigger?: ReactNode;
}

export function RutaCreateDialog({
  open,
  onOpenChange,
  onCreated,
  ruta = null,
  trigger,
}: RutaCreateDialogProps) {
  const editing = Boolean(ruta);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {!editing && trigger === undefined && (
        <AlertDialogTrigger render={<Button />}>
          <Plus /> Nueva ruta
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        size="default"
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            {editing ? "Editar ruta" : "Nueva ruta"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {editing
              ? "Actualiza los datos y el orden de los puntos de la ruta."
              : "Define el nombre, la salida, los puntos intermedios y la llegada de tu nueva ruta."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <RutaForm
          onCancel={() => onOpenChange(false)}
          onCreated={onCreated}
          ruta={ruta}
          footer={
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">
                {editing ? "Guardar cambios" : "Crear ruta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          }
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
