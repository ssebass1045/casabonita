// File: backend-spa/src/invoice/invoice.controller.ts
import { Controller, Get, Param, Res, UseGuards, ParseIntPipe, NotFoundException, BadRequestException, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { AppointmentService } from '../appointment/appointment.service';
import { WhatsappService } from '../whatsapp/whatsapp.service'; // <-- Importa WhatsappService
import { Appointment } from '../appointment/entities/appointment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

//@UseGuards(AuthGuard('jwt'), RolesGuard)
//@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly appointmentService: AppointmentService,
    private readonly whatsappService: WhatsappService, // <-- Inyecta WhatsappService
    private readonly cloudinaryService: CloudinaryService, // <-- Inyecta CloudinaryService
  ) {}

  // Endpoint para generar factura individual (ya existente)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':appointmentId/generate')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
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

  // Endpoint para generar factura combinada (ya existente)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('generate-combined')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async generateCombinedInvoice(
    @Body('appointmentIds') appointmentIds: number[],
    @Res() res: Response,
  ) {
    if (!appointmentIds || appointmentIds.length === 0) {
      throw new BadRequestException('Se requiere al menos un ID de cita para generar una factura combinada.');
    }

    const appointments: Appointment[] = [];
    for (const id of appointmentIds) {
      const app = await this.appointmentService.findOne(id);
      if (!app) {
        throw new NotFoundException(`Cita con ID ${id} no encontrada.`);
      }
      if (app.status !== 'Realizada' || app.paymentStatus !== 'Pagado') {
        throw new BadRequestException(`La cita con ID ${id} no cumple los requisitos para ser facturada (debe estar Realizada y Pagado).`);
      }
      appointments.push(app);
    }

    const firstClientId = appointments[0].client.id;
    const allSameClient = appointments.every(app => app.client.id === firstClientId);
    if (!allSameClient) {
      throw new BadRequestException('Todas las citas seleccionadas deben pertenecer al mismo cliente para una factura combinada.');
    }

    const pdfBuffer = await this.invoiceService.generateCombinedInvoicePdf(appointments);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura_combinada_${appointments[0].client.name.replace(/\s/g, '_')}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  // --- NUEVO ENDPOINT: sendInvoiceByWhatsapp ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post(':appointmentId/send-whatsapp')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendInvoiceByWhatsapp(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
  ): Promise<{ message: string }> {
    const appointment = await this.appointmentService.findOne(appointmentId);
    if (!appointment) throw new NotFoundException(`Cita con ID ${appointmentId} no encontrada.`);
    if (!appointment.client?.phone) throw new BadRequestException('El cliente no tiene un número de teléfono registrado.');

    const pdfBuffer = await this.invoiceService.generateInvoicePdf(appointment);
    const filename = `factura_${appointment.id}.pdf`;

    // Sube el PDF a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadPdfBuffer(pdfBuffer, filename);
    const publicUrl = uploadResult.secure_url; // Obtiene la URL pública de Cloudinary

    await this.whatsappService.sendInvoice(
      appointment.client.phone,
      appointment.client.name,
      publicUrl,
      filename,
    );

    return { message: `Factura enviada por WhatsApp al cliente ${appointment.client.name}.` };
  }

  // --- NUEVO ENDPOINT: sendCombinedInvoiceByWhatsapp ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('send-combined-whatsapp')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendCombinedInvoiceByWhatsapp(
    @Body('appointmentIds') appointmentIds: number[],
  ): Promise<{ message: string }> {
    if (!appointmentIds || appointmentIds.length === 0) {
      throw new BadRequestException('Se requiere al menos un ID de cita para generar una factura combinada.');
    }

    const appointments: Appointment[] = [];
    for (const id of appointmentIds) {
      const app = await this.appointmentService.findOne(id);
      if (!app) {
        throw new NotFoundException(`Cita con ID ${id} no encontrada.`);
      }
      if (app.status !== 'Realizada' || app.paymentStatus !== 'Pagado') {
        throw new BadRequestException(`La cita con ID ${id} no cumple los requisitos para ser facturada (debe estar Realizada y Pagado).`);
      }
      appointments.push(app);
    }

    const firstClientId = appointments[0].client.id;
    const allSameClient = appointments.every(app => app.client.id === firstClientId);
    if (!allSameClient) {
      throw new BadRequestException('Todas las citas seleccionadas deben pertenecer al mismo cliente para una factura combinada.');
    }

    const pdfBuffer = await this.invoiceService.generateCombinedInvoicePdf(appointments);
    const filename = `factura_combinada_${appointments[0].client.name.replace(/\s/g, '_')}.pdf`;
    //const filePath = await this.invoiceService.saveInvoicePdf(pdfBuffer, filename);
    const uploadResult = await this.cloudinaryService.uploadPdfBuffer(pdfBuffer, filename);
    const publicUrl = uploadResult.secure_url;

    await this.whatsappService.sendCombinedInvoice(
      appointments[0].client.phone,
      appointments[0].client.name,
      publicUrl,
      filename,
    );

    return { message: `Factura combinada enviada por WhatsApp al cliente ${appointments[0].client.name}.` };
  }
}
