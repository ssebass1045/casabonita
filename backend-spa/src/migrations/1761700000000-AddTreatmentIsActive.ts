import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTreatmentIsActive1761700000000 implements MigrationInterface {
  name = 'AddTreatmentIsActive1761700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "treatment" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN "isActive"`);
  }
}
