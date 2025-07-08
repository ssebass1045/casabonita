// File: backend-spa/src/invoice/invoice.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Appointment } from '../appointment/entities/appointment.entity';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  // Método para generar una factura en PDF (individual, ya existente)
  async generateInvoicePdf(appointment: Appointment): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => {
        this.logger.error(`Error en PDFDocument al generar factura para cita ${appointment.id}:`, err);
        reject(err);
      });

      try {
        // --- Contenido de la Factura Individual ---
        doc.fontSize(25).text('Factura de Servicio', { align: 'center' });
        doc.fontSize(10).text('Casa Bonita SPA', { align: 'center' });
        doc.fontSize(10).text('Dirección: Calle Ficticia 123, Ciudad', { align: 'center' });
        doc.fontSize(10).text('Teléfono: +57 123 456 7890', { align: 'center' });
        doc.fontSize(10).text('Email: info@casabonita.com', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Factura No: ${appointment.id}`, { align: 'right' });
        const appointmentDate = new Date(appointment.startTime);
        doc.text(`Fecha: ${appointmentDate.toLocaleDateString('es-ES')}`, { align: 'right' });
        doc.moveDown();

        doc.fontSize(14).text('Información del Cliente:', { underline: true });
        doc.fontSize(12).text(`Nombre: ${appointment.client?.name || 'N/A'}`);
        doc.text(`Teléfono: ${appointment.client?.phone || 'N/A'}`);
        doc.text(`Email: ${appointment.client?.email || 'N/A'}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalles del Servicio:', { underline: true });
        doc.fontSize(12).text(`Servicio: ${appointment.treatment?.name || 'N/A'}`);
        doc.text(`Profesional: ${appointment.employee?.name || 'N/A'}`);
        doc.text(`Fecha y Hora: ${appointmentDate.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`);
        doc.text(`Estado de la Cita: ${appointment.status}`);
        doc.moveDown();

        doc.fontSize(14).text('Resumen de Pago:', { underline: true });
        doc.fontSize(12).text(`Precio del Servicio: $${parseFloat(appointment.price?.toString() || '0').toFixed(2) || '0.00'}`);
        doc.text(`Método de Pago: ${appointment.paymentMethod || 'N/A'}`);
        doc.text(`Estado de Pago: ${appointment.paymentStatus}`);
        doc.moveDown();

        doc.fontSize(16).text(`Total a Pagar: $${parseFloat(appointment.price?.toString() || '0').toFixed(2) || '0.00'}`, { align: 'right', bold: true });
        doc.moveDown();

        doc.fontSize(10).text('¡Gracias por visitar Casa Bonita SPA!', { align: 'center' });
        doc.text('Esperamos verte pronto.', { align: 'center' });

        doc.end();
      } catch (contentError) {
        this.logger.error(`Error al definir el contenido del PDF para cita ${appointment.id}:`, contentError);
        doc.end();
        reject(contentError);
      }
    });
  }

  // --- NUEVO MÉTODO: generateCombinedInvoicePdf ---
  async generateCombinedInvoicePdf(appointments: Appointment[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => {
        this.logger.error(`Error en PDFDocument al generar factura combinada:`, err);
        reject(err);
      });

      try {
        // --- Contenido de la Factura Combinada ---
        doc.fontSize(25).text('Factura de Servicios Combinada', { align: 'center' });
        doc.fontSize(10).text('Casa Bonita SPA', { align: 'center' });
        doc.fontSize(10).text('Dirección: Calle Ficticia 123, Ciudad', { align: 'center' });
        doc.fontSize(10).text('Teléfono: +57 123 456 7890', { align: 'center' });
        doc.fontSize(10).text('Email: info@casabonita.com', { align: 'center' });
        doc.moveDown();

        // Información del Cliente (asumimos que todas las citas son del mismo cliente)
        const firstAppointment = appointments[0];
        doc.fontSize(14).text('Información del Cliente:', { underline: true });
        doc.fontSize(12).text(`Nombre: ${firstAppointment.client?.name || 'N/A'}`);
        doc.text(`Teléfono: ${firstAppointment.client?.phone || 'N/A'}`);
        doc.text(`Email: ${firstAppointment.client?.email || 'N/A'}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalles de los Servicios:', { underline: true });
        doc.moveDown(0.5);

        let totalCombinedPrice = 0;

        // Listar cada servicio de cada cita
        appointments.forEach((app, index) => {
          const appDate = new Date(app.startTime);
          const servicePrice = parseFloat(app.price?.toString() || '0');
          totalCombinedPrice += servicePrice;

          doc.fontSize(12).text(`Cita #${app.id} - ${appDate.toLocaleDateString('es-ES')}`);
          doc.fontSize(10).text(`  Servicio: ${app.treatment?.name || 'N/A'}`);
          doc.text(`  Profesional: ${app.employee?.name || 'N/A'}`);
          doc.text(`  Fecha y Hora: ${appDate.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`);
          doc.text(`  Precio: $${servicePrice.toFixed(2)}`);
          doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(16).text(`Total Combinado a Pagar: $${totalCombinedPrice.toFixed(2)}`, { align: 'right', bold: true });
        doc.moveDown();

        doc.fontSize(10).text('¡Gracias por visitar Casa Bonita SPA!', { align: 'center' });
        doc.text('Esperamos verte pronto.', { align: 'center' });

        doc.end();
      } catch (contentError) {
        this.logger.error(`Error al definir el contenido del PDF combinado:`, contentError);
        doc.end();
        reject(contentError);
      }
    });
  }

  // Opcional: Método para guardar el PDF en el servidor
  async saveInvoicePdf(pdfBuffer: Buffer, filename: string): Promise<string> {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);
    return filePath; // Devuelve la ruta donde se guardó
  }
}
