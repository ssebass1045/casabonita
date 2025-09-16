import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ServicesPack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column()
  sessionCount: number;

  @Column({ default: true })
  isActive: boolean;
}