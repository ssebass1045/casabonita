// File: backend-spa/src/product-sale/product-sale.controller.ts
import { Controller, Get, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { ProductSaleService } from './product-sale.service';
import { CreateProductSaleDto } from './dto/create-product-sale.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('product-sales')
export class ProductSaleController {
  constructor(private readonly productSaleService: ProductSaleService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF) // Tanto Admin como Staff pueden registrar una venta
  create(@Body(ValidationPipe) createProductSaleDto: CreateProductSaleDto) {
    return this.productSaleService.create(createProductSaleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN) // Solo Admin puede ver el historial de ventas
  findAll() {
    return this.productSaleService.findAll();
  }
}
