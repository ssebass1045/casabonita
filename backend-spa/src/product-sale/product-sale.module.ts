// File: backend-spa/src/product-sale/product-sale.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSaleService } from './product-sale.service';
import { ProductSaleController } from './product-sale.controller';
import { ProductSale } from './entities/product-sale.entity';
import { ProductModule } from '../product/product.module'; // <-- ¡Añade esta importación!

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSale]),
    ProductModule, // <-- ¡Asegúrate de que ProductModule esté aquí!
  ],
  controllers: [ProductSaleController],
  providers: [ProductSaleService],
})
export class ProductSaleModule {}
