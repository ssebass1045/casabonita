import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesPack } from './entities/services-pack.entity';
import { ClientServicesPack } from './entities/client-services-pack.entity';
import { ServicesPackSession } from './entities/services-pack-session.entity';
import { ServicesPackPayment } from './entities/services-pack-payment.entity';
import { ServicesPackService } from './services-pack.service';
import { ServicesPackController } from './services-pack.controller';
import { ServicesPackSessionService } from './services-pack-session.service';
import { ServicesPackSessionController } from './services-pack-session.controller';
import { ServicesPackPaymentService } from './services-pack-payment.service';
import { ServicesPackPaymentController } from './services-pack-payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServicesPack,
      ClientServicesPack,
      ServicesPackSession,
      ServicesPackPayment,
    ]),
  ],
  controllers: [
    ServicesPackController, 
    ServicesPackSessionController,
    ServicesPackPaymentController, // <-- Agregar nuevo controller
  ],
  providers: [
    ServicesPackService, 
    ServicesPackSessionService,
    ServicesPackPaymentService,
  ],
  exports: [
    ServicesPackService, 
    TypeOrmModule.forFeature([ServicesPackSession]), 
    ServicesPackSessionService,
    ServicesPackPaymentService,
  ],
})
export class ServicesPackModule {}