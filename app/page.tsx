import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, MapPin, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="w-full">
      <section className="relative isolate flex min-h-[72svh] overflow-hidden bg-[#14221b] text-white">
        <Image
          src="https://images.unsplash.com/photo-1570696657911-287e234bb781"
          alt="Dos amigos viajan juntos en un automóvil."
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-white">
              Wheels <span className="font-normal text-white/75">UIS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth?mode=login"
                className="text-sm font-medium text-white hover:text-white/75"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth?mode=register"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#14221b] transition-colors hover:bg-white/85"
              >
                Crear cuenta
              </Link>
            </div>
          </nav>

          <div className="my-auto max-w-3xl py-16 sm:py-20">
            <p className="mb-4 text-sm font-semibold text-white/85">
              Movilidad compartida · Bucaramanga
            </p>
            <h1 className="m-0 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Viajes compartidos para la comunidad UIS.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Conecta con personas que van hacia el mismo lugar. Comparte el
              trayecto, encuentra un horario conveniente y aprovecha mejor cada
              viaje.
            </p>
            <Link
              href="/auth?mode=register"
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 py-3 font-semibold text-[#14221b] transition-colors hover:bg-white/85"
            >
              Empezar a viajar
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <a
          href="https://unsplash.com/photos/suZ9-M9BwoE"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-4 z-10 text-[10px] text-white/75 underline underline-offset-2"
        >
          Foto de Zac Harris / Unsplash
        </a>
      </section>

      <section className="border-b border-border bg-background">
        <div className="page-wrap grid gap-5 px-5 py-7 sm:grid-cols-3 sm:gap-8 sm:px-8">
          {[
            ["01", "Publica", "Comparte tu ruta y los cupos disponibles."],
            ["02", "Encuentra", "Elige un viaje que encaje con tu horario."],
            ["03", "Viaja", "Coordina el trayecto con tu comunidad."],
          ].map(([step, title, text]) => (
            <div key={step} className="flex gap-3">
              <span className="pt-0.5 text-sm font-semibold text-primary">
                {step}
              </span>
              <div>
                <h2 className="m-0 text-base font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-wrap grid gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 md:items-center lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1689713853262-a7185696b937"
            alt="Una conductora y un pasajero comparten un trayecto en automóvil."
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <a
            href="https://unsplash.com/photos/dC74pJhUVzY"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 right-2 rounded-sm bg-black/60 px-2 py-1 text-[10px] text-white"
          >
            Foto de Brecken Vaught / Unsplash
          </a>
        </div>

        <div className="space-y-5">
          <p className="text-sm font-semibold text-primary">Un camino en común</p>
          <h2 className="m-0 text-3xl font-semibold leading-tight sm:text-4xl">
            Menos viajes en solitario. Más comunidad en el camino.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Wheels reúne a conductores con asientos disponibles y pasajeros que
            buscan llegar a destinos cercanos, con la información de cada viaje
            visible antes de reservar.
          </p>
          <ul className="grid gap-3 text-sm">
            {[
              [MapPin, "Rutas y puntos de encuentro claros"],
              [Clock3, "Horarios visibles antes de reservar"],
              [Users, "Viajes coordinados entre la comunidad"],
            ].map(([Icon, text]) => (
              <li key={text as string} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="size-4" />
                </span>
                {text as string}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#14221b] px-5 py-12 text-center text-white sm:px-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="flex items-center justify-center gap-2 text-sm text-white/75">
            <Check className="size-4" />
            Tu próximo trayecto puede empezar aquí
          </p>
          <h2 className="m-0 text-2xl font-semibold text-white sm:text-3xl">
            Comparte el camino con Wheels.
          </h2>
          <Link
            href="/auth?mode=register"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-3 font-semibold text-[#14221b] transition-colors hover:bg-white/85"
          >
            Crear cuenta
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
