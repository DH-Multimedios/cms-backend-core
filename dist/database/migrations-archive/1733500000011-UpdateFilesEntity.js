"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFilesEntity1733500000011 = void 0;
const typeorm_1 = require("typeorm");
class UpdateFilesEntity1733500000011 {
    async up(queryRunner) {
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'name',
            type: 'varchar',
            isNullable: false,
            default: "''",
        }));
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'description',
            type: 'text',
            isNullable: true,
        }));
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'fileOwnerUserId',
            type: 'uuid',
            isNullable: true,
        }));
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'usage',
            type: 'varchar',
            isNullable: false,
            default: "'documents'",
        }));
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'isPublic',
            type: 'boolean',
            default: false,
        }));
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'downloadCount',
            type: 'int',
            default: 0,
        }));
        await queryRunner.addColumn('files', new typeorm_1.TableColumn({
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
        }));
        await queryRunner.renameColumn('files', 'uploadedBy', 'uploadedByUserId');
        await queryRunner.createForeignKey('files', new typeorm_1.TableForeignKey({
            columnNames: ['fileOwnerUserId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        }));
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('files');
        const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('fileOwnerUserId') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('files', foreignKey);
        }
        await queryRunner.renameColumn('files', 'uploadedByUserId', 'uploadedBy');
        await queryRunner.dropColumn('files', 'updatedAt');
        await queryRunner.dropColumn('files', 'downloadCount');
        await queryRunner.dropColumn('files', 'isPublic');
        await queryRunner.dropColumn('files', 'usage');
        await queryRunner.dropColumn('files', 'fileOwnerUserId');
        await queryRunner.dropColumn('files', 'description');
        await queryRunner.dropColumn('files', 'name');
    }
}
exports.UpdateFilesEntity1733500000011 = UpdateFilesEntity1733500000011;
//# sourceMappingURL=1733500000011-UpdateFilesEntity.js.map