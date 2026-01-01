import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { storage } from "./storage";
import {
  insertExpedienteSchema,
  insertCoberturaRegistroSchema,
  insertCoberturaEventoSchema,
  insertCoberturaDetalleSchema,
  loginSchema,
  type CoberturaDetalle,
} from "@shared/schema";
import { fromError } from "zod-validation-error";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: multerStorage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos Word (.doc, .docx)"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// PIN credentials
const PIN_CREDENTIALS: Record<string, string> = {
  CREACIONES: "1111",
  COBERTURA: "1212",
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== AUTH ====================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).message });
      }

      const { module, pin } = result.data;
      const correctPin = PIN_CREDENTIALS[module];

      if (pin !== correctPin) {
        return res.status(401).json({ error: "PIN incorrecto" });
      }

      res.json({ success: true, module });
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ==================== EXPEDIENTES (CREACIONES) ====================
  app.get("/api/expedientes", async (_req, res) => {
    const expedientes = await storage.getExpedientes();
    res.json(expedientes);
  });

  app.get("/api/expedientes/:id", async (req, res) => {
    const expediente = await storage.getExpediente(req.params.id);
    if (!expediente) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }
    res.json(expediente);
  });

  app.post("/api/expedientes", async (req, res) => {
    const result = insertExpedienteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromError(result.error).message });
    }
    const expediente = await storage.createExpediente(result.data);
    res.status(201).json(expediente);
  });

  app.put("/api/expedientes/:id", async (req, res) => {
    const result = insertExpedienteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromError(result.error).message });
    }
    const expediente = await storage.updateExpediente(req.params.id, result.data);
    if (!expediente) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }
    res.json(expediente);
  });

  app.delete("/api/expedientes/:id", async (req, res) => {
    const deleted = await storage.deleteExpediente(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Expediente no encontrado" });
    }
    res.status(204).send();
  });

  // ==================== COBERTURA REGISTROS ====================
  app.get("/api/cobertura/registros", async (_req, res) => {
    const registros = await storage.getCoberturaRegistros();
    res.json(registros);
  });

  app.get("/api/cobertura/registros/:id", async (req, res) => {
    const registro = await storage.getCoberturaRegistro(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    res.json(registro);
  });

  app.post("/api/cobertura/registros", upload.single("pedido"), async (req, res) => {
    try {
      const data = {
        region: req.body.region,
        nivel: req.body.nivel,
        responsable: req.body.responsable,
        expediente: req.body.expediente,
        pedidoFileName: req.file ? req.file.originalname : null,
        pedidoFilePath: req.file ? req.file.filename : null,
      };

      const result = insertCoberturaRegistroSchema.safeParse(data);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).message });
      }

      const registro = await storage.createCoberturaRegistro(result.data);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el registro" });
    }
  });

  app.put("/api/cobertura/registros/:id", upload.single("pedido"), async (req, res) => {
    try {
      const existing = await storage.getCoberturaRegistro(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const data = {
        region: req.body.region,
        nivel: req.body.nivel,
        responsable: req.body.responsable,
        expediente: req.body.expediente,
        pedidoFileName: req.file ? req.file.originalname : (req.body.keepFile === "true" ? existing.pedidoFileName : null),
        pedidoFilePath: req.file ? req.file.filename : (req.body.keepFile === "true" ? existing.pedidoFilePath : null),
      };

      const result = insertCoberturaRegistroSchema.safeParse(data);
      if (!result.success) {
        return res.status(400).json({ error: fromError(result.error).message });
      }

      const registro = await storage.updateCoberturaRegistro(req.params.id, result.data);
      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el registro" });
    }
  });

  app.delete("/api/cobertura/registros/:id", async (req, res) => {
    const deleted = await storage.deleteCoberturaRegistro(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    res.status(204).send();
  });

  // File download
  app.get("/api/cobertura/registros/:id/download", async (req, res) => {
    const registro = await storage.getCoberturaRegistro(req.params.id);
    if (!registro || !registro.pedidoFilePath) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const filePath = path.join(uploadsDir, registro.pedidoFilePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.download(filePath, registro.pedidoFileName || "documento.docx");
  });

  // ==================== COBERTURA EVENTOS (Dashboard 1) ====================
  app.get("/api/cobertura/eventos", async (_req, res) => {
    const eventos = await storage.getCoberturaEventos();
    res.json(eventos);
  });

  app.get("/api/cobertura/eventos/:id", async (req, res) => {
    const evento = await storage.getCoberturaEvento(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    res.json(evento);
  });

  app.post("/api/cobertura/eventos", async (req, res) => {
    const result = insertCoberturaEventoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromError(result.error).message });
    }
    const evento = await storage.createCoberturaEvento(result.data);
    res.status(201).json(evento);
  });

  app.put("/api/cobertura/eventos/:id", async (req, res) => {
    const result = insertCoberturaEventoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromError(result.error).message });
    }
    const evento = await storage.updateCoberturaEvento(req.params.id, result.data);
    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    res.json(evento);
  });

  app.delete("/api/cobertura/eventos/:id", async (req, res) => {
    const deleted = await storage.deleteCoberturaEvento(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    res.status(204).send();
  });

  // ==================== COBERTURA DETALLES (Dashboard 2) ====================
  app.get("/api/cobertura/detalles", async (_req, res) => {
    const detalles = await storage.getCoberturaDetalles();
    res.json(detalles);
  });

  app.get("/api/cobertura/detalles/:id", async (req, res) => {
    const detalle = await storage.getCoberturaDetalle(req.params.id);
    if (!detalle) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }
    res.json(detalle);
  });

  app.post("/api/cobertura/detalles", async (req, res) => {
    const result = insertCoberturaDetalleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromError(result.error).message });
    }
    const detalle = await storage.createCoberturaDetalle(result.data);
    res.status(201).json(detalle);
  });

  app.put("/api/cobertura/detalles/:id", async (req, res) => {
    const result = insertCoberturaDetalleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: fromError(result.error).message });
    }
    const detalle = await storage.updateCoberturaDetalle(req.params.id, result.data);
    if (!detalle) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }
    res.json(detalle);
  });

  app.delete("/api/cobertura/detalles/:id", async (req, res) => {
    const deleted = await storage.deleteCoberturaDetalle(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }
    res.status(204).send();
  });

  // ==================== PDF GENERATION ====================
  app.post("/api/cobertura/detalles/report", async (req, res) => {
    try {
      const { establecimiento, detalles } = req.body as { establecimiento?: string; detalles: CoberturaDetalle[] };

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-cobertura-${Date.now()}.pdf`);

      doc.pipe(res);

      // Header
      doc.fontSize(18).text("INFORME DE COBERTURA DE CARGOS", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString("es-AR")}`, { align: "center" });

      if (establecimiento) {
        doc.moveDown();
        doc.fontSize(14).text(`Establecimiento: ${establecimiento}`, { align: "left" });
      }

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Data table
      if (detalles && detalles.length > 0) {
        doc.fontSize(12).text(`Total de registros: ${detalles.length}`, { align: "left" });
        doc.moveDown();

        detalles.forEach((detalle, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          doc.fontSize(10)
            .text(`${index + 1}. ${detalle.establecimiento}`, { continued: false })
            .text(`   Llamado: ${detalle.llamado} | Tipo: ${detalle.tipo} | Fecha: ${detalle.fecha}`)
            .text(`   Región: ${detalle.region} | Localidad: ${detalle.localidad}`)
            .text(`   Nivel: ${detalle.nivel} | Carácter: ${detalle.caracter}`)
            .text(`   Descripción: ${detalle.descripcion}`)
            .text(`   Docente: ${detalle.apellido}, ${detalle.nombre} - DNI: ${detalle.dni}`)
            .text(`   Habilitación: ${detalle.habilitacion}`);

          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
          doc.moveDown(0.5);
        });
      } else {
        doc.text("No se encontraron registros para los filtros aplicados.");
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text("Subdirección Cobertura de Cargos - Dirección Gestión Educativa", { align: "center" });

      doc.end();
    } catch (error) {
      res.status(500).json({ error: "Error al generar el informe" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
