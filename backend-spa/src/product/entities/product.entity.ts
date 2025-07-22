// File: backend-spa/src/product/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


// NUEVO: Definimos el enum para las categorías de productos
export enum ProductCategory {
  FACIAL = 'facial',
  CORPORAL = 'corporal',
  CABELLO = 'cabello',
  TRATAMIENTO_ESPECIAL = 'tratamiento_especial',
  OTROS = 'otros',
}

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

  // NUEVO: Columna para la categoría
  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.OTROS, // Un valor por defecto seguro
  })
  category: ProductCategory;

  @Column({ type: 'boolean', default: true }) // <-- CAMBIO: stock por isActive
  isActive: boolean; // true si está disponible, false si está agotado/inactivo

  @Column({ nullable: true }) // URL de la imagen del producto (Cloudinary)
  imageUrl: string;
}
