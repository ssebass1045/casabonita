import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAvailabilityService } from './employee-availability.service';

describe('EmployeeAvailabilityService', () => {
  let service: EmployeeAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeAvailabilityService],
    }).compile();

    service = module.get<EmployeeAvailabilityService>(EmployeeAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
