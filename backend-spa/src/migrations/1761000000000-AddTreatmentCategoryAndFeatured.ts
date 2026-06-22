import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTreatmentCategoryAndFeatured1761000000000
  implements MigrationInterface
{
  name = 'AddTreatmentCategoryAndFeatured1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."treatment_category_enum" AS ENUM('facial', 'corporal', 'depilacion', 'cejas_pestanas', 'masajes_relajacion', 'cuidado_piel', 'belleza', 'otros')`,
    );
    await queryRunner.query(
      `ALTER TABLE "treatment" ADD "category" "public"."treatment_category_enum" NOT NULL DEFAULT 'otros'`,
    );
    await queryRunner.query(
      `ALTER TABLE "treatment" ADD "isFeatured" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN "isFeatured"`);
    await queryRunner.query(`ALTER TABLE "treatment" DROP COLUMN "category"`);
    await queryRunner.query(`DROP TYPE "public"."treatment_category_enum"`);
  }
}
