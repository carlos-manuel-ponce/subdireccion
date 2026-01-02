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

const logoPath = path.join(process.cwd(), "attached_assets", "logo_ministerio.png");

function createCoberturaHeader(doc: InstanceType<typeof PDFDocument>, moduleName: string, userName: string = "Usuario del Sistema", totalRegistros: number = 0) {
  const marginLeft = 50;
  const pageWidth = 495;
  
  // Title "INFORME DE [MODULE]" on the left - bold, underlined
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#000000").text(`INFORME DE ${moduleName}`, marginLeft, 40, { underline: true });
  
  doc.y = 65;
  
  // Horizontal line after title
  doc.strokeColor("#000000").lineWidth(0.5).moveTo(marginLeft, doc.y).lineTo(marginLeft + pageWidth, doc.y).stroke();
  
  doc.y = 75;
  
  // Disclaimer paragraph with border/frame
  const disclaimerText = "El presente documento, se emite a los fines de ser presentado donde corresponda, siendo el usuario generador responsable de su destino y utilización.";
  const disclaimerHeight = 35;
  
  doc.strokeColor("#000000").lineWidth(0.5).rect(marginLeft, doc.y, pageWidth, disclaimerHeight).stroke();
  doc.font("Helvetica").fontSize(9).fillColor("#000000").text(
    disclaimerText,
    marginLeft + 10, doc.y + 8, { width: pageWidth - 20, align: "center" }
  );
  
  doc.y = doc.y + disclaimerHeight + 10;
  
  doc.y = doc.y + 10;
  
  // Emisión and Usuario on same line
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  
  doc.font("Helvetica").fontSize(9).fillColor("#000000");
  doc.text(`Emision:  ${dateStr} - ${timeStr}`, marginLeft, doc.y);
  doc.text(`Usuario:  ${userName}`, marginLeft + 280, doc.y - 11);
  
  // Registros Encontrados on next line
  doc.text(`Registros Encontrados:  ${totalRegistros}`, marginLeft, doc.y + 5);
  
  doc.y = doc.y + 25;
}

function drawEstablecimientoCard(doc: InstanceType<typeof PDFDocument>, establecimiento: string, fields: { label: string; value: string }[]) {
  const marginLeft = 50;
  const pageWidth = 495;
  const labelWidth = 160;
  const valueWidth = pageWidth - labelWidth;
  const headerHeight = 18;
  const minRowHeight = 16;
  
  // Calculate dynamic heights for each field based on text content
  const fieldHeights = fields.map((field) => {
    const textHeight = doc.font("Helvetica").fontSize(9).heightOfString(field.value || " ", { width: valueWidth - 10 });
    return Math.max(minRowHeight, textHeight + 6);
  });
  
  const totalContentHeight = fieldHeights.reduce((sum, h) => sum + h, 0);
  const cardHeight = headerHeight + totalContentHeight;
  
  // Check if we need a new page
  if (doc.y + cardHeight > 760) {
    doc.addPage();
    doc.y = 50;
  }
  
  const startY = doc.y;
  
  // Establecimiento header - just border, no fill, centered text
  doc.strokeColor("#000000").lineWidth(0.5).rect(marginLeft, startY, pageWidth, headerHeight).stroke();
  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9).text(establecimiento, marginLeft, startY + 4, { width: pageWidth, align: "center" });
  
  let currentY = startY + headerHeight;
  
  // Draw rows with borders
  doc.strokeColor("#000000").lineWidth(0.5).fillColor("#000000");
  
  fields.forEach((field, index) => {
    const rowHeight = fieldHeights[index];
    
    // Label cell (no fill, just border)
    doc.strokeColor("#000000").rect(marginLeft, currentY, labelWidth, rowHeight).stroke();
    doc.fillColor("#000000").font("Helvetica").fontSize(9).text(field.label, marginLeft + 5, currentY + 4, { width: labelWidth - 10 });
    
    // Value cell
    doc.strokeColor("#000000").rect(marginLeft + labelWidth, currentY, valueWidth, rowHeight).stroke();
    doc.fillColor("#000000").font("Helvetica").fontSize(9).text(field.value || "", marginLeft + labelWidth + 5, currentY + 4, { width: valueWidth - 10 });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 12;
}

function addPDFFooter(doc: InstanceType<typeof PDFDocument>) {
  const marginLeft = 50;
  const pageWidth = 495;
  
  // Add footer right after the last content
  doc.moveDown(1);
  doc.font("Helvetica").fontSize(8).fillColor("#666666").text(
    "Documento generado automaticamente por Subdirección Cobertura de Cargos",
    marginLeft, doc.y, { width: pageWidth, align: "center" }
  );
}

function addPageBorder(doc: InstanceType<typeof PDFDocument>) {
  const marginLeft = 30;
  const marginTop = 25;
  const pageWidth = 535;
  const pageHeight = 792;
  
  doc.strokeColor("#000000").lineWidth(1);
  doc.rect(marginLeft, marginTop, pageWidth, pageHeight).stroke();
}

// Legacy function for other reports
function createPDFHeader(doc: InstanceType<typeof PDFDocument>, title: string, userName: string = "Usuario del Sistema") {
  const pageWidth = 545;
  const marginLeft = 50;
  
  // Header row: Logo left, Title right
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, marginLeft + pageWidth - 200, 35, { width: 150 });
  }
  
  doc.fillColor("#1a365d").font("Helvetica-Bold").fontSize(18).text(title, marginLeft, 45);
  doc.fillColor("#000000");
  
  doc.y = 100;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  
  doc.font("Helvetica").fontSize(9).text(`Emisión: ${dateStr} - ${timeStr}`, marginLeft, doc.y);
  doc.text(`Usuario: ${userName}`, marginLeft, doc.y + 12);
  
  doc.y = 140;
  doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(marginLeft, doc.y).lineTo(marginLeft + pageWidth - marginLeft, doc.y).stroke();
  doc.strokeColor("#000000");
  doc.moveDown(1.5);
}

function drawRecordCard(doc: InstanceType<typeof PDFDocument>, fields: { label: string; value: string }[], title: string) {
  const cardX = 50;
  const cardWidth = 495;
  const labelWidth = 140;
  const valueWidth = cardWidth - labelWidth - 10;
  const headerHeight = 22;
  const minRowHeight = 20;
  
  const fieldHeights = fields.map((field) => {
    const textHeight = doc.font("Helvetica").fontSize(9).heightOfString(field.value || " ", { width: valueWidth });
    return Math.max(minRowHeight, textHeight + 10);
  });
  
  const totalContentHeight = fieldHeights.reduce((sum, h) => sum + h, 0);
  const cardHeight = headerHeight + totalContentHeight;
  
  if (doc.y + cardHeight > 760) {
    doc.addPage();
    doc.y = 50;
  }
  
  const startY = doc.y;
  
  // Header
  doc.fillColor("#333333").rect(cardX, startY, cardWidth, headerHeight).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(title, cardX, startY + 6, { width: cardWidth, align: "center" });
  
  let currentY = startY + headerHeight;
  
  doc.strokeColor("#000000").lineWidth(0.5).fillColor("#000000");
  
  fields.forEach((field, index) => {
    const rowHeight = fieldHeights[index];
    
    doc.fillColor("#f5f5f5").rect(cardX, currentY, labelWidth, rowHeight).fill();
    doc.strokeColor("#000000").rect(cardX, currentY, labelWidth, rowHeight).stroke();
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9).text(field.label, cardX + 5, currentY + 6, { width: labelWidth - 10 });
    
    doc.strokeColor("#000000").rect(cardX + labelWidth, currentY, valueWidth + 10, rowHeight).stroke();
    doc.fillColor("#000000").font("Helvetica").fontSize(9).text(field.value || "", cardX + labelWidth + 5, currentY + 6, { width: valueWidth });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 15;
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
      
      // Add page border on first page
      addPageBorder(doc);
      
      // Add page border on new pages
      doc.on("pageAdded", () => {
        addPageBorder(doc);
      });

      const totalRegistros = expedientes ? expedientes.length : 0;
      createCoberturaHeader(doc, "CREACIONES", userName || "Usuario del Sistema", totalRegistros);

      if (expedientes && expedientes.length > 0) {
        expedientes.forEach((exp, index) => {
          const fields = [
            { label: "EXPEDIENTE", value: exp.expediente },
            { label: "SOLICITUD", value: exp.solicita },
            { label: "UBICACION", value: exp.ubicacion },
            { label: "OBSERVACIONES", value: exp.comentario || "" },
          ];
          
          drawEstablecimientoCard(doc, exp.establecimiento, fields);
        });
        
        addPDFFooter(doc);
      } else {
        doc.font("Helvetica").fontSize(10).text("No se encontraron expedientes para los filtros aplicados.");
        addPDFFooter(doc);
      }

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
      
      // Add page border on first page
      addPageBorder(doc);
      
      // Add page border on new pages
      doc.on("pageAdded", () => {
        addPageBorder(doc);
      });

      // Generate report with module name
      const totalRegistros = detalles ? detalles.length : 0;
      createCoberturaHeader(doc, "COBERTURA DE CARGOS", userName || "Usuario del Sistema", totalRegistros);

      if (detalles && detalles.length > 0) {
        detalles.forEach((detalle, index) => {
          const fields = [
            { label: "LLAMADO", value: `${detalle.llamado} | Tipo: ${detalle.tipo} | Fecha: ${detalle.fecha}` },
            { label: "REGION / LOCALIDAD", value: `${detalle.region} / ${detalle.localidad}` },
            { label: "NIVEL / CARACTER", value: `${detalle.nivel} / ${detalle.caracter}` },
            { label: "DESCRIPCION", value: detalle.descripcion || "" },
            { label: "DOCENTE / HABILITACION", value: `${detalle.apellido}, ${detalle.nombre} - DNI: ${detalle.dni} | ${detalle.habilitacion}` },
          ];
          
          drawEstablecimientoCard(doc, detalle.establecimiento, fields);
        });
        
        // Add footer right after the last card
        addPDFFooter(doc);
      } else {
        doc.font("Helvetica").fontSize(10).text("No se encontraron registros para los filtros aplicados.");
        addPDFFooter(doc);
      }

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
      
      // Add page border on first page
      addPageBorder(doc);
      
      // Add page border on new pages
      doc.on("pageAdded", () => {
        addPageBorder(doc);
      });

      const totalRegistros = registros ? registros.length : 0;
      createCoberturaHeader(doc, "TITULARIZACIONES", userName || "Usuario del Sistema", totalRegistros);

      if (registros && registros.length > 0) {
        registros.forEach((reg, index) => {
          const fields = [
            { label: "EXPEDIENTE", value: reg.expediente },
            { label: "DOCENTE", value: `${reg.apellido}, ${reg.nombre} - DNI: ${reg.dni}` },
            { label: "LOCALIDAD / DEPARTAMENTO", value: `${reg.localidad} / ${reg.departamento}` },
            { label: "JUNTA DE CLASIFICACION", value: reg.juntaClasificacion },
            { label: "TITULARIZAR EN", value: reg.titularizarEn },
            { label: "RENUNCIA A", value: reg.renunciaA || "" },
          ];
          
          drawEstablecimientoCard(doc, reg.establecimiento, fields);
        });
        
        addPDFFooter(doc);
      } else {
        doc.font("Helvetica").fontSize(10).text("No se encontraron registros para los filtros aplicados.");
        addPDFFooter(doc);
      }

      doc.end();
    } catch (error) {
      res.status(500).json({ error: "Error al generar el informe" });
    }
  });
}
