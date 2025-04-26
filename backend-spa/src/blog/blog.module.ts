
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Verificar importación
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entities/blog.entity'; // Verificar importación
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog]), 
    CloudinaryModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
