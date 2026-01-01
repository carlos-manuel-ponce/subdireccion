import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const SOLICITUD_TYPES = [
  "CIERRE PROVISORIO DE ESTABLECIMIENTO",
  "CIERRE DE DIVISIONES",
  "CAMBIO DE ESTRUCTURA CURRICULAR",
  "CAMBIO DE ESTRUCTURA CURRICULAR / MODALIDAD JÓVENES Y ADULTOS",
  "CAMBIO DE CATEGORÍA",
  "CAMBIO DE DENOMINACIÓN DE ESPACIO CURRICULAR",
  "CREACIÓN DE CARGO",
  "CONVERSIÓN DE CARGO",
  "CREACIÓN DE CARGO DE REGENTE",
  "CREACIÓN DE CARGO DE SECRETARIO",
  "CREACIÓN DE CARGO DE MAESTRO SECRETARIO",
  "CREACIÓN DE CARGO DE PRECEPTOR",
  "CREACIÓN DE CARGO DE ASESOR PEDAGÓGICO",
  "CREACIÓN DE CARGO DE MAESTRO ESPECIAL",
  "CREACIÓN DE CARGO DE MAESTRO DE GRADO ESPECIAL",
  "CREACIÓN DE CARGO DE MAESTRO ESPECIAL / PERFIL FONOAUDIÓLOGO",
  "CREACIÓN DE SALA DE 3 AÑOS",
  "CREACIÓN DE SALA DE 3 AÑOS / MULTIEDAD",
  "FUSIÓN DE SALA DE 3 AÑOS",
  "CREACIÓN Y FUSIÓN DE SALAS DE 3 Y 4 AÑOS",
  "CREACIÓN DE SALA DE 3 AÑOS POR FUSIÓN",
  "APERTURA DE SECCIÓN",
  "CREACIÓN DE DIVISIÓN",
  "CREACIÓN DE CICLO ORIENTADO",
  "INDEPENDIZACIÓN DEL NIVEL INICIAL",
] as const;

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

export type SolicitudType = typeof SOLICITUD_TYPES[number];
export type EstadoType = typeof ESTADO_TYPES[number];

export interface Expediente {
  id: string;
  expediente: string;
  solicita: SolicitudType;
  establecimiento: string;
  estado: EstadoType;
  comentario: string;
}

export const insertExpedienteSchema = z.object({
  expediente: z.string().min(1, "El expediente es requerido").regex(/^\d{7}\/\d{2}$/, "Formato: 1234567/26"),
  solicita: z.enum(SOLICITUD_TYPES),
  establecimiento: z.string().min(1, "El establecimiento es requerido"),
  estado: z.enum(ESTADO_TYPES),
  comentario: z.string().optional().default(""),
});

export type InsertExpediente = z.infer<typeof insertExpedienteSchema>;
