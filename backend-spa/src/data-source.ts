import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // Asegúrate de cargar las variables de entorno

export const AppDataSource = new DataSource({
  /*
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  */

  type: 'postgres', // Especifica el driver directamente
  url: process.env.DATABASE_URL, // <-- Usa la URL completa
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Busca todas tus entidades
  migrations: [__dirname + '/migrations/*{.ts,.js}'], // Aquí se guardarán tus migraciones
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false, // Importante: mantener en false para migraciones
  logging: true,
});
