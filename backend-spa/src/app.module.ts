
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TreatmentModule } from './treatment/treatment.module';
import { BlogModule } from './blog/blog.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { EmployeeModule } from './employee/employee.module';
import { ProductModule } from './product/product.module';
import { ClientModule } from './client/client.module';
import { AppointmentModule } from './appointment/appointment.module';
import { EmployeeAvailabilityModule } from './employee-availability/employee-availability.module';
import { MetricsModule } from './metrics/metrics.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { InvoiceModule } from './invoice/invoice.module';
import { TaskSchedulingModule } from './task-scheduling/task-scheduling.module';
import { ProductSaleModule } from './product-sale/product-sale.module';

@Module({
  imports: [
    // ConfigModule debe cargarse primero para que las variables de entorno estén disponibles
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigModule esté disponible globalmente
      envFilePath: '.env', // Especifica la ruta a tu archivo .env
    }),
    TypeOrmModule.forRoot({
      /*
      //lineas para probar en local
      type: process.env.DATABASE_TYPE as any, // Lee del .env
      host: process.env.DATABASE_HOST, // Lee del .env
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10), // Lee del .env y convierte a número
      username: process.env.DATABASE_USERNAME, // Lee del .env
      password: process.env.DATABASE_PASSWORD, // Lee del .env
      database: process.env.DATABASE_NAME, // Lee del .env
      */

      type: 'postgres', // Especifica el driver directamente
      url: process.env.DATABASE_URL, // <-- Usa la URL completa
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,

      synchronize: false,
      logging: true,
    }),
    ScheduleModule.forRoot(),
    TreatmentModule,
    BlogModule,
    AuthModule,
    UserModule,
    CloudinaryModule,
    EmployeeModule,
    ProductModule,
    ClientModule,
    AppointmentModule,
    EmployeeAvailabilityModule,
    MetricsModule,
    WhatsappModule,
    InvoiceModule,
    TaskSchedulingModule,
    ProductSaleModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
