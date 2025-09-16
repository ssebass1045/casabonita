import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ClientServicesPack } from './client-services-pack.entity';
import { PaymentMethod } from '../../appointment/enums/payment-method.enum';

@Entity()
export class ServicesPackPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClientServicesPack)
  @JoinColumn({ name: 'clientServicesPackId' })
  clientServicesPack: ClientServicesPack;

  @Column()
  clientServicesPackId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
