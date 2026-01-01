import { pgTable, text, uuid, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== NOMENCLADORES ====================

// Nomenclador de Solicitud (25 tipos)
export const SOLICITUD_TYPES = [
  "CIERRE PROVISORIO DE ESTABLECIMIENTO",
  "CIERRE DE DIVISIONES",
  "CAMBIO DE ESTRUCTURA CURRICULAR",
  "AMPLIACIÓN DE ESTRUCTURA CURRICULAR",
  "APERTURA DE DIVISIONES",
  "REORGANIZACIÓN DE DIVISIONES",
  "APERTURAS DE PRIMERAS DIVISIONES (NUEVAS OFERTAS EDUCATIVAS)",
  "CAMBIO DE NIVEL DE JORNADA",
  "CREACIÓN Y LOCALIZACIÓN DE CARGOS",
  "REORGANIZACIÓN DE JORNADA",
  "CAMBIO DE DENOMINACIÓN",
  "CONVENIOS",
  "REUBICACIÓN DE EDIFICIO",
  "TRASLADO DE ESTABLECIMIENTO EDUCATIVO",
  "CAMBIO DE ESTADO DE JARDINES MATERNALES",
  "CREACIÓN DE ANEXOS",
  "CREACIÓN DE EXTENSIONES ÁULICAS",
  "CREACIÓN DE SECCIÓN INDEPENDIENTE",
  "NUEVA LOCALIZACIÓN",
  "REORGANIZACIÓN DE CARGOS",
  "FUSIÓN DE ESTABLECIMIENTOS",
  "READECUACIÓN DE POF",
  "TRANSFORMACIONES DE OFERTAS EDUCATIVAS",
  "RECONVERSIONES DE OFERTAS EDUCATIVAS",
  "CIERRE DEFINITIVO DE ESTABLECIMIENTO",
] as const;

export type SolicitudType = (typeof SOLICITUD_TYPES)[number];

// Nomenclador de Estados (12 estados)
export const ESTADO_TYPES = [
  "INICIAL",
  "SECUNDARIO",
  "OBLIGATORIA",
  "LIQUIDACIONES",
  "LEGAL Y TÉCNICA",
  "DESPACHO",
  "INNOVACIÓN",
  "INFRAESTRUCTURA",
  "GESTIÓN",
  "HACIENDA",
  "FIRMA MINISTRO",
  "FIRMA INT.",
] as const;

export type EstadoType = (typeof ESTADO_TYPES)[number];

// Nomenclador de Regiones Educativas
export const REGION_TYPES = ["I", "II", "III", "IV", "V", "VI"] as const;
export type RegionType = (typeof REGION_TYPES)[number];

// Nomenclador de Nivel para Cobertura
export const NIVEL_COBERTURA_TYPES = ["INICIAL Y PRIMARIO", "SECUNDARIO"] as const;
export type NivelCoberturaType = (typeof NIVEL_COBERTURA_TYPES)[number];

// Nomenclador de Responsables
export const RESPONSABLE_TYPES = [
  "YANINA VARGAS",
  "NOELIA VILLA",
  "LAURA MORALES",
  "AXEL CABRERA",
] as const;
export type ResponsableType = (typeof RESPONSABLE_TYPES)[number];

// Nomenclador de Tipos para Estadísticas
export const TIPO_ESTADISTICA_TYPES = ["SUPLENCIA", "INTERINATO", "TITULAR"] as const;
export type TipoEstadisticaType = (typeof TIPO_ESTADISTICA_TYPES)[number];

// Nomenclador de Juntas de Clasificación
export const JUNTA_TYPES = ["INICIAL Y PRIMARIA", "SECUNDARIA"] as const;
export type JuntaType = (typeof JUNTA_TYPES)[number];

// Nomenclador de Módulos para Login
export const MODULE_TYPES = ["CREACIONES", "COBERTURA"] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

// ==================== TABLAS ====================

// Tabla de Expedientes (módulo CREACIONES)
export const expedientes = pgTable("expedientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  expediente: text("expediente").notNull(),
  solicita: text("solicita").notNull(),
  establecimiento: text("establecimiento").notNull(),
  estado: text("estado").notNull(),
  comentario: text("comentario").notNull().default(""),
});

// Tabla de Registros de Cobertura (módulo COBERTURA DE CARGOS)
export const coberturaRegistros = pgTable("cobertura_registros", {
  id: uuid("id").primaryKey().defaultRandom(),
  region: text("region").notNull(),
  nivel: text("nivel").notNull(),
  responsable: text("responsable").notNull(),
  expediente: text("expediente").notNull(),
  pedidoFileName: text("pedido_file_name"),
  pedidoFilePath: text("pedido_file_path"),
});

// Tabla de Eventos para Dashboard 1 (estadísticas de coberturas)
export const coberturaEventos = pgTable("cobertura_eventos", {
  id: uuid("id").primaryKey().defaultRandom(),
  llamado: text("llamado").notNull(),
  juntaClasificacion: text("junta_clasificacion").notNull(),
  tipo: text("tipo").notNull(),
  fecha: text("fecha").notNull(),
  establecimientos: integer("establecimientos").notNull().default(0),
  coberturas: integer("coberturas").notNull().default(0),
  postulantes: integer("postulantes").notNull().default(0),
  promedio: real("promedio").notNull().default(0),
});

// Tabla de Detalles para Dashboard 2 (búsqueda completa)
export const coberturaDetalles = pgTable("cobertura_detalles", {
  id: uuid("id").primaryKey().defaultRandom(),
  llamado: text("llamado").notNull(),
  tipo: text("tipo").notNull(),
  fecha: text("fecha").notNull(),
  juntaClasificacion: text("junta_clasificacion").notNull(),
  region: text("region").notNull(),
  localidad: text("localidad").notNull(),
  establecimiento: text("establecimiento").notNull(),
  nivel: text("nivel").notNull(),
  caracter: text("caracter").notNull(),
  descripcion: text("descripcion").notNull(),
  apellido: text("apellido").notNull(),
  nombre: text("nombre").notNull(),
  dni: text("dni").notNull(),
  habilitacion: text("habilitacion").notNull(),
});

// ==================== SCHEMAS Y TIPOS ====================

// Expedientes
export const insertExpedienteSchema = createInsertSchema(expedientes).omit({ id: true });
export type InsertExpediente = z.infer<typeof insertExpedienteSchema>;
export type Expediente = typeof expedientes.$inferSelect;

// Cobertura Registros
export const insertCoberturaRegistroSchema = createInsertSchema(coberturaRegistros).omit({ id: true });
export type InsertCoberturaRegistro = z.infer<typeof insertCoberturaRegistroSchema>;
export type CoberturaRegistro = typeof coberturaRegistros.$inferSelect;

// Cobertura Eventos (Dashboard 1)
export const insertCoberturaEventoSchema = createInsertSchema(coberturaEventos).omit({ id: true });
export type InsertCoberturaEvento = z.infer<typeof insertCoberturaEventoSchema>;
export type CoberturaEvento = typeof coberturaEventos.$inferSelect;

// Cobertura Detalles (Dashboard 2)
export const insertCoberturaDetalleSchema = createInsertSchema(coberturaDetalles).omit({ id: true });
export type InsertCoberturaDetalle = z.infer<typeof insertCoberturaDetalleSchema>;
export type CoberturaDetalle = typeof coberturaDetalles.$inferSelect;

// Login Schema
export const loginSchema = z.object({
  module: z.enum(MODULE_TYPES),
  pin: z.string().length(4),
});
export type LoginRequest = z.infer<typeof loginSchema>;
