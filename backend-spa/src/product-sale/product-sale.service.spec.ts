import { Test, TestingModule } from '@nestjs/testing';
import { ProductSaleService } from './product-sale.service';

describe('ProductSaleService', () => {
  let service: ProductSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSaleService],
    }).compile();

    service = module.get<ProductSaleService>(ProductSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
