// File: backend-spa/src/product-sale/entities/product-sale.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class ProductSale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { eager: true }) // Relación con el Producto vendido
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  // ELIMINAMOS:
  // @ManyToOne(() => Client, { eager: true })
  // @JoinColumn({ name: 'clientId' })
  // client: Client;
  // @Column()
  // clientId: number;

  @Column({ type: 'int' })
  quantity: number; // Cantidad de unidades vendidas

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerUnit: number; // Precio por unidad al momento de la venta

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // quantity * pricePerUnit

  @CreateDateColumn() // Columna que se llena automáticamente con la fecha de creación
  saleDate: Date;
}
