"use client";

import { FormEvent, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCircle2, MapPin, Users } from "lucide-react";
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
import { toast } from "sonner";

const benefits = [
  {
    title: "Conexiones rápidas",
    description: "Encuentra rutas compatibles con tu horario y destino.",
    icon: MapPin,
  },
  {
    title: "Ahorro diario",
    description: "Reduce tus costos compartiendo viajes con otros.",
    icon: Users,
  },
];

function AuthForm() {
  const { login, register, handleOAuthCallback, startOAuth } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Estado derivado directamente de la URL
  const modeParam = searchParams.get("mode");
  const mode: "login" | "register" =
    modeParam === "login" ? "login" : "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If opened as an OAuth popup, process callback via context, notify opener and close.
    if (window.opener && window.opener !== window) {
      const hash = window.location.hash;
      (async () => {
        if (hash) {
          try {
            await handleOAuthCallback(hash);
          } catch {
            // ignore
          }
        }

        try {
          window.opener.postMessage(
            { type: "oauth", provider: "google" },
            window.location.origin,
          );
        } catch {
          // ignore
        }

        window.close();
      })();
    }
  }, [handleOAuthCallback]);

  // Listen for oauth messages from popup and navigate to home when received
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "oauth") {
        router.replace("/inicio");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  // Cambiar de modo actualizando el parámetro en la URL
  const handleModeChange = (newMode: "login" | "register") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", newMode);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || (mode === "register" && !name)) return;

    if (mode === "register" && password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password, telefono || undefined);
    }

    setLoading(false);
  };

  const handleGoogleOAuth = async () => {
    try {
      setGoogleLoading(true);
      await startOAuth("google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen min-w-screen md:w-auto items-center justify-center bg-muted/50 px-4 py-10">
      <section className="w-full max-w-7xl rounded-4xl border border-border bg-card p-6 shadow-[0_24px_80px_rgba(16,45,18,0.14)] backdrop-blur-xl sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 rounded-full bg-muted px-1.5 py-1 shadow-sm">
              <Button
                variant={mode === "register" ? "default" : "outline"}
                className="w-full rounded-full px-4"
                onClick={() => handleModeChange("register")}
              >
                Crear cuenta
              </Button>
              <Button
                variant={mode === "login" ? "default" : "outline"}
                className="w-full rounded-full px-4"
                onClick={() => handleModeChange("login")}
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

                  {mode === "register" && (
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">
                        Confirmar contraseña
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="********"
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? "Cargando..."
                      : mode === "register"
                        ? "Crear cuenta"
                        : "Iniciar sesión"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center gap-3"
                    onClick={handleGoogleOAuth}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      "Redirigiendo..."
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21.35 11.1h-9.2v2.8h5.3c-.2 1.2-.9 2.2-1.9 2.9v2.3h3.1c1.7-1.6 2.7-3.9 2.7-6.7 0-.6-.1-1.1-.2-1.6z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12.15 21c2.6 0 4.8-.86 6.4-2.35l-3.1-2.3c-.86.57-1.97.9-3.3.9-2.54 0-4.7-1.72-5.48-4.03H3.1v2.52C4.7 18.9 8.17 21 12.15 21z"
                            fill="#34A853"
                          />
                          <path
                            d="M6.67 13.22A6.13 6.13 0 016.5 12c0-.4.06-.8.15-1.17V8.31H3.1A9.99 9.99 0 002.15 12c0 1.62.38 3.15 1.03 4.54l3.49-3.32z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12.15 7.5c1.42 0 2.63.48 3.61 1.42l2.7-2.7C16.95 4.66 14.75 3.6 12.15 3.6 8.17 3.6 4.7 5.69 3.1 8.88l3.55 2.52C7.45 9.22 9.61 7.5 12.15 7.5z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continuar con Google
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="hidden md:flex flex-col justify-between rounded-4xl bg-primary/5 p-8 text-(--text-primary) shadow-sm sm:p-10">
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
                  comunidad.
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
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
