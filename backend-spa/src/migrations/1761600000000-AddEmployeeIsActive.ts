import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmployeeIsActive1761600000000 implements MigrationInterface {
  name = 'AddEmployeeIsActive1761600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "isActive"`);
  }
}
