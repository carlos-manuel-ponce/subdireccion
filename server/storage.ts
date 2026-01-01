import { type User, type InsertUser, type Expediente, type InsertExpediente, SOLICITUD_TYPES, ESTADO_TYPES } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllExpedientes(): Promise<Expediente[]>;
  getExpediente(id: string): Promise<Expediente | undefined>;
  createExpediente(data: InsertExpediente): Promise<Expediente>;
  updateExpediente(id: string, data: InsertExpediente): Promise<Expediente | undefined>;
  deleteExpediente(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private expedientes: Map<string, Expediente>;

  constructor() {
    this.users = new Map();
    this.expedientes = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleData: InsertExpediente[] = [
      {
        expediente: "1234567/26",
        solicita: "CREACIÓN DE CARGO",
        establecimiento: "Escuela Primaria N° 45",
        estado: "INICIAL",
        comentario: "Solicitud de cargo docente para turno mañana",
      },
      {
        expediente: "2345678/26",
        solicita: "CREACIÓN DE DIVISIÓN",
        establecimiento: "Instituto Superior N° 12",
        estado: "SECUNDARIO",
        comentario: "Apertura de nueva división por incremento de matrícula",
      },
      {
        expediente: "3456789/26",
        solicita: "CAMBIO DE ESTRUCTURA CURRICULAR",
        establecimiento: "Colegio N° 8",
        estado: "LEGAL Y TÉCNICA",
        comentario: "",
      },
      {
        expediente: "4567890/26",
        solicita: "CREACIÓN DE SALA DE 3 AÑOS",
        establecimiento: "Jardín de Infantes N° 23",
        estado: "GESTIÓN",
        comentario: "Demanda de la comunidad educativa",
      },
      {
        expediente: "5678901/26",
        solicita: "CREACIÓN DE CARGO DE PRECEPTOR",
        establecimiento: "Escuela Secundaria N° 15",
        estado: "FIRMA MINISTRO",
        comentario: "Aprobado por todas las instancias",
      },
      {
        expediente: "6789012/26",
        solicita: "APERTURA DE SECCIÓN",
        establecimiento: "Escuela Técnica N° 3",
        estado: "HACIENDA",
        comentario: "Pendiente aprobación presupuestaria",
      },
      {
        expediente: "7890123/26",
        solicita: "CONVERSIÓN DE CARGO",
        establecimiento: "Escuela Primaria N° 78",
        estado: "DESPACHO",
        comentario: "Conversión de maestro a maestro secretario",
      },
      {
        expediente: "8901234/26",
        solicita: "CREACIÓN DE CARGO DE REGENTE",
        establecimiento: "Instituto N° 5",
        estado: "OBLIGATORIA",
        comentario: "",
      },
      {
        expediente: "9012345/26",
        solicita: "CIERRE PROVISORIO DE ESTABLECIMIENTO",
        establecimiento: "Escuela Rural N° 102",
        estado: "INFRAESTRUCTURA",
        comentario: "Evaluación de infraestructura edilicia",
      },
      {
        expediente: "0123456/26",
        solicita: "CREACIÓN DE CICLO ORIENTADO",
        establecimiento: "Escuela Secundaria N° 28",
        estado: "INNOVACIÓN",
        comentario: "Implementación de nueva orientación curricular",
      },
      {
        expediente: "1122334/26",
        solicita: "INDEPENDIZACIÓN DEL NIVEL INICIAL",
        establecimiento: "Jardín anexo a EP N° 56",
        estado: "LIQUIDACIONES",
        comentario: "Tramitación de cargos",
      },
      {
        expediente: "2233445/26",
        solicita: "CREACIÓN DE CARGO DE ASESOR PEDAGÓGICO",
        establecimiento: "Escuela Especial N° 4",
        estado: "FIRMA INT.",
        comentario: "Última instancia de aprobación",
      },
    ];

    sampleData.forEach((data) => {
      const id = randomUUID();
      this.expedientes.set(id, { ...data, id, comentario: data.comentario || "" });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllExpedientes(): Promise<Expediente[]> {
    return Array.from(this.expedientes.values());
  }

  async getExpediente(id: string): Promise<Expediente | undefined> {
    return this.expedientes.get(id);
  }

  async createExpediente(data: InsertExpediente): Promise<Expediente> {
    const id = randomUUID();
    const expediente: Expediente = {
      id,
      expediente: data.expediente,
      solicita: data.solicita,
      establecimiento: data.establecimiento,
      estado: data.estado,
      comentario: data.comentario || "",
    };
    this.expedientes.set(id, expediente);
    return expediente;
  }

  async updateExpediente(id: string, data: InsertExpediente): Promise<Expediente | undefined> {
    const existing = this.expedientes.get(id);
    if (!existing) return undefined;
    
    const updated: Expediente = {
      ...existing,
      expediente: data.expediente,
      solicita: data.solicita,
      establecimiento: data.establecimiento,
      estado: data.estado,
      comentario: data.comentario || "",
    };
    this.expedientes.set(id, updated);
    return updated;
  }

  async deleteExpediente(id: string): Promise<boolean> {
    return this.expedientes.delete(id);
  }
}

export const storage = new MemStorage();
