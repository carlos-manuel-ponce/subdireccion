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

function createPDFHeader(doc: InstanceType<typeof PDFDocument>, title: string) {
  const startY = 40;
  
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, startY, { height: 50 });
  }
  
  doc.font("Times-Bold").fontSize(16).text(title, 50, startY + 15, { align: "center", width: 495 });
  
  doc.y = startY + 70;
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
}

function createPDFFooter(doc: InstanceType<typeof PDFDocument>, userName: string = "Usuario del Sistema") {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  
  doc.moveDown(2);
  doc.font("Times-Roman").fontSize(9).text("Documento generado automáticamente por Subdirección Cobertura de Cargos", { align: "center" });
  doc.font("Times-Roman").fontSize(9).text(`Emisión: ${dateStr}, ${timeStr}`, { align: "center" });
  doc.font("Times-Roman").fontSize(9).text(`Usuario: ${userName}`, { align: "center" });
}

function drawRecordCard(doc: InstanceType<typeof PDFDocument>, fields: { label: string; value: string }[], title: string) {
  const cardX = 50;
  const cardWidth = 495;
  const labelWidth = 150;
  const rowHeight = 18;
  const headerHeight = 22;
  
  const cardHeight = headerHeight + fields.length * rowHeight + 2;
  
  if (doc.y + cardHeight > 740) {
    doc.addPage();
  }
  
  const startY = doc.y;
  
  doc.lineWidth(1).strokeColor("#000000");
  doc.rect(cardX, startY, cardWidth, cardHeight).stroke();
  
  doc.fillColor("#e0e0e0").rect(cardX, startY, cardWidth, headerHeight).fill();
  doc.strokeColor("#000000").moveTo(cardX, startY + headerHeight).lineTo(cardX + cardWidth, startY + headerHeight).stroke();
  doc.fillColor("#000000");
  
  doc.font("Times-Bold").fontSize(11).text(title, cardX + 8, startY + 5, { width: cardWidth - 16 });
  
  let currentY = startY + headerHeight;
  
  fields.forEach((field, index) => {
    doc.moveTo(cardX, currentY).lineTo(cardX + cardWidth, currentY).stroke();
    
    doc.fillColor("#f5f5f5").rect(cardX, currentY, labelWidth, rowHeight).fill();
    doc.fillColor("#000000");
    
    doc.moveTo(cardX + labelWidth, currentY).lineTo(cardX + labelWidth, currentY + rowHeight).stroke();
    
    doc.font("Times-Bold").fontSize(9).text(field.label, cardX + 6, currentY + 5, { width: labelWidth - 12 });
    doc.font("Times-Roman").fontSize(9).text(field.value, cardX + labelWidth + 6, currentY + 5, { width: cardWidth - labelWidth - 12 });
    
    currentY += rowHeight;
  });
  
  doc.y = startY + cardHeight + 10;
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
      const { expedientes, userName } = req.body as { expedientes: { expediente: string; solicita: string; establecimiento: string; ubicacion: string; comentario: string }[]; userName?: string };

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-creaciones-${Date.now()}.pdf`);

      doc.pipe(res);

      createPDFHeader(doc, "INFORME DE CREACIONES");

      if (expedientes && expedientes.length > 0) {
        doc.font("Times-Bold").fontSize(11).text(`Total de expedientes: ${expedientes.length}`, { align: "left" });
        doc.moveDown();

        expedientes.forEach((exp, index) => {
          const fields = [
            { label: "Tipo de Solicitud", value: exp.solicita },
            { label: "Establecimiento", value: exp.establecimiento },
            { label: "Ubicación", value: exp.ubicacion },
          ];
          if (exp.comentario) {
            fields.push({ label: "Observaciones", value: exp.comentario });
          }
          
          drawRecordCard(doc, fields, `${index + 1}. Expediente N° ${exp.expediente}`);
        });
      } else {
        doc.font("Times-Roman").fontSize(10).text("No se encontraron expedientes para los filtros aplicados.");
      }

      createPDFFooter(doc, userName);

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
      const { establecimiento, detalles, userName } = req.body as { establecimiento?: string; detalles: CoberturaDetalle[]; userName?: string };

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-cobertura-${Date.now()}.pdf`);

      doc.pipe(res);

      createPDFHeader(doc, "INFORME DE COBERTURA DE CARGOS");

      if (establecimiento) {
        doc.font("Times-Bold").fontSize(11).text(`Filtro: ${establecimiento}`, { align: "left" });
        doc.moveDown(0.5);
      }

      if (detalles && detalles.length > 0) {
        doc.font("Times-Bold").fontSize(11).text(`Total de registros: ${detalles.length}`, { align: "left" });
        doc.moveDown();

        detalles.forEach((detalle, index) => {
          const fields = [
            { label: "Llamado", value: `${detalle.llamado} | Tipo: ${detalle.tipo} | Fecha: ${detalle.fecha}` },
            { label: "Región / Localidad", value: `${detalle.region} / ${detalle.localidad}` },
            { label: "Nivel / Carácter", value: `${detalle.nivel} / ${detalle.caracter}` },
            { label: "Descripción", value: detalle.descripcion },
            { label: "Docente", value: `${detalle.apellido}, ${detalle.nombre} - DNI: ${detalle.dni}` },
            { label: "Habilitación", value: detalle.habilitacion },
          ];
          
          drawRecordCard(doc, fields, `${index + 1}. ${detalle.establecimiento}`);
        });
      } else {
        doc.font("Times-Roman").fontSize(10).text("No se encontraron registros para los filtros aplicados.");
      }

      createPDFFooter(doc, userName);

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
      const { registros, userName } = req.body as { registros: TitularizacionRegistro[]; userName?: string };

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=informe-titularizaciones-${Date.now()}.pdf`);

      doc.pipe(res);

      createPDFHeader(doc, "INFORME DE TITULARIZACIONES");

      if (registros && registros.length > 0) {
        doc.font("Times-Bold").fontSize(11).text(`Total de registros: ${registros.length}`, { align: "left" });
        doc.moveDown();

        registros.forEach((reg, index) => {
          const fields = [
            { label: "Docente", value: `${reg.apellido}, ${reg.nombre} - DNI: ${reg.dni}` },
            { label: "Establecimiento", value: reg.establecimiento },
            { label: "Localidad / Departamento", value: `${reg.localidad} / ${reg.departamento}` },
            { label: "Junta de Clasificación", value: reg.juntaClasificacion },
            { label: "Titularizar en", value: reg.titularizarEn },
          ];
          if (reg.renunciaA) {
            fields.push({ label: "Renuncia a", value: reg.renunciaA });
          }
          
          drawRecordCard(doc, fields, `${index + 1}. Expediente N° ${reg.expediente}`);
        });
      } else {
        doc.font("Times-Roman").fontSize(10).text("No se encontraron registros para los filtros aplicados.");
      }

      createPDFFooter(doc, userName);

      doc.end();
    } catch (error) {
      res.status(500).json({ error: "Error al generar el informe" });
    }
  });
}
