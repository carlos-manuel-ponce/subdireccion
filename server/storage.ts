import {
  type Expediente,
  type InsertExpediente,
  type CoberturaRegistro,
  type InsertCoberturaRegistro,
  type CoberturaEvento,
  type InsertCoberturaEvento,
  type CoberturaDetalle,
  type InsertCoberturaDetalle,
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private expedientes: Map<string, Expediente> = new Map();
  private coberturaRegistros: Map<string, CoberturaRegistro> = new Map();
  private coberturaEventos: Map<string, CoberturaEvento> = new Map();
  private coberturaDetalles: Map<string, CoberturaDetalle> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const sampleExpedientes: Expediente[] = [
      { id: crypto.randomUUID(), expediente: "1234567/26", solicita: "CIERRE PROVISORIO DE ESTABLECIMIENTO", establecimiento: "Escuela N° 123", estado: "INICIAL", comentario: "Pendiente de revisión" },
      { id: crypto.randomUUID(), expediente: "2345678/26", solicita: "APERTURA DE DIVISIONES", establecimiento: "Colegio San Martín", estado: "SECUNDARIO", comentario: "" },
      { id: crypto.randomUUID(), expediente: "3456789/26", solicita: "CREACIÓN Y LOCALIZACIÓN DE CARGOS", establecimiento: "Instituto Técnico N° 45", estado: "LEGAL Y TÉCNICA", comentario: "En proceso" },
      { id: crypto.randomUUID(), expediente: "4567890/26", solicita: "CAMBIO DE DENOMINACIÓN", establecimiento: "Escuela Rural N° 78", estado: "DESPACHO", comentario: "" },
      { id: crypto.randomUUID(), expediente: "5678901/26", solicita: "FUSIÓN DE ESTABLECIMIENTOS", establecimiento: "Jardín de Infantes N° 12", estado: "FIRMA MINISTRO", comentario: "Esperando firma" },
      { id: crypto.randomUUID(), expediente: "6789012/26", solicita: "AMPLIACIÓN DE ESTRUCTURA CURRICULAR", establecimiento: "Escuela Técnica N° 34", estado: "HACIENDA", comentario: "" },
      { id: crypto.randomUUID(), expediente: "7890123/26", solicita: "REORGANIZACIÓN DE CARGOS", establecimiento: "Colegio Nacional N° 5", estado: "GESTIÓN", comentario: "Análisis en curso" },
      { id: crypto.randomUUID(), expediente: "8901234/26", solicita: "CREACIÓN DE ANEXOS", establecimiento: "Escuela Provincial N° 89", estado: "INNOVACIÓN", comentario: "" },
      { id: crypto.randomUUID(), expediente: "9012345/26", solicita: "CAMBIO DE NIVEL DE JORNADA", establecimiento: "Instituto Superior N° 2", estado: "INFRAESTRUCTURA", comentario: "" },
      { id: crypto.randomUUID(), expediente: "0123456/26", solicita: "TRASLADO DE ESTABLECIMIENTO EDUCATIVO", establecimiento: "Escuela Especial N° 7", estado: "OBLIGATORIA", comentario: "Documentación completa" },
      { id: crypto.randomUUID(), expediente: "1122334/26", solicita: "READECUACIÓN DE POF", establecimiento: "Colegio Secundario N° 15", estado: "LIQUIDACIONES", comentario: "" },
      { id: crypto.randomUUID(), expediente: "2233445/26", solicita: "CIERRE DE DIVISIONES", establecimiento: "Escuela Primaria N° 200", estado: "FIRMA INT.", comentario: "Revisión final" },
    ];

    sampleExpedientes.forEach((exp) => {
      this.expedientes.set(exp.id, exp);
    });

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

    const sampleEventos: CoberturaEvento[] = [
      { id: crypto.randomUUID(), llamado: "Llamado 1/2026", juntaClasificacion: "INICIAL Y PRIMARIA", tipo: "SUPLENCIA", fecha: "2026-01-15", establecimientos: 25, coberturas: 18, postulantes: 45, promedio: 2.5 },
      { id: crypto.randomUUID(), llamado: "Llamado 2/2026", juntaClasificacion: "SECUNDARIA", tipo: "INTERINATO", fecha: "2026-01-20", establecimientos: 32, coberturas: 28, postulantes: 67, promedio: 2.4 },
      { id: crypto.randomUUID(), llamado: "Llamado 3/2026", juntaClasificacion: "INICIAL Y PRIMARIA", tipo: "TITULAR", fecha: "2026-02-01", establecimientos: 15, coberturas: 12, postulantes: 35, promedio: 2.9 },
      { id: crypto.randomUUID(), llamado: "Llamado 4/2026", juntaClasificacion: "SECUNDARIA", tipo: "SUPLENCIA", fecha: "2026-02-10", establecimientos: 40, coberturas: 35, postulantes: 89, promedio: 2.5 },
      { id: crypto.randomUUID(), llamado: "Llamado 5/2026", juntaClasificacion: "INICIAL Y PRIMARIA", tipo: "INTERINATO", fecha: "2026-02-15", establecimientos: 28, coberturas: 22, postulantes: 56, promedio: 2.5 },
    ];

    sampleEventos.forEach((evt) => {
      this.coberturaEventos.set(evt.id, evt);
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
  }

  async getExpedientes(): Promise<Expediente[]> {
    return Array.from(this.expedientes.values());
  }

  async getExpediente(id: string): Promise<Expediente | undefined> {
    return this.expedientes.get(id);
  }

  async createExpediente(data: InsertExpediente): Promise<Expediente> {
    const id = crypto.randomUUID();
    const expediente: Expediente = { id, expediente: data.expediente, solicita: data.solicita, establecimiento: data.establecimiento, estado: data.estado, comentario: data.comentario ?? "" };
    this.expedientes.set(id, expediente);
    return expediente;
  }

  async updateExpediente(id: string, data: InsertExpediente): Promise<Expediente | undefined> {
    const existing = this.expedientes.get(id);
    if (!existing) return undefined;
    const updated: Expediente = { id, expediente: data.expediente, solicita: data.solicita, establecimiento: data.establecimiento, estado: data.estado, comentario: data.comentario ?? "" };
    this.expedientes.set(id, updated);
    return updated;
  }

  async deleteExpediente(id: string): Promise<boolean> {
    return this.expedientes.delete(id);
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
    return Array.from(this.coberturaEventos.values());
  }

  async getCoberturaEvento(id: string): Promise<CoberturaEvento | undefined> {
    return this.coberturaEventos.get(id);
  }

  async createCoberturaEvento(data: InsertCoberturaEvento): Promise<CoberturaEvento> {
    const id = crypto.randomUUID();
    const evento: CoberturaEvento = { id, llamado: data.llamado, juntaClasificacion: data.juntaClasificacion, tipo: data.tipo, fecha: data.fecha, establecimientos: data.establecimientos ?? 0, coberturas: data.coberturas ?? 0, postulantes: data.postulantes ?? 0, promedio: data.promedio ?? 0 };
    this.coberturaEventos.set(id, evento);
    return evento;
  }

  async updateCoberturaEvento(id: string, data: InsertCoberturaEvento): Promise<CoberturaEvento | undefined> {
    const existing = this.coberturaEventos.get(id);
    if (!existing) return undefined;
    const updated: CoberturaEvento = { id, llamado: data.llamado, juntaClasificacion: data.juntaClasificacion, tipo: data.tipo, fecha: data.fecha, establecimientos: data.establecimientos ?? 0, coberturas: data.coberturas ?? 0, postulantes: data.postulantes ?? 0, promedio: data.promedio ?? 0 };
    this.coberturaEventos.set(id, updated);
    return updated;
  }

  async deleteCoberturaEvento(id: string): Promise<boolean> {
    return this.coberturaEventos.delete(id);
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
}

export const storage = new MemStorage();
