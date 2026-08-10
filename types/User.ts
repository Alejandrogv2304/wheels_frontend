interface User {
  id: number;
  name: string;
  email: string;
  telefono?: string;
  estado?: string;
  foto?: string;
  tipo_documento?: string;
  numero_documento?: number;
  calificacion?: number;
  fecha_creacion?: Date;
}

export type { User };
