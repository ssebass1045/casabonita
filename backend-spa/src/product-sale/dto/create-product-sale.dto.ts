// File: backend-spa/src/product-sale/dto/create-product-sale.dto.ts
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductSaleDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  // ELIMINAMOS:
  // @IsNumber()
  // @IsNotEmpty()
  // clientId: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pricePerUnit: number;
}
