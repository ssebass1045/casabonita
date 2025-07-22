import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCategory1753125441687 implements MigrationInterface {
    name = 'AddProductCategory1753125441687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_category_enum" AS ENUM('facial', 'corporal', 'cabello', 'tratamiento_especial', 'otros')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "category" "public"."product_category_enum" NOT NULL DEFAULT 'otros'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."product_category_enum"`);
    }

}
