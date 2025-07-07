// File: backend-spa/src/whatsapp/whatsapp.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WASENDER_API_URL')!;
    this.apiKey = this.configService.get<string>('WASENDER_API_KEY')!;

    if (!this.apiUrl || !this.apiKey) {
      this.logger.error('WASENDER_API_URL o WASENDER_API_KEY no están configuradas en el .env');
      throw new InternalServerErrorException('Configuración de WhatsApp incompleta. Verifique el archivo .env');
    }
  }

  async sendMessage(to: string, message: string): Promise<any | null> {
    try {
      const payload = {
        to: to,
        text: message, // El campo 'text' es el que espera WasenderAPI
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
      return null; // No relanzar para no romper el flujo principal
    }
  }

  // Mensaje de confirmación de cita para el cliente
  async sendAppointmentConfirmationToClient(clientPhone: string, clientName: string, employeeName: string, serviceName: string, startTime: Date): Promise<void> {
    const formattedTime = startTime.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
    const message = `¡Hola ${clientName}! Tu cita en Casa Bonita ha sido CONFIRMADA para el servicio de ${serviceName} con ${employeeName} el ${formattedTime}. ¡Te esperamos!`;
    await this.sendMessage(clientPhone, message);
  }

  // Mensaje de nueva cita agendada para el empleado
  async sendNewAppointmentToEmployee(employeePhone: string, employeeName: string, clientName: string, serviceName: string, startTime: Date, status: string): Promise<void> {
    const formattedTime = startTime.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
    const message = `¡Hola ${employeeName}! Tienes una NUEVA CITA (${status}) con ${clientName} para ${serviceName} el ${formattedTime}.`;
    await this.sendMessage(employeePhone, message);
  }

  // Mensaje de cita modificada para el empleado
  async sendAppointmentUpdateToEmployee(employeePhone: string, employeeName: string, clientName: string, serviceName: string, startTime: Date, newStatus: string): Promise<void> {
    const formattedTime = startTime.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
    const message = `¡Hola ${employeeName}! La cita con ${clientName} para ${serviceName} el ${formattedTime} ha sido ACTUALIZADA a estado: ${newStatus}.`;
    await this.sendMessage(employeePhone, message);
  }

  // Mensaje de cita cancelada para el empleado
  async sendAppointmentCancellationToEmployee(employeePhone: string, employeeName: string, clientName: string, serviceName: string, startTime: Date): Promise<void> {
    const formattedTime = startTime.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
    const message = `¡Hola ${employeeName}! La cita de ${clientName} para el servicio de ${serviceName} el ${formattedTime} ha sido CANCELADA.`;
    await this.sendMessage(employeePhone, message);
  }

  // Método para enviar mensajes personalizados (lo implementaremos más adelante)
  // async sendCustomMessage(to: string, message: string): Promise<void> { ... }
}
