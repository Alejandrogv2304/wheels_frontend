"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export interface DataTableColumn<T, K extends keyof T = keyof T> {
  /** Clave del campo en el objeto T (o key único si usas render) */
  key: K | string;
  /** Encabezado de la columna */
  header: string;
  /** Si la columna se puede ordenar */
  sortable?: boolean;
  /** Clases adicionales para la celda de encabezado */
  headerClassName?: string;
  /** Clases adicionales para las celdas de datos */
  cellClassName?: string;
  /**
   * Renderizador personalizado. Si no se provee, se muestra T[key] como string.
   * @param value El valor de T[key]
   * @param row La fila completa
   */
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T extends object> {
  /** Datos a mostrar */
  data: T[];
  /** Definición de columnas */
  columns: DataTableColumn<T>[];
  /** Muestra barra de búsqueda global */
  searchable?: boolean;
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string;
  /**
   * Campos de T que se incluyen en la búsqueda global.
   * Soporta notación de puntos para propiedades anidadas (ej: "client.nombre", "tipoEnsayo.descripcion")
   * Si no se especifica, busca en todos los campos string/number.
   */
  searchFields?: (keyof T | string)[];
  /** Habilita paginación */
  pagination?: boolean;
  /** Opciones de filas por página */
  pageSizeOptions?: number[];
  /** Número de filas por página por defecto */
  defaultPageSize?: number;
  /** Mensaje cuando no hay resultados */
  emptyMessage?: string;
  /** Acción/botón extra en la barra superior (ej. botón "Nuevo usuario") */
  headerAction?: React.ReactNode;
  /** Clases extra del contenedor externo */
  className?: string;
  /** Estado de carga — muestra skeleton */
  loading?: boolean;
  /** Número de filas del skeleton */
  loadingRows?: number;
}

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

/**
 * Obtiene el valor de una propiedad anidada usando notación de puntos
 * @example getNestedValue({a: {b: {c: 'valor'}}}, 'a.b.c') => 'valor'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = obj;
  const keys = String(path).split(".");
  for (const key of keys) {
    if (value != null) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

// ─────────────────────────────────────────────
// Componente interno: icono de ordenación
// ─────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ChevronUp size={14} />;
  if (direction === "desc") return <ChevronDown size={14} />;
  return <ChevronsUpDown size={14} className="text-muted-foreground" />;
}

// ─────────────────────────────────────────────
// DataTable
// ─────────────────────────────────────────────

export function DataTable<T extends object>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Buscar...",
  searchFields,
  pagination = false,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  emptyMessage = "No se encontraron resultados",
  headerAction,
  className,
  loading = false,
  loadingRows = 5,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // ── Búsqueda ──────────────────────────────
  const searched = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      const keys = searchFields ?? (Object.keys(row) as (keyof T)[]);
      return keys.some((k) => {
        const keyStr = String(k);
        const val = getNestedValue(row, keyStr);
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, search, searchFields]);

  // ── Ordenación ────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return searched;
    return [...searched].sort((a, b) => {
      const keyStr = String(sortKey);
      const av = getNestedValue(a, keyStr);
      const bv = getNestedValue(b, keyStr);
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "es", { sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [searched, sortKey, sortDir]);

  // ── Paginación ────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    if (!pagination) return sorted;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pagination, page, pageSize]);

  // Resetear página al buscar
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  // ── Toggle ordenación ─────────────────────
  const handleSort = (key: keyof T | string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    }
  };

  // ── Renderizado ───────────────────────────
  const displayRows = paginated;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Barra superior */}
      {(searchable || headerAction) && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {searchable && (
            <div className="relative max-w-sm w-full">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {headerAction && <div className="ml-auto">{headerAction}</div>}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    col.sortable && "cursor-pointer select-none",
                    col.headerClassName,
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-12"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={col.cellClassName}
                    >
                      {col.render
                        ? col.render(row[col.key as keyof T], row)
                        : String(row[col.key as keyof T] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filas por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v: unknown) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>
              {sorted.length === 0
                ? "0 resultados"
                : `${(page - 1) * pageSize + 1}–${Math.min(
                    page * pageSize,
                    sorted.length,
                  )} de ${sorted.length}`}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
