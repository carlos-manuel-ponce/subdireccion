import type { Express } from "express";
import type { Server } from "http";
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
  type TitularizacionRegistro,
} from "@shared/schema";
import { fromError } from "zod-validation-error";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const logoPath = path.join(process.cwd(), "attached_assets", "LOGO_BLANCO_1767308770849.png");

function createPDFHeader(doc: InstanceType<typeof PDFDocument>, title: string, subtitle?: string) {
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { height: 50 });
  }
  
  doc.font("Times-Bold").fontSize(16).text(title, 50, 50, { align: "center" });
  doc.moveDown(0.3);
  doc.font("Times-Roman").fontSize(11).text("SUBDIRECCIÓN COBERTURA DE CARGOS", { align: "center" });
  doc.fontSize(10).text("Dirección Gestión Educativa", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Fecha de emisión: ${new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}`, { align: "center" });
  
  if (subtitle) {
    doc.moveDown(0.3);
    doc.font("Times-Bold").fontSize(11).text(subtitle, { align: "center" });
  }
  
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
}

function createPDFFooter(doc: InstanceType<typeof PDFDocument>) {
  doc.moveDown(2);
  doc.font("Times-Italic").fontSize(8).text("Documento generado automáticamente por el Sistema de Gestión - Subdirección Cobertura de Cargos", { align: "center" });
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
    fileSize: 10 * 1024 * 1024,
  },
});

const PIN_CREDENTIALS: Record<string, string> = {
  CREACIONES: "1111",
  COBERTURA: "1212",
  TITULARIZACIONES: "1313",
};

export async function registerRoutes(server: Server, app: Express): Promise<void> {
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

  app.post("/api/expedientes/report", async (req, res) => {
    try {
      const { expedientes } = req.body as { expedientes: { expediente: string; solicita: string; establecimiento: string; estado: string; comentario: string }[] };

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-creaciones-${Date.now()}.pdf`);

      doc.pipe(res);

      createPDFHeader(doc, "INFORME DE CREACIONES");

      if (expedientes && expedientes.length > 0) {
        doc.font("Times-Bold").fontSize(11).text(`Total de expedientes: ${expedientes.length}`, { align: "left" });
        doc.moveDown();

        expedientes.forEach((exp, index) => {
          if (doc.y > 720) {
            doc.addPage();
          }

          doc.font("Times-Bold").fontSize(10).text(`${index + 1}. Expediente N° ${exp.expediente}`, { underline: true });
          doc.font("Times-Roman").fontSize(10);
          doc.moveDown(0.3);
          doc.text(`Tipo de Solicitud: ${exp.solicita}`);
          doc.text(`Establecimiento: ${exp.establecimiento}`);
          doc.text(`Estado Actual: ${exp.estado}`);
          if (exp.comentario) {
            doc.text(`Observaciones: ${exp.comentario}`);
          }

          doc.moveDown(0.5);
          doc.strokeColor("#cccccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke().strokeColor("#000000");
          doc.moveDown(0.5);
        });
      } else {
        doc.font("Times-Roman").fontSize(10).text("No se encontraron expedientes para los filtros aplicados.");
      }

      createPDFFooter(doc);

      doc.end();
    } catch (error) {
      res.status(500).json({ error: "Error al generar el informe" });
    }
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

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-cobertura-${Date.now()}.pdf`);

      doc.pipe(res);

      createPDFHeader(doc, "INFORME DE COBERTURA DE CARGOS", establecimiento ? `Establecimiento: ${establecimiento}` : undefined);

      if (detalles && detalles.length > 0) {
        doc.font("Times-Bold").fontSize(11).text(`Total de registros: ${detalles.length}`, { align: "left" });
        doc.moveDown();

        detalles.forEach((detalle, index) => {
          if (doc.y > 720) {
            doc.addPage();
          }

          doc.font("Times-Bold").fontSize(10).text(`${index + 1}. ${detalle.establecimiento}`, { underline: true });
          doc.font("Times-Roman").fontSize(10);
          doc.moveDown(0.3);
          doc.text(`Llamado: ${detalle.llamado}  |  Tipo: ${detalle.tipo}  |  Fecha: ${detalle.fecha}`);
          doc.text(`Región: ${detalle.region}  |  Localidad: ${detalle.localidad}`);
          doc.text(`Nivel: ${detalle.nivel}  |  Carácter: ${detalle.caracter}`);
          doc.text(`Descripción: ${detalle.descripcion}`);
          doc.font("Times-Bold").text(`Docente: ${detalle.apellido}, ${detalle.nombre}`, { continued: true });
          doc.font("Times-Roman").text(`  -  DNI: ${detalle.dni}`);
          doc.text(`Habilitación: ${detalle.habilitacion}`);

          doc.moveDown(0.5);
          doc.strokeColor("#cccccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke().strokeColor("#000000");
          doc.moveDown(0.5);
        });
      } else {
        doc.font("Times-Roman").fontSize(10).text("No se encontraron registros para los filtros aplicados.");
      }

      createPDFFooter(doc);

      doc.end();
    } catch (error) {
      res.status(500).json({ error: "Error al generar el informe" });
    }
  });

  // ==================== TITULARIZACIONES ====================
  app.get("/api/titularizaciones/estadisticas", async (_req, res) => {
    const estadisticas = await storage.getTitularizacionEstadisticas();
    res.json(estadisticas);
  });

  app.get("/api/titularizaciones/registros", async (_req, res) => {
    const registros = await storage.getTitularizacionRegistros();
    res.json(registros);
  });

  app.post("/api/titularizaciones/registros/report", async (req, res) => {
    try {
      const { registros } = req.body as { registros: TitularizacionRegistro[] };

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-titularizaciones-${Date.now()}.pdf`);

      doc.pipe(res);

      createPDFHeader(doc, "INFORME DE TITULARIZACIONES");

      if (registros && registros.length > 0) {
        doc.font("Times-Bold").fontSize(11).text(`Total de registros: ${registros.length}`, { align: "left" });
        doc.moveDown();

        registros.forEach((reg, index) => {
          if (doc.y > 720) {
            doc.addPage();
          }

          doc.font("Times-Bold").fontSize(10).text(`${index + 1}. Expediente N° ${reg.expediente}`, { underline: true });
          doc.font("Times-Roman").fontSize(10);
          doc.moveDown(0.3);
          doc.font("Times-Bold").text(`Docente: ${reg.apellido}, ${reg.nombre}`, { continued: true });
          doc.font("Times-Roman").text(`  -  DNI: ${reg.dni}`);
          doc.text(`Establecimiento: ${reg.establecimiento}`);
          doc.text(`Localidad: ${reg.localidad}  |  Departamento: ${reg.departamento}`);
          doc.text(`Junta de Clasificación: ${reg.juntaClasificacion}`);
          doc.font("Times-Bold").text(`Titularizar en: ${reg.titularizarEn}`);
          doc.font("Times-Roman");
          if (reg.renunciaA) {
            doc.text(`Renuncia a: ${reg.renunciaA}`);
          }

          doc.moveDown(0.5);
          doc.strokeColor("#cccccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke().strokeColor("#000000");
          doc.moveDown(0.5);
        });
      } else {
        doc.font("Times-Roman").fontSize(10).text("No se encontraron registros para los filtros aplicados.");
      }

      createPDFFooter(doc);

      doc.end();
    } catch (error) {
      res.status(500).json({ error: "Error al generar el informe" });
    }
  });
}
