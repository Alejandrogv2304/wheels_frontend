import { ArrowRight, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="page-wrap grid gap-10 px-4 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="island-kicker">Carpooling para comunidad UIS</p>
            <h1 className="m-0 text-4xl font-bold leading-tight text-(--text-primary) sm:text-5xl">
              Viaja acompañado,
              <br />
              <span className="text-(--uis-green)">
                paga menos por cada trayecto.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-(--text-secondary)">
              Wheels conecta conductores con cupos libres y pasajeros que se
              mueven hacia los mismos puntos: campus, casa, trabajo y rutas
              frecuentes de la ciudad.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg">
              <Link href="/auth">
                Empezar ahora
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Link href="/auth">Iniciar sesión</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="rounded-md bg-secondary p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ruta destacada</p>
                <h2 className="m-0 text-2xl font-semibold">
                  Cabecera {'->'} UIS
                </h2>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                3 cupos
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {[
              ['Salida', '8:00 a. m.'],
              ['Precio', '$4.000 por cupo'],
              ['Perfil', 'Estudiante'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap px-4 py-8 sm:py-12">
        <h2 className="mb-8 text-2xl font-bold text-(--text-primary) sm:text-3xl">
          Todo lo que necesitas para compartir viajes
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: MapPin,
              title: 'Rutas por afinidad',
              text: 'Encuentra personas que salen de zonas cercanas y llegan al mismo destino.',
            },
            {
              icon: ShieldCheck,
              title: 'Confianza primero',
              text: 'Perfiles, historial y verificación para viajar con más tranquilidad.',
            },
            {
              icon: Clock3,
              title: 'Horarios claros',
              text: 'Coordina salidas recurrentes para clase, trabajo o regreso a casa.',
            },
            {
              icon: Users,
              title: 'Comunidad activa',
              text: 'Convierte trayectos diarios en una red de apoyo y ahorro compartido.',
            },
          ].map((feature) => (
            <div key={feature.title} className="card space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <feature.icon size={24} />
              </div>
              <h3 className="font-semibold text-(--text-primary)">
                {feature.title}
              </h3>
              <p className="text-sm text-(--text-secondary)">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-wrap -mx-4 rounded-lg bg-(--bg-secondary) px-4 py-8 sm:mx-auto sm:my-8 sm:rounded-lg sm:py-12">
        <div className="grid gap-6 text-center sm:grid-cols-3">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-(--uis-green) sm:text-4xl">
              250+
            </div>
            <p className="text-sm text-(--text-secondary)">
              Personas compartiendo rutas
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-(--uis-green) sm:text-4xl">
              1.2k
            </div>
            <p className="text-sm text-(--text-secondary)">
              Trayectos coordinados
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-(--uis-green) sm:text-4xl">
              35%
            </div>
            <p className="text-sm text-(--text-secondary)">
              Menos gasto promedio
            </p>
          </div>
        </div>
      </section>

      <section className="page-wrap space-y-4 px-4 py-8 text-center sm:py-12">
        <h2 className="text-2xl font-bold text-(--text-primary) sm:text-3xl">
          Arma tu próxima ruta compartida
        </h2>
        <p className="mx-auto max-w-xl text-(--text-secondary)">
          Publica un viaje si tienes cupos libres o reserva un asiento en una
          ruta cercana a tu horario.
        </p>
        <Button size="lg">
          <Link href="/auth">
            Crear cuenta
            <ArrowRight />
          </Link>
        </Button>
      </section>
    </main>
  )
}
