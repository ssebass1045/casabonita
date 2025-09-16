import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ServicesPackPayment } from './entities/services-pack-payment.entity';
import { ClientServicesPack } from './entities/client-services-pack.entity';
import { PaymentMethod } from 'src/appointment/enums/payment-method.enum';

@Injectable()
export class ServicesPackPaymentService {
  constructor(
    @InjectRepository(ServicesPackPayment)
    private readonly paymentRepository: Repository<ServicesPackPayment>,
    @InjectRepository(ClientServicesPack)
    private readonly clientPackRepository: Repository<ClientServicesPack>,
  ) {}

  async createPayment(
    clientServicesPackId: number, 
    amount: number, 
    paymentMethod: PaymentMethod,
    notes?: string
  ): Promise<ServicesPackPayment> {
    // Crear el pago
    const payment = this.paymentRepository.create({
      clientServicesPackId,
      amount,
      paymentMethod,
      notes,
      paymentDate: new Date()
    });

    // Actualizar el paquete del cliente
    const clientPack = await this.clientPackRepository.findOne({
      where: { id: clientServicesPackId }
    });
    
    if (clientPack) {
      clientPack.amountPaid = Number(clientPack.amountPaid) + amount;
      await this.clientPackRepository.save(clientPack);
    }

    return await this.paymentRepository.save(payment);
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<ServicesPackPayment[]> {
    return await this.paymentRepository.find({
      where: {
        paymentDate: Between(startDate, endDate)
      },
      relations: ['clientServicesPack', 'clientServicesPack.client']
    });
  }

  async getPaymentSummaryByDateRange(startDate: Date, endDate: Date): Promise<any> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.paymentMethod', 'paymentMethod')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.paymentDate BETWEEN :start AND :end', { 
        start: startDate, 
        end: endDate 
      })
      .groupBy('payment.paymentMethod')
      .getRawMany();

    return result;
  }
}