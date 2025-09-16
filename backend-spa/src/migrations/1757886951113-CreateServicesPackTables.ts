import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServicesPackTables1757886951113 implements MigrationInterface {
    name = 'CreateServicesPackTables1757886951113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services_pack" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "totalPrice" numeric(10,2) NOT NULL, "sessionCount" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b26c0b27f78651a2be771f39094" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client_services_pack" ("id" SERIAL NOT NULL, "clientId" integer NOT NULL, "servicesPackId" integer NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "amountPaid" numeric(10,2) NOT NULL DEFAULT '0', "sessionsUsed" integer NOT NULL DEFAULT '0', "sessionsRemaining" integer NOT NULL DEFAULT '0', "purchaseDate" TIMESTAMP NOT NULL DEFAULT now(), "expirationDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_fcd9454283d4c6e9d67162f35ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services_pack_session" ("id" SERIAL NOT NULL, "clientServicesPackId" integer NOT NULL, "employeeId" integer NOT NULL, "sessionDate" TIMESTAMP NOT NULL DEFAULT now(), "employeePayment" numeric(10,2) NOT NULL, "notes" text, CONSTRAINT "PK_eb72dfbdea4f8457773696e2ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "client_services_pack" ADD CONSTRAINT "FK_17679851fbe067152a3fb991b68" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_services_pack" ADD CONSTRAINT "FK_cfddf398d2dedcbe0ef2c5d3298" FOREIGN KEY ("servicesPackId") REFERENCES "services_pack"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services_pack_session" ADD CONSTRAINT "FK_bc45d682545413bd7aed0ff7ac5" FOREIGN KEY ("clientServicesPackId") REFERENCES "client_services_pack"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services_pack_session" ADD CONSTRAINT "FK_0fc60f814bbaba48226110b4c71" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services_pack_session" DROP CONSTRAINT "FK_0fc60f814bbaba48226110b4c71"`);
        await queryRunner.query(`ALTER TABLE "services_pack_session" DROP CONSTRAINT "FK_bc45d682545413bd7aed0ff7ac5"`);
        await queryRunner.query(`ALTER TABLE "client_services_pack" DROP CONSTRAINT "FK_cfddf398d2dedcbe0ef2c5d3298"`);
        await queryRunner.query(`ALTER TABLE "client_services_pack" DROP CONSTRAINT "FK_17679851fbe067152a3fb991b68"`);
        await queryRunner.query(`DROP TABLE "services_pack_session"`);
        await queryRunner.query(`DROP TABLE "client_services_pack"`);
        await queryRunner.query(`DROP TABLE "services_pack"`);
    }

}
