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
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => {
      this.logger.error(`Error en PDFDocument al generar factura para cita ${appointment.id}:`, err);
      reject(err);
    });

    try {
      // Logo
      const logoPath = path.join(__dirname, '../../../my-spa/src/assets/imagenes/logo-casabonita.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width / 2 - 50, 30, { width: 100 });
        doc.moveDown(5);
      }

      // Encabezado
      doc.fillColor('#0c4a6e').fontSize(25).text('Factura de Servicio', { align: 'center' });
      doc.fillColor('black');
      doc.fontSize(10).text('Casa Bonita SPA', { align: 'center' });
      doc.text('Dirección: Cr. 50 & CL. 133 Sur, Caldas, Antioquia', { align: 'center' });
      doc.text('Teléfono: +57 321 757 1992', { align: 'center' });
      doc.text('Email: Casabonitacentroestetico@gmail.com', { align: 'center' });
      doc.moveDown();
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // Info de Factura
      const appointmentDate = new Date(appointment.startTime);
      doc.moveDown().fontSize(12).text(`Factura No: ${appointment.id}`, { align: 'right' });
      doc.text(`Fecha: ${appointmentDate.toLocaleDateString('es-ES')}`, { align: 'right' });

      // Cliente
      doc.moveDown().fillColor('#0c4a6e').fontSize(14).text('Información del Cliente:', { underline: true });
      doc.fillColor('black').fontSize(12);
      doc.text(`Nombre: ${appointment.client?.name || 'N/A'}`);
      doc.text(`Teléfono: ${appointment.client?.phone || 'N/A'}`);
      doc.text(`Email: ${appointment.client?.email || 'N/A'}`);

      // Servicio
      doc.moveDown().fillColor('#0c4a6e').fontSize(14).text('Detalles del Servicio:', { underline: true });
      doc.fillColor('black').fontSize(12);
      doc.text(`Servicio: ${appointment.treatment?.name || 'N/A'}`);
      doc.text(`Profesional: ${appointment.employee?.name || 'N/A'}`);
      doc.text(`Fecha y Hora: ${appointmentDate.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`);
      doc.text(`Estado de la Cita: ${appointment.status}`);

      // Pago
      doc.moveDown().fillColor('#0c4a6e').fontSize(14).text('Resumen de Pago:', { underline: true });
      const price = parseFloat(appointment.price?.toString() || '0').toFixed(2);
      doc.fillColor('black').fontSize(12);
      doc.text(`Precio del Servicio: $${price}`);
      doc.text(`Método de Pago: ${appointment.paymentMethod || 'N/A'}`);
      doc.text(`Estado de Pago: ${appointment.paymentStatus}`);

      // Total
      doc.moveDown().fontSize(16).fillColor('#1f2937')
        .text(`Total a Pagar: $${price}`, { align: 'right' });

      // Pie
      const footerY = doc.page.height - 100;
      doc.rect(0, footerY, doc.page.width, 50).fill('#f3f4f6');
      doc.fillColor('#1f2937').fontSize(10).text(
        '¡Gracias por visitar Casa Bonita Centro Estético y SPA!',
        50,
        footerY + 15,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    } catch (err) {
      this.logger.error(`Error al definir contenido PDF:`, err);
      doc.end();
      reject(err);
    }
  });
}


  // --- NUEVO MÉTODO: generateCombinedInvoicePdf ---
  async generateCombinedInvoicePdf(appointments: Appointment[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => {
      this.logger.error(`Error en PDFDocument al generar factura combinada:`, err);
      reject(err);
    });

    try {
      const logoPath = path.join(__dirname, '../../../my-spa/src/assets/imagenes/logo-casabonita.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width / 2 - 50, 30, { width: 100 });
        doc.moveDown(5);
      }

      doc.fillColor('#0c4a6e').fontSize(25).text('Factura de Servicios Combinada', { align: 'center' });
      doc.fillColor('black');
      doc.fontSize(10).text('Casa Bonita SPA', { align: 'center' });
      doc.text('Dirección: Cr. 50 & CL. 133 Sur, Caldas, Antioquia', { align: 'center' });
      doc.text('Teléfono: +57 321 757 1992', { align: 'center' });
      doc.text('Email: Casabonitacentroestetico@gmail.com', { align: 'center' });
      doc.moveDown();
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      const firstAppointment = appointments[0];
      doc.moveDown().fillColor('#0c4a6e').fontSize(14).text('Información del Cliente:', { underline: true });
      doc.fillColor('black').fontSize(12);
      doc.text(`Nombre: ${firstAppointment.client?.name || 'N/A'}`);
      doc.text(`Teléfono: ${firstAppointment.client?.phone || 'N/A'}`);
      doc.text(`Email: ${firstAppointment.client?.email || 'N/A'}`);

      // Detalles de los Servicios
      doc.moveDown().fillColor('#0c4a6e').fontSize(14).text('Servicios Realizados:', { underline: true });
      doc.moveDown(0.5).fillColor('black');

      let total = 0;
      appointments.forEach((app, index) => {
        const date = new Date(app.startTime);
        const price = parseFloat(app.price?.toString() || '0');
        total += price;

        doc.fontSize(12).text(`Cita #${app.id} - ${date.toLocaleDateString('es-ES')}`);
        doc.fontSize(10).text(`  Servicio: ${app.treatment?.name || 'N/A'}`);
        doc.text(`  Profesional: ${app.employee?.name || 'N/A'}`);
        doc.text(`  Fecha y Hora: ${date.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`);
        doc.text(`  Precio: $${price.toFixed(2)}`);
        doc.moveDown(0.5);
      });

      // Total
      doc.moveDown().fontSize(16).fillColor('#1f2937')
        .text(`Total Combinado a Pagar: $${total.toFixed(2)}`, { align: 'right' });

      // Pie de página
      const footerY = doc.page.height - 100;
      doc.rect(0, footerY, doc.page.width, 50).fill('#f3f4f6');
      doc.fillColor('#1f2937').fontSize(10).text(
        '¡Gracias por visitar Casa Bonita Centro Estético y SPA!',
        50,
        footerY + 15,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    } catch (err) {
      this.logger.error(`Error al definir contenido combinado:`, err);
      doc.end();
      reject(err);
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
