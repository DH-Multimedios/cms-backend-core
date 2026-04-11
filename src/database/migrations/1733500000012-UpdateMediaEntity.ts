import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateMediaEntity1733500000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename uploadedBy to uploadedByUserId
    await queryRunner.renameColumn('media', 'uploadedBy', 'uploadedByUserId');

    // Make alt NOT NULL with default
    await queryRunner.changeColumn(
      'media',
      'alt',
      new TableColumn({
        name: 'alt',
        type: 'varchar',
        isNullable: false,
        default: "''",
      }),
    );

    // Make width NOT NULL with default
    await queryRunner.changeColumn(
      'media',
      'width',
      new TableColumn({
        name: 'width',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    // Make height NOT NULL with default
    await queryRunner.changeColumn(
      'media',
      'height',
      new TableColumn({
        name: 'height',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    // Add url column
    await queryRunner.addColumn(
      'media',
      new TableColumn({
        name: 'url',
        type: 'varchar',
        isNullable: false,
        default: "''",
      }),
    );

    // Add usage column
    await queryRunner.addColumn(
      'media',
      new TableColumn({
        name: 'usage',
        type: 'varchar',
        isNullable: false,
        default: "'images'",
      }),
    );

    // Add updatedAt column
    await queryRunner.addColumn(
      'media',
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    // Rename FK constraint
    await queryRunner.renameColumn('media', 'uploadedByUserId', 'uploadedByUserId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns
    await queryRunner.dropColumn('media', 'updatedAt');
    await queryRunner.dropColumn('media', 'usage');
    await queryRunner.dropColumn('media', 'url');

    // Revert alt to nullable
    await queryRunner.changeColumn(
      'media',
      'alt',
      new TableColumn({
        name: 'alt',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Revert width to nullable
    await queryRunner.changeColumn(
      'media',
      'width',
      new TableColumn({
        name: 'width',
        type: 'int',
        isNullable: true,
      }),
    );

    // Revert height to nullable
    await queryRunner.changeColumn(
      'media',
      'height',
      new TableColumn({
        name: 'height',
        type: 'int',
        isNullable: true,
      }),
    );

    // Rename back
    await queryRunner.renameColumn('media', 'uploadedByUserId', 'uploadedBy');
  }
}
