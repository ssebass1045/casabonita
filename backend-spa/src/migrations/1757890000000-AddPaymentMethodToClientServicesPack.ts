import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentMethodToClientServicesPack1757890000000 implements MigrationInterface {
    name = 'AddPaymentMethodToClientServicesPack1757890000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "client_services_pack" 
            ADD COLUMN "paymentMethod" character varying
        `);
        
        // Actualizar registros existentes con un valor por defecto
        await queryRunner.query(`
            UPDATE "client_services_pack" 
            SET "paymentMethod" = 'Efectivo' 
            WHERE "paymentMethod" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "client_services_pack" 
            DROP COLUMN "paymentMethod"
        `);
    }
}