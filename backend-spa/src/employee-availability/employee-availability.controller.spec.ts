import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAvailabilityController } from './employee-availability.controller';
import { EmployeeAvailabilityService } from './employee-availability.service';

describe('EmployeeAvailabilityController', () => {
  let controller: EmployeeAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeAvailabilityController],
      providers: [EmployeeAvailabilityService],
    }).compile();

    controller = module.get<EmployeeAvailabilityController>(EmployeeAvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
