// File: backend-spa/src/product/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
      createProductDto: CreateProductDto,
      file?: Express.Multer.File
    ): Promise<Product> {

    let imageUrl: string | undefined = undefined;
    if (file) {
      try {
        const result = await this.cloudinaryService.uploadFile(file);
        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Error uploading product image to Cloudinary:', error);
      }
    }

    const newProduct = this.productRepository.create({
        ...createProductDto,
        imageUrl: imageUrl ?? createProductDto.imageUrl,
    });
    return this.productRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(
      id: number,
      updateProductDto: UpdateProductDto,
      file?: Express.Multer.File
    ): Promise<Product> {

    const product = await this.productRepository.preload({ id });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado para actualizar`);
    }

    let imageUrl: string | undefined = product.imageUrl;
    if (file) {
      try {
        const result = await this.cloudinaryService.uploadFile(file);
        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Error uploading new product image to Cloudinary:', error);
      }
    } else if (updateProductDto.imageUrl !== undefined) {
        imageUrl = updateProductDto.imageUrl;
    }

    const updatedProduct = this.productRepository.merge(product, {
        ...updateProductDto,
        imageUrl: imageUrl,
    });

    return this.productRepository.save(updatedProduct);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado para eliminar`);
    }
  }
}
