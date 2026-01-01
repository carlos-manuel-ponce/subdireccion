import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpedienteSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all expedientes
  app.get("/api/expedientes", async (req, res) => {
    try {
      const expedientes = await storage.getAllExpedientes();
      res.json(expedientes);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los expedientes" });
    }
  });

  // Get single expediente
  app.get("/api/expedientes/:id", async (req, res) => {
    try {
      const expediente = await storage.getExpediente(req.params.id);
      if (!expediente) {
        return res.status(404).json({ message: "Expediente no encontrado" });
      }
      res.json(expediente);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el expediente" });
    }
  });

  // Create expediente
  app.post("/api/expedientes", async (req, res) => {
    try {
      const result = insertExpedienteSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      const expediente = await storage.createExpediente(result.data);
      res.status(201).json(expediente);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el expediente" });
    }
  });

  // Update expediente
  app.put("/api/expedientes/:id", async (req, res) => {
    try {
      const result = insertExpedienteSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      const expediente = await storage.updateExpediente(req.params.id, result.data);
      if (!expediente) {
        return res.status(404).json({ message: "Expediente no encontrado" });
      }
      res.json(expediente);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el expediente" });
    }
  });

  // Delete expediente
  app.delete("/api/expedientes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteExpediente(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Expediente no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el expediente" });
    }
  });

  return httpServer;
}
