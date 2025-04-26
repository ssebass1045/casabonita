
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Verificar importación
import { TreatmentService } from './treatment.service';
import { TreatmentController } from './treatment.controller';
import { Treatment } from './entities/treatment.entity'; // Verificar importación
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Treatment]), 
    CloudinaryModule,
  ],
  controllers: [TreatmentController],
  providers: [TreatmentService],
})
export class TreatmentModule {}
