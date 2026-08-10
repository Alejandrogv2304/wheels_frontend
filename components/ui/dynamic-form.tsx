/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/ui/loader";

// ─────────────────────────────────────────────
// Tipos de campo soportados
// ─────────────────────────────────────────────

type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "date"
  | "textarea"
  | "select"
  | "multiselect";

interface SelectOption {
  label: string;
  value: string | number;
  selected?: boolean; // Solo para opciones dinámicas, indica si es la opción seleccionada según defaultValues
}

export interface FormField {
  /** Nombre del campo — coincide con el name del input y la key en FormData */
  name: string;
  /** Etiqueta visible */
  label: string;
  /** Tipo de campo */
  type: FieldType;
  /** Placeholder opcional */
  placeholder?: string;
  /** Si el campo es obligatorio (en modo creación; ver `requiredOnCreate`) */
  required?: boolean;
  /**
   * Si es true, el campo solo es requerido en creación (mode="create").
   * Útil para password: obligatorio al crear, opcional al editar.
   * Por defecto: false (required aplica en ambos modos)
   */
  requiredOnCreate?: boolean;
  /**
   * Mensaje de error personalizado para validación requerida.
   * Por defecto: "El campo {label} es obligatorio"
   */
  requiredMessage?: string;
  /** Validación adicional: mínimo de caracteres */
  minLength?: number;
  minLengthMessage?: string;
  /** Opciones para campos tipo "select" */
  options?: SelectOption[];
  /** Valor por defecto estático (se ignora si se pasan defaultValues al form) */
  defaultValue?: string;
  /** Ocupa el ancho completo o la mitad (grid de 2) */
  colSpan?: "full" | "half";
  /** Endpoint para cargar opciones dinámicamente (solo para tipo "select") */
  optionsEndpoint?: string;
  /** Campo del objeto devuelto por el endpoint que se usará como label (por defecto: 'label') */
  optionLabel?: string;
  /** Campo del objeto devuelto por el endpoint que se usará como value (por defecto: 'value') */
  optionValue?: string;
}

export interface FormValidationRule {
  field: string;
  validate: (value: any, allValues: Record<string, any>) => string | null;
}

export interface DynamicFormProps {
  /** Definición de campos */
  fields: FormField[];
  /** URL base del endpoint */
  endpoint: string;
  /** Modo del formulario. */
  mode?: "create" | "edit";
  /** ID del registro a editar (requerido cuando mode="edit") */
  editId?: number | string;
  /** Valores iniciales para rellenar el formulario en modo edición.*/
  defaultValues?: Record<string, any>;
  /** Texto del botón de envío */
  submitLabel?: string;
  /** Texto del botón cancelar */
  cancelLabel?: string;
  /** Callback al éxito */
  onSuccess: () => void;
  /** Callback al cancelar */
  onCancel: () => void;
  /**
   * Transformación del payload antes de enviarlo.
   * Útil para castear tipos (ej. role → Number(role)).
   */
  transformPayload?: (data: Record<string, any>) => Record<string, any>;
  /** Validaciones personalizadas adicionales */
  extraValidations?: FormValidationRule[];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDateForInput(dateValue: string | undefined): string {
  if (!dateValue) return "";
  try {
    // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // Si es ISO string (2024-05-02T10:30:00Z), extraer la parte de fecha
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateValue)) {
      return dateValue.slice(0, 10);
    }
    // Si es un objeto Date o string parseable, convertir
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  } catch (err) {
    console.warn(
      `[DynamicForm] No se pudo formatear la fecha: ${dateValue}`,
      err,
    );
  }
  return "";
}

function resolveSelectValue(
  raw: string | number | undefined | null,
  fallback?: string,
): string {
  if (raw != null && String(raw).trim() !== "") return String(raw);
  if (fallback != null && fallback.trim() !== "") return fallback;
  return ""; // ✅ Siempre devolver string, nunca undefined
}

/**
 * Sincroniza los valores de los selectes con los defaultValues.
 * Solo sincroniza si el campo NO tiene endpoint (opciones estáticas)
 * Los campos con endpoint se sincronizan después de cargar las opciones.
 */
function syncSelectValuesFromDefaults(
  fields: FormField[],
  defaultValues: Record<string, any> | undefined,
): Record<string, string> {
  if (!defaultValues) {
    return Object.fromEntries(
      fields
        .filter((f) => f.type === "select")
        .map((f) => [f.name, f.defaultValue ?? ""]),
    );
  }

  return Object.fromEntries(
    fields
      .filter((f) => f.type === "select")
      .map((f) => {
        const value = getInitialSelectValue(f, defaultValues);
        return [f.name, value];
      }),
  );
}

/**
 * Obtiene el valor inicial para un select field
 */
function getInitialSelectValue(
  field: FormField,
  defaultValues?: Record<string, any>,
): string {
  const defaultValue = defaultValues?.[field.name] ?? field.defaultValue;

  // Si viene un valor desde defaultValues o defaultValue, tiene prioridad
  if (defaultValue != null && String(defaultValue).trim() !== "") {
    return String(defaultValue);
  }

  // Si no, buscar la opción marcada como selected
  const selectedOption = field.options?.find((o) => o.selected);

  if (selectedOption) {
    return String(selectedOption.value);
  }

  return "";
}

function buildInitialErrors(fields: FormField[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.name, ""]));
}

function validateFields(
  fields: FormField[],
  data: Record<string, any>,
  mode: "create" | "edit",
  extraValidations?: FormValidationRule[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.name];

    // Determinar si es requerido en este modo
    const isRequired =
      field.required || (field.requiredOnCreate && mode === "create");

    if (isRequired) {
      const isEmpty =
        value === undefined || value === null || String(value).trim() === "";
      if (isEmpty) {
        errors[field.name] =
          field.requiredMessage ?? `El campo "${field.label}" es obligatorio`;
        continue;
      }
    }

    // MinLength — solo valida si el campo tiene valor
    if (field.minLength && value && String(value).length < field.minLength) {
      errors[field.name] =
        field.minLengthMessage ?? `Mínimo ${field.minLength} caracteres`;
      continue;
    }
  }

  // Validaciones extra
  if (extraValidations) {
    for (const rule of extraValidations) {
      if (!errors[rule.field]) {
        const msg = rule.validate(data[rule.field], data);
        if (msg) errors[rule.field] = msg;
      }
    }
  }

  return errors;
}

// ─────────────────────────────────────────────
// DynamicForm
// ─────────────────────────────────────────────

export function DynamicForm({
  fields,
  endpoint,
  mode = "create",
  editId,
  defaultValues,
  submitLabel,
  cancelLabel = "Cancelar",
  onSuccess,
  onCancel,
  transformPayload,
  extraValidations,
}: DynamicFormProps) {
  const resolvedSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Guardar cambios" : "Crear");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    buildInitialErrors(fields),
  );

  // Selects: inicializar con defaultValues si existen
  const [selectValues, setSelectValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields
        .filter((f) => f.type === "select")
        .map((f) => [f.name, getInitialSelectValue(f, defaultValues)]),
    ),
  );

  // Multiselect: almacenar como arrays de valores seleccionados
  const [multiselectValues, setMultiselectValues] = useState<
    Record<string, (string | number)[]>
  >(() =>
    Object.fromEntries(
      fields
        .filter((f) => f.type === "multiselect")
        .map((f) => [
          f.name,
          Array.isArray(defaultValues?.[f.name])
            ? defaultValues[f.name]
            : f.defaultValue
              ? [f.defaultValue]
              : [],
        ]),
    ),
  );

  // Opciones dinámicas para selects
  const [fieldOptions, setFieldOptions] = useState<
    Record<string, SelectOption[]>
  >(() =>
    Object.fromEntries(
      fields
        .filter((f) => f.type === "select" || f.type === "multiselect")
        .map((f) => [f.name, f.options ?? []]),
    ),
  );
  const [optionsLoading, setOptionsLoading] = useState<Record<string, boolean>>(
    {},
  );

  // ┌─────────────────────────────────────────────────────────────┐
  // │ PASO 1: Cargar opciones dinámicas SIEMPRE (independiente)   │
  // │ Se ejecuta UNA sola vez cuando monta el componente          │
  // └─────────────────────────────────────────────────────────────┘
  useEffect(() => {
    const loadOptions = async () => {
      const newFieldOptions: Record<string, SelectOption[]> = {};

      for (const field of fields) {
        if (
          (field.type === "select" || field.type === "multiselect") &&
          field.optionsEndpoint
        ) {
          setOptionsLoading((prev) => ({ ...prev, [field.name]: true }));
          try {
            const { default: api } = await import("@/lib/api");
            const res = await api.get(field.optionsEndpoint);
            const data = Array.isArray(res.data) ? res.data : [];
            const labelKey = field.optionLabel ?? "label";
            const valueKey = field.optionValue ?? "value";
            const options: SelectOption[] = data.map((item) => ({
              label: String(item[labelKey]),
              value: item[valueKey],
            }));

            newFieldOptions[field.name] = options;
          } catch (err) {
            newFieldOptions[field.name] = field.options ?? [];
          } finally {
            setOptionsLoading((prev) => ({ ...prev, [field.name]: false }));
          }
        } else if (
          (field.type === "select" || field.type === "multiselect") &&
          field.options
        ) {
          newFieldOptions[field.name] = field.options;
        }
      }

      // Actualizar fieldOptions con todas las opciones cargadas
      setFieldOptions((prev) => ({ ...prev, ...newFieldOptions }));

      // PASO 1.5: Si estamos en EDIT y tenemos defaultValues, sincronizar valores
      if (defaultValues && mode === "edit") {
        setSelectValues(syncSelectValuesFromDefaults(fields, defaultValues));
      }
    };

    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ┌─────────────────────────────────────────────────────────────┐
  // │ PASO 2: Sincronizar multiselectes cuando llegan defaultValues│
  // │ (Los selects se sincronizan en PASO 1.5 después de cargar)  │
  // └─────────────────────────────────────────────────────────────┘
  useEffect(() => {
    if (!defaultValues) {
      return;
    }

    setMultiselectValues(
      Object.fromEntries(
        fields
          .filter((f) => f.type === "multiselect")
          .map((f) => [
            f.name,
            Array.isArray(defaultValues[f.name])
              ? defaultValues[f.name]
              : f.defaultValue
                ? [f.defaultValue]
                : [],
          ]),
      ),
    );

    setErrors(buildInitialErrors(fields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries()) as Record<
      string,
      any
    >;
    const data = { ...rawData, ...selectValues, ...multiselectValues };

    const newErrors = validateFields(fields, data, mode, extraValidations);
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setErrors(buildInitialErrors(fields));
    setLoading(true);

    try {
      // En edición, omitir campos vacíos opcionales (ej. password en blanco)
      const cleanedData =
        mode === "edit"
          ? Object.fromEntries(
              Object.entries(data).filter(([, v]) => v !== "" && v != null),
            )
          : Object.fromEntries(
              Object.entries(data).filter(([, v]) => v != null),
            );

      // Convertir valores de multiselect a números enteros
      const multiselectFieldNames = fields
        .filter((f) => f.type === "multiselect")
        .map((f) => f.name);

      for (const fieldName of multiselectFieldNames) {
        if (Array.isArray(cleanedData[fieldName])) {
          cleanedData[fieldName] = cleanedData[fieldName].map((v) =>
            typeof v === "string" ? parseInt(v, 10) : v,
          );
        }
      }

      const payload = transformPayload
        ? transformPayload(cleanedData)
        : cleanedData;

      const { default: api } = await import("@/lib/api");

      if (mode === "edit" && submitLabel === "Cambiar estado") {
        await api.patch(endpoint, payload);
      } else if (mode === "edit" && editId != null) {
        await api.patch(`${endpoint}/${editId}`, payload);
      } else {
        await api.post(endpoint, payload);
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const rows = groupIntoRows(fields);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={
            row.length === 2 ? "grid grid-cols-2 gap-3" : "grid grid-cols-1"
          }
        >
          {row.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              error={errors[field.name]}
              selectValue={selectValues[field.name]}
              multiselectValues={multiselectValues[field.name]}
              inputDefaultValue={
                field.type !== "select" &&
                field.type !== "multiselect" &&
                field.type !== "password"
                  ? field.type === "date"
                    ? formatDateForInput(
                        String(
                          defaultValues?.[field.name] ??
                            field.defaultValue ??
                            "",
                        ),
                      )
                    : String(
                        defaultValues?.[field.name] ?? field.defaultValue ?? "",
                      )
                  : (field.defaultValue ?? "")
              }
              onSelectChange={(val) =>
                setSelectValues((prev) => ({ ...prev, [field.name]: val }))
              }
              onMultiselectChange={(val) =>
                setMultiselectValues((prev) => ({ ...prev, [field.name]: val }))
              }
              options={fieldOptions[field.name] ?? []}
              optionsLoading={optionsLoading[field.name]}
              inputKey={String(defaultValues?.[field.name] ?? "")}
            />
          ))}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader color="black" size="sm" /> : resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// FieldRenderer
// ─────────────────────────────────────────────

interface FieldRendererProps {
  field: FormField;
  error?: string;
  selectValue?: string;
  multiselectValues?: (string | number)[];
  inputDefaultValue?: string;
  onSelectChange: (val: string) => void;
  onMultiselectChange: (val: (string | number)[]) => void;
  /** Opciones ya cargadas (dinámicas o estáticas) */
  options?: SelectOption[];
  /** Estado de carga de opciones para este campo */
  optionsLoading?: boolean;
  inputKey?: string;
}

function FieldRenderer({
  field,
  error,
  selectValue,
  multiselectValues,
  inputDefaultValue,
  onSelectChange,
  onMultiselectChange,
  options,
  optionsLoading,
  inputKey,
}: FieldRendererProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={field.name}>{field.label}</Label>

      {field.type === "multiselect" ? (
        <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
          {optionsLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando opciones...
            </p>
          ) : (options ?? []).length > 0 ? (
            (options ?? []).map((opt) => (
              <div key={String(opt.value)} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.name}-${opt.value}`}
                  checked={multiselectValues?.includes(opt.value) ?? false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onMultiselectChange([
                        ...(multiselectValues ?? []),
                        opt.value,
                      ]);
                    } else {
                      onMultiselectChange(
                        (multiselectValues ?? []).filter(
                          (v) => v !== opt.value,
                        ),
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`${field.name}-${opt.value}`}
                  className="cursor-pointer font-normal"
                >
                  {opt.label}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay opciones disponibles
            </p>
          )}
        </div>
      ) : field.type === "select" ? (
        <>
          {optionsLoading ? (
            <Select disabled>
              <SelectTrigger id={field.name} className="w-full">
                <span className="text-muted-foreground">Cargando...</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled value="_loading">
                  Cargando opciones...
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select
              value={options && options.length > 0 ? selectValue : undefined}
              onValueChange={onSelectChange}
              disabled={optionsLoading}
            >
              <SelectTrigger id={field.name} className="w-full">
                {optionsLoading ? (
                  <span className="text-muted-foreground">Cargando...</span>
                ) : (
                  <SelectValue
                    placeholder={field.placeholder ?? "Seleccionar"}
                  />
                )}
              </SelectTrigger>
              <SelectContent>
                {optionsLoading ? (
                  <SelectItem disabled value="_loading">
                    Cargando opciones...
                  </SelectItem>
                ) : (options ?? []).length > 0 ? (
                  (options ?? []).map((opt) => {
                    const optValue = String(opt.value);
                    return (
                      <SelectItem key={optValue} value={optValue}>
                        {opt.label}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem disabled value="_empty">
                    No hay opciones disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </>
      ) : field.type === "textarea" ? (
        <Textarea
          key={inputKey}
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          defaultValue={inputDefaultValue}
          rows={3}
        />
      ) : field.type === "date" ? (
        <Input
          key={inputKey}
          id={field.name}
          name={field.name}
          type="date"
          defaultValue={inputDefaultValue}
        />
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={field.type}
          placeholder={field.placeholder}
          defaultValue={inputDefaultValue}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// groupIntoRows
// ─────────────────────────────────────────────

function groupIntoRows(fields: FormField[]): FormField[][] {
  const rows: FormField[][] = [];
  let i = 0;
  while (i < fields.length) {
    const current = fields[i];
    const next = fields[i + 1];
    if (current.colSpan === "half" && next && next.colSpan === "half") {
      rows.push([current, next]);
      i += 2;
    } else {
      rows.push([current]);
      i += 1;
    }
  }
  return rows;
}
