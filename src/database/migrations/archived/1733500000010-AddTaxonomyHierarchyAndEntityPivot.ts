import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaxonomyHierarchyAndEntityPivot1733500000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar parentId y order a taxonomies
    await queryRunner.query(`ALTER TABLE "taxonomies" ADD COLUMN "parentId" uuid`);
    await queryRunner.query(`ALTER TABLE "taxonomies" ADD COLUMN "order" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`
      ALTER TABLE "taxonomies"
      ADD CONSTRAINT "FK_taxonomies_parentId"
      FOREIGN KEY ("parentId") REFERENCES "taxonomies"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`CREATE INDEX "IDX_taxonomies_parentId" ON "taxonomies" ("parentId")`);

    // Tabla pivot entity_taxonomies
    await queryRunner.query(`
      CREATE TABLE "entity_taxonomies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entityType" character varying NOT NULL,
        "entityId" uuid NOT NULL,
        "taxonomyId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_entity_taxonomies_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_entity_taxonomies" UNIQUE ("entityType", "entityId", "taxonomyId"),
        CONSTRAINT "FK_entity_taxonomies_taxonomyId"
          FOREIGN KEY ("taxonomyId") REFERENCES "taxonomies"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_entity_taxonomies_entity" ON "entity_taxonomies" ("entityType", "entityId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "entity_taxonomies"`);
    await queryRunner.query(`DROP INDEX "IDX_taxonomies_parentId"`);
    await queryRunner.query(`ALTER TABLE "taxonomies" DROP CONSTRAINT "FK_taxonomies_parentId"`);
    await queryRunner.query(`ALTER TABLE "taxonomies" DROP COLUMN "order"`);
    await queryRunner.query(`ALTER TABLE "taxonomies" DROP COLUMN "parentId"`);
  }
}
