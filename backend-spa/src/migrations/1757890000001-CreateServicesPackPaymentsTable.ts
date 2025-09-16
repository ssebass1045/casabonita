import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServicesPackPaymentsTable1757890000001 implements MigrationInterface {
    name = 'CreateServicesPackPaymentsTable1757890000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "services_pack_payment" (
                "id" SERIAL PRIMARY KEY,
                "clientServicesPackId" integer NOT NULL,
                "amount" decimal(10,2) NOT NULL,
                "paymentMethod" character varying NOT NULL,
                "paymentDate" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "notes" text,
                CONSTRAINT "FK_services_pack_payment_client_pack" 
                FOREIGN KEY ("clientServicesPackId") 
                REFERENCES "client_services_pack"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "services_pack_payment"`);
    }
}