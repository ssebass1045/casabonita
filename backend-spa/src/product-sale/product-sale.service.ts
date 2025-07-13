// File: backend-spa/src/product-sale/product-sale.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductSaleDto } from './dto/create-product-sale.dto'; // <-- Asegúrate de que esta importación sea correcta
import { ProductSale } from './entities/product-sale.entity';
import { ProductService } from '../product/product.service';

@Injectable()
export class ProductSaleService {
  constructor(
    @InjectRepository(ProductSale)
    private productSaleRepository: Repository<ProductSale>,
    private productService: ProductService,
  ) {}

  // --- ¡CORRECCIÓN AQUÍ! ---
  async create(createProductSaleDto: CreateProductSaleDto): Promise<ProductSale> { // <-- Cambiado CreateProductDto a CreateProductSaleDto
    // Verificar que el producto exista
    await this.productService.findOne(createProductSaleDto.productId);

    const newSale = this.productSaleRepository.create({
      ...createProductSaleDto,
      totalPrice: createProductSaleDto.quantity * createProductSaleDto.pricePerUnit,
    });

    return this.productSaleRepository.save(newSale);
  }

  async findAll(): Promise<ProductSale[]> {
    return this.productSaleRepository.find({ order: { saleDate: 'DESC' } });
  }
}
