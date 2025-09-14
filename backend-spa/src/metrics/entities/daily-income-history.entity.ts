// File: backend-spa/src/metrics/entities/daily-income-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

  // --- NUEVAS COLUMNAS PARA EL DESGLOSE ---
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  incomeByCash: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  incomeByCard: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  incomeByTransfer: number;
  // --- FIN DE LAS NUEVAS COLUMNAS ---

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
