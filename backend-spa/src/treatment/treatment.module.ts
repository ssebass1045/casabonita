// File: backend-spa/src/treatment/treatment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentService } from './treatment.service';
import { TreatmentController } from './treatment.controller';
import { Treatment } from './entities/treatment.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Treatment]),
    CloudinaryModule,
  ],
  controllers: [TreatmentController],
  providers: [TreatmentService],
  exports: [TreatmentService], // <-- ¡Añade esta línea!
})
export class TreatmentModule {}
