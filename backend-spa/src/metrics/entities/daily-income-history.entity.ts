import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('daily_income_history')
export class DailyIncomeHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalIncome: number;

  @Column('decimal', { precision: 10, scale: 2 })
  appointmentIncome: number;

  @Column('decimal', { precision: 10, scale: 2 })
  productSalesIncome: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
