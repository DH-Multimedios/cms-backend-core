import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateFilesEntity1733500000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        isNullable: false,
        default: "''",
      }),
    );

    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'fileOwnerUserId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'usage',
        type: 'varchar',
        isNullable: false,
        default: "'documents'",
      }),
    );

    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'isPublic',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'downloadCount',
        type: 'int',
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'files',
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    // Rename uploadedBy to uploadedByUserId
    await queryRunner.renameColumn('files', 'uploadedBy', 'uploadedByUserId');

    // Add FK for fileOwnerUserId
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        columnNames: ['fileOwnerUserId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK
    const table = await queryRunner.getTable('files');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('fileOwnerUserId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('files', foreignKey);
    }

    // Rename back
    await queryRunner.renameColumn('files', 'uploadedByUserId', 'uploadedBy');

    // Drop columns
    await queryRunner.dropColumn('files', 'updatedAt');
    await queryRunner.dropColumn('files', 'downloadCount');
    await queryRunner.dropColumn('files', 'isPublic');
    await queryRunner.dropColumn('files', 'usage');
    await queryRunner.dropColumn('files', 'fileOwnerUserId');
    await queryRunner.dropColumn('files', 'description');
    await queryRunner.dropColumn('files', 'name');
  }
}
