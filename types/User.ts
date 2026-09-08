interface User {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  estado?: string;
  foto?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  calificacion?: number;
  fechaCreacion?: string;
}

export type { User };
