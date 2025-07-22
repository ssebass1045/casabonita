// File: backend-spa/src/product/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductCategory } from '../entities/product.entity';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    // Hacemos que la categoría sea opcional en la actualización
    @IsEnum(ProductCategory)
    @IsOptional()
    category?: ProductCategory;
}
