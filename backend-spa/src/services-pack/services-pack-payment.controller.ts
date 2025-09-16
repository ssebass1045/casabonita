import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ServicesPackPaymentService } from './services-pack-payment.service';
import { PaymentMethod } from 'src/appointment/enums/payment-method.enum'; 

@Controller('services-pack-payments')
export class ServicesPackPaymentController {
  constructor(private readonly paymentService: ServicesPackPaymentService) {}

  @Post()
  async createPayment(
    @Body('clientServicesPackId') clientServicesPackId: number,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
    @Body('notes') notes?: string
  ) {
    return await this.paymentService.createPayment(
      clientServicesPackId,
      amount,
      paymentMethod,
      notes
    );
  }

  @Get('by-date-range')
  async getPaymentsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Incluir todo el día final
    
    return await this.paymentService.getPaymentsByDateRange(start, end);
  }
}