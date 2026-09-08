"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
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

interface ProfileEditDialogProps {
  trigger?: ReactNode;
}

export function ProfileEditDialog({ trigger }: ProfileEditDialogProps) {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [foto, setFoto] = useState<File>();
  const [fotoPreview, setFotoPreview] = useState<string>();
  const [saving, setSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && user) {
      setNombre(user.nombre ?? "");
      setTelefono(user.telefono ?? "");
      setTipoDocumento(user.tipoDocumento ?? "");
      setNumeroDocumento(user.numeroDocumento ?? "");
      setFoto(undefined);
      setFotoPreview(undefined);
    }
    setOpen(nextOpen);
  }

  function handlePhotoChange(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen válido.");
      return;
    }
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const updated = await updateProfile({
      nombre,
      telefono,
      tipoDocumento,
      numeroDocumento,
      foto,
    });
    setSaving(false);
    if (updated) setOpen(false);
  }

  const currentPhoto = fotoPreview || user?.foto;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          trigger ?? (
            <Button type="button" variant="outline" size="sm">
              <Pencil />
              Editar perfil
            </Button>
          )
        }
      />
      <AlertDialogContent
        size="default"
        className="max-h-[90vh] max-w-lg overflow-y-auto"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Editar perfil</AlertDialogTitle>
          <AlertDialogDescription>
            Actualiza tus datos personales y tu foto de perfil.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-4">
            {currentPhoto ? (
              <Image
                src={currentPhoto}
                alt={`Foto de ${nombre || "perfil"}`}
                width={64}
                height={64}
                unoptimized
                className="size-16 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                {(nombre || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="grid min-w-0 flex-1 gap-2">
              <Label htmlFor="profile-photo">Foto de perfil</Label>
              <Input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-name">Nombre completo</Label>
            <Input
              id="profile-name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-phone">Teléfono</Label>
            <Input
              id="profile-phone"
              value={telefono}
              onChange={(event) => setTelefono(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-document-type">Tipo de documento</Label>
            <Select
              value={tipoDocumento}
              onValueChange={(value) => setTipoDocumento(value ?? "")}
            >
              <SelectTrigger id="profile-document-type" className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cc">Cédula de ciudadanía</SelectItem>
                <SelectItem value="ce">Cédula de extranjería</SelectItem>
                <SelectItem value="pasaporte">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-document-number">Número de documento</Label>
            <Input
              id="profile-document-number"
              value={numeroDocumento}
              onChange={(event) => setNumeroDocumento(event.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button type="submit" disabled={saving}>
              <Camera />
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
