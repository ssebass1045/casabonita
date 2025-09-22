// File: backend-spa/src/whatsapp/whatsapp.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ClientService } from '../client/client.service';
import { Gender } from '../client/enums/gender.enum';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale'; // Para formato en español

// Función helper para crear una pausa en el código asíncrono
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  // NUEVO: Definir la zona horaria de la aplicación
  private readonly appTimezone: string;

  constructor(
    private configService: ConfigService,
    private clientService: ClientService,
  ) {
    this.apiUrl = this.configService.get<string>('WASENDER_API_URL')!;
    this.apiKey = this.configService.get<string>('WASENDER_API_KEY')!;
    // NUEVO: Obtener la zona horaria de la configuración (o usar un valor por defecto)
    this.appTimezone = this.configService.get<string>('APP_TIMEZONE') || 'America/Bogota';

    if (!this.apiUrl || !this.apiKey) {
      this.logger.error('WASENDER_API_URL o WASENDER_API_KEY no están configuradas en el .env');
      throw new InternalServerErrorException('Configuración de WhatsApp incompleta. Verifique el archivo .env');
    }
  }

  /**
   * Envía un mensaje de texto a través de WasenderAPI.
   * @param to - Número de teléfono del destinatario en formato internacional (ej. +573101234567).
   * @param message - El contenido del mensaje a enviar.
   * @returns La respuesta de la API si el envío es exitoso, o null si falla.
   */
  async sendMessage(to: string, message: string): Promise<any | null> {
    try {
      const payload = {
        to: to,
        text: message, // La API de Wasender espera el campo 'text'
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };

      this.logger.log(`Intentando enviar mensaje a ${to}: ${message.substring(0, 50)}...`);
      const response = await axios.post(this.apiUrl, payload, { headers });
      this.logger.log(`Mensaje enviado a ${to}. Respuesta: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`FALLO al enviar mensaje a ${to}: ${error.message}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Respuesta de WasenderAPI (error): ${JSON.stringify(error.response?.data)}`);
      }
      return null; // No relanzar la excepción para no detener el flujo principal
    }
  }


  // --- NUEVO MÉTODO: sendMessageWithImage ---
  async sendMessageWithImage(to: string, imageUrl: string, caption?: string): Promise<any | null> {
    try {
      // Construimos el payload JSON exactamente como en el ejemplo
      const payload = {
        to: to,
        imageUrl: imageUrl,
        text: caption || '', // El ejemplo usa 'text' como pie de foto
      };
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` };
      this.logger.log(`Intentando enviar imagen a ${to} con URL: ${imageUrl}`);
      const response = await axios.post(this.apiUrl, payload, { headers });
      this.logger.log(`Imagen enviada a ${to}.`);
      return response.data;
    } catch (error) {
      this.logger.error(`FALLO al enviar imagen a ${to}: ${error.message}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Respuesta de WasenderAPI (error): ${JSON.stringify(error.response?.data)}`);
      }
      return null;
    }
  }


  async sendDocument(to: string, documentUrl: string, filename: string, caption?: string): Promise<any | null> {
    try {
      const payload = {
        to: to,
        documentUrl: documentUrl, // Campo para enviar documentos
        filename: filename, // Nombre del archivo que verá el usuario
        text: caption || '', // Mensaje que acompaña al documento
      };
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` };
      this.logger.log(`Intentando enviar documento a ${to}: ${documentUrl}`);
      const response = await axios.post(this.apiUrl, payload, { headers });
      this.logger.log(`Documento enviado a ${to}.`);
      return response.data;
    } catch (error) {
      this.logger.error(`FALLO al enviar documento a ${to}: ${error.message}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Respuesta de WasenderAPI (error): ${JSON.stringify(error.response?.data)}`);
      }
      return null;
    }
  }

  /**
   * Envía una notificación de confirmación de cita al cliente.
   */
  async sendAppointmentConfirmationToClient(clientPhone: string, clientName: string, employeeName: string, serviceName: string, startTime: Date): Promise<void> {
    const formattedTime = formatInTimeZone(startTime, this.appTimezone, 'EEEE d \'de\' MMMM \'de\' yyyy, h:mm a', { locale: es });
    const message = `¡Hola ${clientName}! Tu cita en Casa Bonita ha sido CONFIRMADA para el servicio de ${serviceName} con ${employeeName} el ${formattedTime}. ¡Te esperamos!`;
    await this.sendMessage(clientPhone, message);
  }

  /**
   * Envía una notificación de nueva cita al empleado.
   */
  async sendNewAppointmentToEmployee(employeePhone: string, employeeName: string, clientName: string, serviceName: string, startTime: Date, status: string): Promise<void> {
    const formattedTime = formatInTimeZone(startTime, this.appTimezone, 'EEEE d \'de\' MMMM \'de\' yyyy, h:mm a', { locale: es });
    const message = `¡Hola ${employeeName}! Tienes una NUEVA CITA (${status}) con ${clientName} para ${serviceName} el ${formattedTime}.`;
    await this.sendMessage(employeePhone, message);
  }

  /**
   * Envía una notificación de actualización de cita al empleado.
   */
  async sendAppointmentUpdateToEmployee(employeePhone: string, employeeName: string, clientName: string, serviceName: string, startTime: Date, changes: string[]): Promise<void> {
    const formattedTime = formatInTimeZone(startTime, this.appTimezone, 'EEEE d \'de\' MMMM \'de\' yyyy, h:mm a', { locale: es });
    const changesText = changes.join('. ');
    const message = `¡Hola ${employeeName}! La cita con ${clientName} para ${serviceName} el ${formattedTime} ha sido ACTUALIZADA. Detalles: ${changesText}.`;
    await this.sendMessage(employeePhone, message);
  }

  /**
   * Envía una notificación de cancelación de cita al empleado.
   */
  async sendAppointmentCancellationToEmployee(employeePhone: string, employeeName: string, clientName: string, serviceName: string, startTime: Date): Promise<void> {
    const formattedTime = formatInTimeZone(startTime, this.appTimezone, 'EEEE d \'de\' MMMM \'de\' yyyy, h:mm a', { locale: es });
    const message = `¡Hola ${employeeName}! La cita de ${clientName} para el servicio de ${serviceName} el ${formattedTime} ha sido CANCELADA.`;
    await this.sendMessage(employeePhone, message);
  }

  /**
   * Envía una factura al cliente.
   * @param invoiceUrl - La URL pública donde se puede descargar el PDF de la factura.
   */
  async sendInvoice(clientPhone: string, clientName: string, invoiceUrl: string, filename: string): Promise<void> {
    const caption = `¡Hola ${clientName}! Gracias por visitar Casa Bonita SPA. Adjuntamos tu factura. ¡Esperamos verte pronto!`;
    await this.sendDocument(clientPhone, invoiceUrl, filename, caption);
  }

  // --- NUEVO MÉTODO: sendCombinedInvoice ---
  async sendCombinedInvoice(clientPhone: string, clientName: string, invoiceUrl: string, filename: string): Promise<void> {
    const caption = `¡Hola ${clientName}! Gracias por visitar Casa Bonita SPA. Adjuntamos tu factura combinada. ¡Esperamos verte pronto!`;
    await this.sendDocument(clientPhone, invoiceUrl, filename, caption);
  }

  /**
   * Envía un mensaje personalizado a clientes filtrados, respetando el límite de tasa.
   */
   async sendCustomMessageToFilteredClients(
    message: string,
    filters: { ageMin?: number; ageMax?: number; gender?: Gender; },
    imageUrl?: string, // <-- Recibe la URL de la imagen (string)
  ): Promise<{ sentCount: number; failedCount: number }> {
    const clients = await this.clientService.findAll(filters);
    let sentCount = 0;
    let failedCount = 0;

    for (const client of clients) {
      if (client.phone) {
        let result;
        if (imageUrl) {
          // Si hay una imagen, se envía con el mensaje como pie de foto
          result = await this.sendMessageWithImage(client.phone, imageUrl, message);
        } else {
          // Si no, se envía solo el texto
          result = await this.sendMessage(client.phone, message);
        }
        
        if (result) {
          sentCount++;
        } else {
          failedCount++;
        }
        await delay(5000);
      } else {
        this.logger.warn(`Cliente ${client.name} (ID: ${client.id}) no tiene número de teléfono.`);
        failedCount++;
      }
    }
    return { sentCount, failedCount };
  }

   // --- NUEVO MÉTODO: sendAppointmentReminder ---
  async sendAppointmentReminder(clientPhone: string, clientName: string, serviceName: string, startTime: Date): Promise<void> {
    const formattedTime = formatInTimeZone(startTime, this.appTimezone, 'h:mm a', { locale: es });
    const message = `¡Hola ${clientName}! Te recordamos tu cita en Casa Bonita para el servicio de ${serviceName} Mañana a las ${formattedTime}. ¡Te esperamos!`;
    await this.sendMessage(clientPhone, message);
  }
}
