// File: backend-spa/src/product/product.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Express } from 'express';
import { Roles } from '../auth/decorators/roles.decorator'; // <-- Importa el decorador
import { UserRole } from '../user/entities/user.entity'; // <-- Importa el enum
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Importa el guardia

//@UseGuards(AuthGuard('jwt'), RolesGuard) // <-- Aplica el guardia globalmente
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN) // <-- Aplica el decorador
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productService.create(createProductDto, file);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN) // <-- Aplica el decorador
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productService.update(id, updateProductDto, file);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN) // <-- Aplica el decorador
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }

  // --- Rutas Públicas ---

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
}
