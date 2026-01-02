import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  type Expediente,
  type InsertExpediente,
  type CoberturaRegistro,
  type InsertCoberturaRegistro,
  type CoberturaEvento,
  type InsertCoberturaEvento,
  type CoberturaDetalle,
  type InsertCoberturaDetalle,
  type TitularizacionEstadistica,
  type InsertTitularizacionEstadistica,
  type TitularizacionRegistro,
  type InsertTitularizacionRegistro,
  TITULARIZACION_TYPES,
  JUNTA_TYPES,
} from "@shared/schema";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  getExpedientes(): Promise<Expediente[]>;
  getExpediente(id: string): Promise<Expediente | undefined>;
  createExpediente(data: InsertExpediente): Promise<Expediente>;
  updateExpediente(id: string, data: InsertExpediente): Promise<Expediente | undefined>;
  deleteExpediente(id: string): Promise<boolean>;

  getCoberturaRegistros(): Promise<CoberturaRegistro[]>;
  getCoberturaRegistro(id: string): Promise<CoberturaRegistro | undefined>;
  createCoberturaRegistro(data: InsertCoberturaRegistro): Promise<CoberturaRegistro>;
  updateCoberturaRegistro(id: string, data: InsertCoberturaRegistro): Promise<CoberturaRegistro | undefined>;
  deleteCoberturaRegistro(id: string): Promise<boolean>;

  getCoberturaEventos(): Promise<CoberturaEvento[]>;
  getCoberturaEvento(id: string): Promise<CoberturaEvento | undefined>;
  createCoberturaEvento(data: InsertCoberturaEvento): Promise<CoberturaEvento>;
  updateCoberturaEvento(id: string, data: InsertCoberturaEvento): Promise<CoberturaEvento | undefined>;
  deleteCoberturaEvento(id: string): Promise<boolean>;

  getCoberturaDetalles(): Promise<CoberturaDetalle[]>;
  getCoberturaDetalle(id: string): Promise<CoberturaDetalle | undefined>;
  createCoberturaDetalle(data: InsertCoberturaDetalle): Promise<CoberturaDetalle>;
  updateCoberturaDetalle(id: string, data: InsertCoberturaDetalle): Promise<CoberturaDetalle | undefined>;
  deleteCoberturaDetalle(id: string): Promise<boolean>;

  getTitularizacionEstadisticas(): Promise<TitularizacionEstadistica[]>;
  getTitularizacionEstadistica(id: string): Promise<TitularizacionEstadistica | undefined>;
  createTitularizacionEstadistica(data: InsertTitularizacionEstadistica): Promise<TitularizacionEstadistica>;

  getTitularizacionRegistros(): Promise<TitularizacionRegistro[]>;
  getTitularizacionRegistro(id: string): Promise<TitularizacionRegistro | undefined>;
  createTitularizacionRegistro(data: InsertTitularizacionRegistro): Promise<TitularizacionRegistro>;
}

export class MemStorage implements IStorage {
  private coberturaRegistros: Map<string, CoberturaRegistro> = new Map();
  private coberturaDetalles: Map<string, CoberturaDetalle> = new Map();
  private titularizacionEstadisticas: Map<string, TitularizacionEstadistica> = new Map();
  private titularizacionRegistros: Map<string, TitularizacionRegistro> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const sampleRegistros: CoberturaRegistro[] = [
      { id: crypto.randomUUID(), region: "I", nivel: "INICIAL Y PRIMARIO", responsable: "YANINA VARGAS", expediente: "1001/26", pedidoFileName: null, pedidoFilePath: null },
      { id: crypto.randomUUID(), region: "II", nivel: "SECUNDARIO", responsable: "NOELIA VILLA", expediente: "1002/26", pedidoFileName: null, pedidoFilePath: null },
      { id: crypto.randomUUID(), region: "III", nivel: "INICIAL Y PRIMARIO", responsable: "LAURA MORALES", expediente: "1003/26", pedidoFileName: null, pedidoFilePath: null },
      { id: crypto.randomUUID(), region: "IV", nivel: "SECUNDARIO", responsable: "AXEL CABRERA", expediente: "1004/26", pedidoFileName: null, pedidoFilePath: null },
      { id: crypto.randomUUID(), region: "V", nivel: "INICIAL Y PRIMARIO", responsable: "YANINA VARGAS", expediente: "1005/26", pedidoFileName: null, pedidoFilePath: null },
    ];

    sampleRegistros.forEach((reg) => {
      this.coberturaRegistros.set(reg.id, reg);
    });

    const sampleDetalles: CoberturaDetalle[] = [
      { id: crypto.randomUUID(), llamado: "Llamado 1/2026", tipo: "SUPLENCIA", fecha: "2026-01-15", juntaClasificacion: "INICIAL Y PRIMARIA", region: "I", localidad: "Capital", establecimiento: "Escuela N° 100", nivel: "PRIMARIO", caracter: "COMÚN", descripcion: "Maestro de Grado", apellido: "GARCÍA", nombre: "MARÍA", dni: "30123456", habilitacion: "HABILITADO" },
      { id: crypto.randomUUID(), llamado: "Llamado 1/2026", tipo: "SUPLENCIA", fecha: "2026-01-15", juntaClasificacion: "INICIAL Y PRIMARIA", region: "I", localidad: "Capital", establecimiento: "Escuela N° 100", nivel: "INICIAL", caracter: "COMÚN", descripcion: "Maestra de Sala", apellido: "LÓPEZ", nombre: "ANA", dni: "31234567", habilitacion: "HABILITADO" },
      { id: crypto.randomUUID(), llamado: "Llamado 2/2026", tipo: "INTERINATO", fecha: "2026-01-20", juntaClasificacion: "SECUNDARIA", region: "II", localidad: "Zona Norte", establecimiento: "Colegio N° 200", nivel: "SECUNDARIO", caracter: "TÉCNICO", descripcion: "Profesor de Matemáticas", apellido: "MARTÍNEZ", nombre: "JUAN", dni: "28345678", habilitacion: "EN TRÁMITE" },
      { id: crypto.randomUUID(), llamado: "Llamado 3/2026", tipo: "TITULAR", fecha: "2026-02-01", juntaClasificacion: "INICIAL Y PRIMARIA", region: "III", localidad: "Zona Sur", establecimiento: "Jardín N° 50", nivel: "INICIAL", caracter: "COMÚN", descripcion: "Maestra de Sala", apellido: "RODRÍGUEZ", nombre: "LAURA", dni: "32456789", habilitacion: "HABILITADO" },
      { id: crypto.randomUUID(), llamado: "Llamado 4/2026", tipo: "SUPLENCIA", fecha: "2026-02-10", juntaClasificacion: "SECUNDARIA", region: "IV", localidad: "Zona Este", establecimiento: "Instituto N° 300", nivel: "SECUNDARIO", caracter: "COMÚN", descripcion: "Profesor de Historia", apellido: "FERNÁNDEZ", nombre: "CARLOS", dni: "29567890", habilitacion: "HABILITADO" },
      { id: crypto.randomUUID(), llamado: "Llamado 5/2026", tipo: "INTERINATO", fecha: "2026-02-15", juntaClasificacion: "INICIAL Y PRIMARIA", region: "V", localidad: "Zona Oeste", establecimiento: "Escuela N° 150", nivel: "PRIMARIO", caracter: "ESPECIAL", descripcion: "Maestro Integrador", apellido: "GONZÁLEZ", nombre: "PEDRO", dni: "33678901", habilitacion: "HABILITADO" },
    ];

    sampleDetalles.forEach((det) => {
      this.coberturaDetalles.set(det.id, det);
    });

    // Seed Titularizaciones Estadísticas
    JUNTA_TYPES.forEach((junta) => {
      TITULARIZACION_TYPES.forEach((tipo) => {
        const id = crypto.randomUUID();
        const cantidad = Math.floor(Math.random() * 50) + 5;
        this.titularizacionEstadisticas.set(id, { id, tipo, juntaClasificacion: junta, cantidad });
      });
    });

    // Seed Titularizaciones Registros
    const sampleTitularizaciones: TitularizacionRegistro[] = [
      { id: crypto.randomUUID(), expediente: "TIT-001/26", nombre: "MARÍA", apellido: "PÉREZ", dni: "28123456", establecimiento: "Escuela N° 100", localidad: "Capital", departamento: "Capital", juntaClasificacion: "INICIAL Y PRIMARIA", renunciaA: null, titularizarEn: "MAESTRA DE NIVEL INICIAL" },
      { id: crypto.randomUUID(), expediente: "TIT-002/26", nombre: "JUAN", apellido: "GARCÍA", dni: "29234567", establecimiento: "Colegio N° 200", localidad: "Zona Norte", departamento: "Norte", juntaClasificacion: "SECUNDARIA", renunciaA: "HORAS", titularizarEn: "ASESOR PEDAGÓGICO" },
      { id: crypto.randomUUID(), expediente: "TIT-003/26", nombre: "ANA", apellido: "LÓPEZ", dni: "30345678", establecimiento: "Jardín N° 50", localidad: "Zona Sur", departamento: "Sur", juntaClasificacion: "INICIAL Y PRIMARIA", renunciaA: null, titularizarEn: "DIRECTOR DE PERSONAL ÚNICO" },
      { id: crypto.randomUUID(), expediente: "TIT-004/26", nombre: "CARLOS", apellido: "MARTÍNEZ", dni: "27456789", establecimiento: "Instituto N° 300", localidad: "Zona Este", departamento: "Este", juntaClasificacion: "SECUNDARIA", renunciaA: "CARGOS", titularizarEn: "SECRETARIO" },
      { id: crypto.randomUUID(), expediente: "TIT-005/26", nombre: "LAURA", apellido: "FERNÁNDEZ", dni: "31567890", establecimiento: "Escuela N° 150", localidad: "Zona Oeste", departamento: "Oeste", juntaClasificacion: "INICIAL Y PRIMARIA", renunciaA: null, titularizarEn: "DIRECTOR DE 3RA. CATEGORÍA" },
      { id: crypto.randomUUID(), expediente: "TIT-006/26", nombre: "PEDRO", apellido: "RODRÍGUEZ", dni: "26678901", establecimiento: "Colegio Técnico N° 5", localidad: "Capital", departamento: "Capital", juntaClasificacion: "SECUNDARIA", renunciaA: null, titularizarEn: "HORAS" },
      { id: crypto.randomUUID(), expediente: "TIT-007/26", nombre: "SOFÍA", apellido: "GONZÁLEZ", dni: "32789012", establecimiento: "Escuela Rural N° 25", localidad: "Interior", departamento: "Interior", juntaClasificacion: "INICIAL Y PRIMARIA", renunciaA: "MAESTRA DE NIVEL INICIAL", titularizarEn: "SECRETARIO CON RENUNCIA" },
      { id: crypto.randomUUID(), expediente: "TIT-008/26", nombre: "DIEGO", apellido: "SÁNCHEZ", dni: "25890123", establecimiento: "Instituto Provincial N° 10", localidad: "Zona Norte", departamento: "Norte", juntaClasificacion: "SECUNDARIA", renunciaA: null, titularizarEn: "CARGOS" },
    ];

    sampleTitularizaciones.forEach((tit) => {
      this.titularizacionRegistros.set(tit.id, tit);
    });
  }

  async getExpedientes(): Promise<Expediente[]> {
    const { data, error } = await supabase.from("creaciones").select("*");
    if (error) {
      console.error("Error fetching expedientes:", error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: String(row.id),
      expediente: row.expediente,
      solicita: row.solicitud,
      establecimiento: row.establecimiento,
      ubicacion: row.ubicacion,
      comentario: row.comentario || "",
    }));
  }

  async getExpediente(id: string): Promise<Expediente | undefined> {
    const { data, error } = await supabase.from("creaciones").select("*").eq("id", parseInt(id)).single();
    if (error) {
      console.error("Error fetching expediente:", error);
      return undefined;
    }
    if (!data) return undefined;
    return {
      id: String(data.id),
      expediente: data.expediente,
      solicita: data.solicitud,
      establecimiento: data.establecimiento,
      ubicacion: data.ubicacion,
      comentario: data.comentario || "",
    };
  }

  async createExpediente(data: InsertExpediente): Promise<Expediente> {
    const { data: created, error } = await supabase
      .from("creaciones")
      .insert({
        expediente: data.expediente,
        solicitud: data.solicita,
        establecimiento: data.establecimiento,
        ubicacion: data.ubicacion,
        comentario: data.comentario ?? "",
      })
      .select()
      .single();
    if (error) {
      console.error("Error creating expediente:", error);
      throw new Error("Failed to create expediente");
    }
    return {
      id: String(created.id),
      expediente: created.expediente,
      solicita: created.solicitud,
      establecimiento: created.establecimiento,
      ubicacion: created.ubicacion,
      comentario: created.comentario || "",
    };
  }

  async updateExpediente(id: string, data: InsertExpediente): Promise<Expediente | undefined> {
    const { data: updated, error } = await supabase
      .from("creaciones")
      .update({
        expediente: data.expediente,
        solicitud: data.solicita,
        establecimiento: data.establecimiento,
        ubicacion: data.ubicacion,
        comentario: data.comentario ?? "",
      })
      .eq("id", parseInt(id))
      .select()
      .single();
    if (error) {
      console.error("Error updating expediente:", error);
      return undefined;
    }
    if (!updated) return undefined;
    return {
      id: String(updated.id),
      expediente: updated.expediente,
      solicita: updated.solicitud,
      establecimiento: updated.establecimiento,
      ubicacion: updated.ubicacion,
      comentario: updated.comentario || "",
    };
  }

  async deleteExpediente(id: string): Promise<boolean> {
    const { error } = await supabase.from("creaciones").delete().eq("id", parseInt(id));
    if (error) {
      console.error("Error deleting expediente:", error);
      return false;
    }
    return true;
  }

  async getCoberturaRegistros(): Promise<CoberturaRegistro[]> {
    return Array.from(this.coberturaRegistros.values());
  }

  async getCoberturaRegistro(id: string): Promise<CoberturaRegistro | undefined> {
    return this.coberturaRegistros.get(id);
  }

  async createCoberturaRegistro(data: InsertCoberturaRegistro): Promise<CoberturaRegistro> {
    const id = crypto.randomUUID();
    const registro: CoberturaRegistro = { id, region: data.region, nivel: data.nivel, responsable: data.responsable, expediente: data.expediente, pedidoFileName: data.pedidoFileName ?? null, pedidoFilePath: data.pedidoFilePath ?? null };
    this.coberturaRegistros.set(id, registro);
    return registro;
  }

  async updateCoberturaRegistro(id: string, data: InsertCoberturaRegistro): Promise<CoberturaRegistro | undefined> {
    const existing = this.coberturaRegistros.get(id);
    if (!existing) return undefined;
    const updated: CoberturaRegistro = { id, region: data.region, nivel: data.nivel, responsable: data.responsable, expediente: data.expediente, pedidoFileName: data.pedidoFileName ?? null, pedidoFilePath: data.pedidoFilePath ?? null };
    this.coberturaRegistros.set(id, updated);
    return updated;
  }

  async deleteCoberturaRegistro(id: string): Promise<boolean> {
    return this.coberturaRegistros.delete(id);
  }

  async getCoberturaEventos(): Promise<CoberturaEvento[]> {
    const { data, error } = await supabase.from("llamados_cobertura").select("*");
    if (error) {
      console.error("Error fetching cobertura eventos:", error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: String(row.id),
      llamado: row.llamado || "",
      juntaClasificacion: row.junta_clasificacion || "",
      tipo: row.tipo || "",
      fecha: row.fecha || "",
      establecimientos: Number(row.establecimiento) || 0,
      coberturas: Number(row.vacantes) || 0,
      postulantes: Number(row.postulantes) || 0,
      promedio: Number(row.promedio) || 0,
    }));
  }

  async getCoberturaEvento(id: string): Promise<CoberturaEvento | undefined> {
    const { data, error } = await supabase.from("llamados_cobertura").select("*").eq("id", parseInt(id)).single();
    if (error) {
      console.error("Error fetching cobertura evento:", error);
      return undefined;
    }
    if (!data) return undefined;
    return {
      id: String(data.id),
      llamado: data.llamado || "",
      juntaClasificacion: data.junta_clasificacion || "",
      tipo: data.tipo || "",
      fecha: data.fecha || "",
      establecimientos: Number(data.establecimiento) || 0,
      coberturas: Number(data.vacantes) || 0,
      postulantes: Number(data.postulantes) || 0,
      promedio: Number(data.promedio) || 0,
    };
  }

  async createCoberturaEvento(data: InsertCoberturaEvento): Promise<CoberturaEvento> {
    const { data: created, error } = await supabase
      .from("llamados_cobertura")
      .insert({
        llamado: data.llamado,
        junta_clasificacion: data.juntaClasificacion,
        tipo: data.tipo,
        fecha: data.fecha,
        establecimiento: data.establecimientos ?? 0,
        vacantes: data.coberturas ?? 0,
        postulantes: data.postulantes ?? 0,
        promedio: data.promedio ?? 0,
      })
      .select()
      .single();
    if (error) {
      console.error("Error creating cobertura evento:", error);
      throw new Error("Failed to create cobertura evento");
    }
    return {
      id: String(created.id),
      llamado: created.llamado || "",
      juntaClasificacion: created.junta_clasificacion || "",
      tipo: created.tipo || "",
      fecha: created.fecha || "",
      establecimientos: Number(created.establecimiento) || 0,
      coberturas: Number(created.vacantes) || 0,
      postulantes: Number(created.postulantes) || 0,
      promedio: Number(created.promedio) || 0,
    };
  }

  async updateCoberturaEvento(id: string, data: InsertCoberturaEvento): Promise<CoberturaEvento | undefined> {
    const { data: updated, error } = await supabase
      .from("llamados_cobertura")
      .update({
        llamado: data.llamado,
        junta_clasificacion: data.juntaClasificacion,
        tipo: data.tipo,
        fecha: data.fecha,
        establecimiento: data.establecimientos ?? 0,
        vacantes: data.coberturas ?? 0,
        postulantes: data.postulantes ?? 0,
        promedio: data.promedio ?? 0,
      })
      .eq("id", parseInt(id))
      .select()
      .single();
    if (error) {
      console.error("Error updating cobertura evento:", error);
      return undefined;
    }
    if (!updated) return undefined;
    return {
      id: String(updated.id),
      llamado: updated.llamado || "",
      juntaClasificacion: updated.junta_clasificacion || "",
      tipo: updated.tipo || "",
      fecha: updated.fecha || "",
      establecimientos: Number(updated.establecimiento) || 0,
      coberturas: Number(updated.vacantes) || 0,
      postulantes: Number(updated.postulantes) || 0,
      promedio: Number(updated.promedio) || 0,
    };
  }

  async deleteCoberturaEvento(id: string): Promise<boolean> {
    const { error } = await supabase.from("llamados_cobertura").delete().eq("id", parseInt(id));
    if (error) {
      console.error("Error deleting cobertura evento:", error);
      return false;
    }
    return true;
  }

  async getCoberturaDetalles(): Promise<CoberturaDetalle[]> {
    return Array.from(this.coberturaDetalles.values());
  }

  async getCoberturaDetalle(id: string): Promise<CoberturaDetalle | undefined> {
    return this.coberturaDetalles.get(id);
  }

  async createCoberturaDetalle(data: InsertCoberturaDetalle): Promise<CoberturaDetalle> {
    const id = crypto.randomUUID();
    const detalle: CoberturaDetalle = { id, ...data };
    this.coberturaDetalles.set(id, detalle);
    return detalle;
  }

  async updateCoberturaDetalle(id: string, data: InsertCoberturaDetalle): Promise<CoberturaDetalle | undefined> {
    const existing = this.coberturaDetalles.get(id);
    if (!existing) return undefined;
    const updated: CoberturaDetalle = { id, ...data };
    this.coberturaDetalles.set(id, updated);
    return updated;
  }

  async deleteCoberturaDetalle(id: string): Promise<boolean> {
    return this.coberturaDetalles.delete(id);
  }

  async getTitularizacionEstadisticas(): Promise<TitularizacionEstadistica[]> {
    return Array.from(this.titularizacionEstadisticas.values());
  }

  async getTitularizacionEstadistica(id: string): Promise<TitularizacionEstadistica | undefined> {
    return this.titularizacionEstadisticas.get(id);
  }

  async createTitularizacionEstadistica(data: InsertTitularizacionEstadistica): Promise<TitularizacionEstadistica> {
    const id = crypto.randomUUID();
    const estadistica: TitularizacionEstadistica = { id, tipo: data.tipo, juntaClasificacion: data.juntaClasificacion, cantidad: data.cantidad ?? 0 };
    this.titularizacionEstadisticas.set(id, estadistica);
    return estadistica;
  }

  async getTitularizacionRegistros(): Promise<TitularizacionRegistro[]> {
    return Array.from(this.titularizacionRegistros.values());
  }

  async getTitularizacionRegistro(id: string): Promise<TitularizacionRegistro | undefined> {
    return this.titularizacionRegistros.get(id);
  }

  async createTitularizacionRegistro(data: InsertTitularizacionRegistro): Promise<TitularizacionRegistro> {
    const id = crypto.randomUUID();
    const registro: TitularizacionRegistro = { id, ...data, renunciaA: data.renunciaA ?? null };
    this.titularizacionRegistros.set(id, registro);
    return registro;
  }
}

export const storage = new MemStorage();
