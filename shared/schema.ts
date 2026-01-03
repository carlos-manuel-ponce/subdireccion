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

// Nomenclador de Ubicaciones (13 ubicaciones)
export const UBICACION_TYPES = [
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
  "FINALIZADO",
] as const;

export type UbicacionType = (typeof UBICACION_TYPES)[number];

// Nomenclador de Regiones Educativas
export const REGION_TYPES = ["I", "II", "III", "IV", "V", "VI"] as const;
export type RegionType = (typeof REGION_TYPES)[number];

// Nomenclador de Nivel para Cobertura
export const NIVEL_COBERTURA_TYPES = ["INICIAL Y PRIMARIO", "SECUNDARIO"] as const;
export type NivelCoberturaType = (typeof NIVEL_COBERTURA_TYPES)[number];

// Nomenclador de Región y Nivel combinados
export const REGION_NIVEL_TYPES = [
  "Region I y VI - Primario",
  "Region I y VI - Secundario",
  "Region II y III - Primario",
  "Region II y III - Secundario",
  "Region IV y V - Primario",
  "Region IV y V - Secundario",
] as const;
export type RegionNivelType = (typeof REGION_NIVEL_TYPES)[number];

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
export const MODULE_TYPES = ["CREACIONES", "COBERTURA", "TITULARIZACIONES"] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

// Nomenclador de Tipos de Titularización
export const TITULARIZACION_TYPES = [
  "ASESOR PEDAGÓGICO",
  "HORAS",
  "CARGOS",
  "MAESTRA DE NIVEL INICIAL",
  "MAESTRA DE NIVEL INICIAL CON RENUNCIA",
  "SECRETARIO",
  "SECRETARIO CON RENUNCIA",
  "DIRECTOR DE PERSONAL ÚNICO",
  "DIRECTOR DE PERSONAL ÚNICO CON RENUNCIA",
  "DIRECTOR DE 3RA. CATEGORÍA",
  "DIRECTOR DE 3RA. CATEGORÍA CON RENUNCIA",
] as const;
export type TitularizacionType = (typeof TITULARIZACION_TYPES)[number];

// ==================== TABLAS ====================

// Tabla de Expedientes (módulo CREACIONES)
export const expedientes = pgTable("expedientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  expediente: text("expediente").notNull(),
  solicita: text("solicita").notNull(),
  establecimiento: text("establecimiento").notNull(),
  ubicacion: text("ubicacion").notNull(),
  comentario: text("comentario").notNull().default(""),
});

// Tabla de Registros de Cobertura (módulo COBERTURA DE CARGOS)
export const coberturaRegistros = pgTable("cobertura_registros", {
  id: uuid("id").primaryKey().defaultRandom(),
  llamado: text("llamado").notNull(),
  regionNivel: text("region_nivel").notNull(),
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

// Tabla de Estadísticas de Titularizaciones
export const titularizacionEstadisticas = pgTable("titularizacion_estadisticas", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: text("tipo").notNull(),
  juntaClasificacion: text("junta_clasificacion").notNull(),
  cantidad: integer("cantidad").notNull().default(0),
});

// Tabla de Registros de Titularizaciones (para buscador)
export const titularizacionRegistros = pgTable("titularizacion_registros", {
  id: uuid("id").primaryKey().defaultRandom(),
  expediente: text("expediente").notNull(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  dni: text("dni").notNull(),
  establecimiento: text("establecimiento").notNull(),
  localidad: text("localidad").notNull(),
  departamento: text("departamento").notNull(),
  juntaClasificacion: text("junta_clasificacion").notNull(),
  renunciaA: text("renuncia_a"),
  titularizarEn: text("titularizar_en").notNull(),
});

// Titularización Estadísticas
export const insertTitularizacionEstadisticaSchema = createInsertSchema(titularizacionEstadisticas).omit({ id: true });
export type InsertTitularizacionEstadistica = z.infer<typeof insertTitularizacionEstadisticaSchema>;
export type TitularizacionEstadistica = typeof titularizacionEstadisticas.$inferSelect;

// Titularización Registros
export const insertTitularizacionRegistroSchema = createInsertSchema(titularizacionRegistros).omit({ id: true });
export type InsertTitularizacionRegistro = z.infer<typeof insertTitularizacionRegistroSchema>;
export type TitularizacionRegistro = typeof titularizacionRegistros.$inferSelect;

// Login Schema
export const loginSchema = z.object({
  module: z.enum(MODULE_TYPES),
  pin: z.string().length(4),
});
export type LoginRequest = z.infer<typeof loginSchema>;
