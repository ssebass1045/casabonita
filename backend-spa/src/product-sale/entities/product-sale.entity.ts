// File: backend-spa/src/product-sale/entities/product-sale.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
// --- AÑADE LA IMPORTACIÓN DEL ENUM ---
import { PaymentMethod } from '../../appointment/enums/payment-method.enum';

@Entity()
export class ProductSale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  // --- NUEVO CAMPO AÑADIDO ---
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true, // Hacemos que sea obligatorio saber cómo se pagó
    default: PaymentMethod.EFECTIVO
  })
  paymentMethod: PaymentMethod;
  // --- FIN DEL NUEVO CAMPO ---

  @CreateDateColumn()
  saleDate: Date;
}
