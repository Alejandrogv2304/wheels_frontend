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

interface RutaCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function RutaCreateDialog({ open, onOpenChange, onCreated }: RutaCreateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger render={<Button />}>
        <Plus /> Nueva ruta
      </AlertDialogTrigger>
      <AlertDialogContent size="default" className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Nueva ruta</AlertDialogTitle>
          <AlertDialogDescription>
            Define el nombre, la salida, los puntos intermedios y la llegada de tu nueva ruta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <RutaForm
          onCancel={() => onOpenChange(false)}
          onCreated={onCreated}
          footer={
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">Crear ruta</AlertDialogAction>
            </AlertDialogFooter>
          }
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}