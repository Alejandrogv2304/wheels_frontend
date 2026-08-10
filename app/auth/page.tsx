"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, MapPin, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const benefits = [
  {
    title: "Conexiones rápidas",
    description: "Encuentra rutas compatibles con tu horario y destino.",
    icon: MapPin,
  },
  // {
  //   title: "Comunidad confiable",
  //   description: "Viaja con usuarios verificados y perfiles transparentes.",
  //   icon: ShieldCheck,
  // },
  {
    title: "Ahorro diario",
    description: "Reduce tus costos compartiendo viajes con otros.",
    icon: Users,
  },
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || (mode === "register" && !name)) return;

    setSubmitting(true);

    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password, telefono || undefined);
    }

    setSubmitting(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-10">
      <section className="w-full max-w-7xl rounded-4xl border border-border bg-card p-6 shadow-[0_24px_80px_rgba(16,45,18,0.14)] backdrop-blur-xl sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-4xl bg-primary/5 p-8 text-(--text-primary) shadow-sm sm:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Bienvenido a Wheels
              </div>

              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                  Movilidad compartida
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-(--text-primary) sm:text-5xl">
                  Crea tu cuenta y comienza a viajar más inteligente.
                </h1>
                <p className="max-w-xl text-base leading-7 text-(--text-secondary)">
                  Explora todas las ventajas de compartir rutas dentro de la
                  comunidad UIS.
                </p>
              </div>

              <div className="grid gap-4">
                {benefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-base font-semibold text-(--text-primary)">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 rounded-full bg-muted px-1.5 py-1 shadow-sm">
              <Button
                variant={mode === "register" ? "default" : "outline"}
                className="w-full rounded-full px-4"
                onClick={() => setMode("register")}
              >
                Crear cuenta
              </Button>
              <Button
                variant={mode === "login" ? "default" : "outline"}
                className="w-full rounded-full px-4"
                onClick={() => setMode("login")}
              >
                Iniciar sesión
              </Button>
            </div>

            <Card className="rounded-4xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl font-semibold text-(--text-primary)">
                  {mode === "register"
                    ? "Crea tu cuenta"
                    : "Bienvenido de nuevo"}
                </CardTitle>
                <CardDescription>
                  {mode === "register"
                    ? "Registra tus datos para empezar a compartir viajes y ahorrar en cada ruta."
                    : "Ingresa con tu correo y continúa tus rutas y viajes guardados."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {mode === "register" && (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      required
                    />
                  </div>

                  {mode === "register" && (
                    <div className="grid gap-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={telefono}
                        onChange={(event) => setTelefono(event.target.value)}
                        placeholder="(312) 555-0123"
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Procesando..."
                      : mode === "register"
                        ? "Crear cuenta"
                        : "Iniciar sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
