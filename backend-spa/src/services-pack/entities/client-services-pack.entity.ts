import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { ServicesPack } from './services-pack.entity';
import { PaymentMethod } from '../../appointment/enums/payment-method.enum'; // <-- Nueva importación

@Entity()
export class ClientServicesPack {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: number;

  @ManyToOne(() => ServicesPack, { eager: true })
  @JoinColumn({ name: 'servicesPackId' })
  servicesPack: ServicesPack;

  @Column()
  servicesPackId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod; // <-- Nuevo campo

  @Column({ default: 0 })
  sessionsUsed: number;

  @Column({ default: 0 })
  sessionsRemaining: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchaseDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @Column({ default: true })
  isActive: boolean;
}