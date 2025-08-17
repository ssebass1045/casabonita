import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDailyIncomeHistoryTable1755458081319 implements MigrationInterface {
    name = 'CreateDailyIncomeHistoryTable1755458081319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daily_income_history" ("id" SERIAL NOT NULL, "date" date NOT NULL, "totalIncome" numeric(10,2) NOT NULL, "appointmentIncome" numeric(10,2) NOT NULL, "productSalesIncome" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2869d26f40d9792aab1c711bfb8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "daily_income_history"`);
    }

}
