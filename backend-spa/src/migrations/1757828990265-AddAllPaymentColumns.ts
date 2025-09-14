import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllPaymentColumns1757828990265 implements MigrationInterface {
    name = 'AddAllPaymentColumns1757828990265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_sale_paymentmethod_enum" AS ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'Otro')`);
        await queryRunner.query(`ALTER TABLE "product_sale" ADD "paymentMethod" "public"."product_sale_paymentmethod_enum" DEFAULT 'Efectivo'`);
        await queryRunner.query(`ALTER TABLE "daily_income_history" ADD "incomeByCash" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "daily_income_history" ADD "incomeByCard" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "daily_income_history" ADD "incomeByTransfer" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_income_history" DROP COLUMN "incomeByTransfer"`);
        await queryRunner.query(`ALTER TABLE "daily_income_history" DROP COLUMN "incomeByCard"`);
        await queryRunner.query(`ALTER TABLE "daily_income_history" DROP COLUMN "incomeByCash"`);
        await queryRunner.query(`ALTER TABLE "product_sale" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`DROP TYPE "public"."product_sale_paymentmethod_enum"`);
    }

}
