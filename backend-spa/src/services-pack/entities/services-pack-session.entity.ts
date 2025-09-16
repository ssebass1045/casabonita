import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ClientServicesPack } from './client-services-pack.entity';
import { Employee } from '../../employee/entities/employee.entity';

@Entity()
export class ServicesPackSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClientServicesPack)
  @JoinColumn({ name: 'clientServicesPackId' })
  clientServicesPack: ClientServicesPack;

  @Column()
  clientServicesPackId: number;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sessionDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  employeePayment: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}