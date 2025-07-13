import { Test, TestingModule } from '@nestjs/testing';
import { ProductSaleController } from './product-sale.controller';
import { ProductSaleService } from './product-sale.service';

describe('ProductSaleController', () => {
  let controller: ProductSaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSaleController],
      providers: [ProductSaleService],
    }).compile();

    controller = module.get<ProductSaleController>(ProductSaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
