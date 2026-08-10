"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  color?: "blue" | "black";
  className?: string;
}

// Componente Loader básico
export function Loader({
  message = "",
  size = "md",
  variant = "dots",
  color = "blue",
  className,
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Mapa de colores completo (así Tailwind los detecta)
  const colorClasses = {
    blue: {
      bg: "bg-blue-600",
      border: "border-t-blue-600",
    },
    black: {
      bg: "bg-black",
      border: "border-t-black",
    },
  };

  const currentColor = colorClasses[color];

  const SpinnerLoader = () => (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300",
        currentColor.border,
        sizeClasses[size]
      )}
    />
  );

  const DotsLoader = () => (
    <div className="flex space-x-1">
      <div
        className={cn("w-2 h-2 rounded-full animate-bounce", currentColor.bg)}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn("w-2 h-2 rounded-full animate-bounce", currentColor.bg)}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn("w-2 h-2 rounded-full animate-bounce", currentColor.bg)}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );

  const PulseLoader = () => (
    <div
      className={cn(
        "rounded-full animate-pulse",
        currentColor.bg,
        sizeClasses[size]
      )}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      case "spinner":
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-3",
        className
      )}
    >
      {renderLoader()}
      {message && (
        <p className="text-sm text-gray-600 font-medium text-center">
          {message}
        </p>
      )}
    </div>
  );
}
