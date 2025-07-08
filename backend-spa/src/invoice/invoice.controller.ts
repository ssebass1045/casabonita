// File: backend-spa/src/invoice/invoice.controller.ts
import { Controller, Get, Param, Res, UseGuards, ParseIntPipe, NotFoundException, BadRequestException, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { AppointmentService } from '../appointment/appointment.service';
import { Appointment } from '../appointment/entities/appointment.entity'; // <-- ¡Añade esta importación!

@UseGuards(AuthGuard('jwt')) // Protege todas las rutas de este controlador
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly appointmentService: AppointmentService,
  ) {}

  // Endpoint para generar factura individual (ya existente)
  @Get(':appointmentId/generate')
  async generateInvoice(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Res() res: Response,
  ) {
    const appointment = await this.appointmentService.findOne(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${appointmentId} no encontrada.`);
    }

    if (appointment.status !== 'Realizada' || appointment.paymentStatus !== 'Pagado') {
      throw new BadRequestException('Solo se pueden facturar citas con estado "Realizada" y "Pagado".');
    }

    const pdfBuffer = await this.invoiceService.generateInvoicePdf(appointment);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura_${appointment.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  // --- NUEVO ENDPOINT: generateCombinedInvoice ---
  @Post('generate-combined')
  async generateCombinedInvoice(
    @Body('appointmentIds') appointmentIds: number[], // Espera un array de IDs de citas
    @Res() res: Response,
  ) {
    if (!appointmentIds || appointmentIds.length === 0) {
      throw new BadRequestException('Se requiere al menos un ID de cita para generar una factura combinada.');
    }

    // 1. Obtener todas las citas seleccionadas
    const appointments: Appointment[] = [];
    for (const id of appointmentIds) {
      const app = await this.appointmentService.findOne(id);
      if (!app) {
        throw new NotFoundException(`Cita con ID ${id} no encontrada.`);
      }
      // Validar que todas las citas estén realizadas y pagadas
      if (app.status !== 'Realizada' || app.paymentStatus !== 'Pagado') {
        throw new BadRequestException(`La cita con ID ${id} no cumple los requisitos para ser facturada (debe estar Realizada y Pagado).`);
      }
      appointments.push(app);
    }

    // Opcional: Validar que todas las citas sean del mismo cliente
    const firstClientId = appointments[0].client.id;
    const allSameClient = appointments.every(app => app.client.id === firstClientId);
    if (!allSameClient) {
      throw new BadRequestException('Todas las citas seleccionadas deben pertenecer al mismo cliente para una factura combinada.');
    }

    // 2. Generar el PDF combinado
    const pdfBuffer = await this.invoiceService.generateCombinedInvoicePdf(appointments);

    // 3. Enviar el PDF como respuesta
    res.set({
      'Content-Type': 'application/pdf',
      // CORRECCIÓN AQUÍ: Usar appointments[0] en lugar de firstAppointment
      'Content-Disposition': `attachment; filename="factura_combinada_${appointments[0].client.name.replace(/\s/g, '_')}.pdf"`, // Nombre del archivo
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
