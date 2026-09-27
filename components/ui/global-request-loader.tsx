"use client";

import { useSyncExternalStore } from "react";
import { LoaderCircle } from "lucide-react";
import { requestLoader } from "@/lib/request-loader";

export function GlobalRequestLoader() {
  const pending = useSyncExternalStore(
    requestLoader.subscribe,
    requestLoader.getSnapshot,
    requestLoader.getServerSnapshot,
  );
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      aria-hidden={!pending}
      className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-[2px] transition-opacity delay-150 duration-150 ${pending ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex flex-col items-center gap-3 text-sm font-medium text-foreground">
        <LoaderCircle className="size-9 animate-spin text-primary" />
        Cargando...
      </div>
    </div>
  );
}