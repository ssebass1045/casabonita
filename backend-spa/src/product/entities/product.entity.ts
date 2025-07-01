// File: backend-spa/src/product/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // Precio del producto
  price: number;

  @Column({ type: 'boolean', default: true }) // <-- CAMBIO: stock por isActive
  isActive: boolean; // true si está disponible, false si está agotado/inactivo

  @Column({ nullable: true }) // URL de la imagen del producto (Cloudinary)
  imageUrl: string;
}
