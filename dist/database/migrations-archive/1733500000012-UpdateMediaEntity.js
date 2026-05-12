"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMediaEntity1733500000012 = void 0;
const typeorm_1 = require("typeorm");
class UpdateMediaEntity1733500000012 {
    async up(queryRunner) {
        await queryRunner.renameColumn('media', 'uploadedBy', 'uploadedByUserId');
        await queryRunner.changeColumn('media', 'alt', new typeorm_1.TableColumn({
            name: 'alt',
            type: 'varchar',
            isNullable: false,
            default: "''",
        }));
        await queryRunner.changeColumn('media', 'width', new typeorm_1.TableColumn({
            name: 'width',
            type: 'int',
            isNullable: false,
            default: 0,
        }));
        await queryRunner.changeColumn('media', 'height', new typeorm_1.TableColumn({
            name: 'height',
            type: 'int',
            isNullable: false,
            default: 0,
        }));
        await queryRunner.addColumn('media', new typeorm_1.TableColumn({
            name: 'url',
            type: 'varchar',
            isNullable: false,
            default: "''",
        }));
        await queryRunner.addColumn('media', new typeorm_1.TableColumn({
            name: 'usage',
            type: 'varchar',
            isNullable: false,
            default: "'images'",
        }));
        await queryRunner.addColumn('media', new typeorm_1.TableColumn({
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
        }));
        await queryRunner.renameColumn('media', 'uploadedByUserId', 'uploadedByUserId');
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('media', 'updatedAt');
        await queryRunner.dropColumn('media', 'usage');
        await queryRunner.dropColumn('media', 'url');
        await queryRunner.changeColumn('media', 'alt', new typeorm_1.TableColumn({
            name: 'alt',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.changeColumn('media', 'width', new typeorm_1.TableColumn({
            name: 'width',
            type: 'int',
            isNullable: true,
        }));
        await queryRunner.changeColumn('media', 'height', new typeorm_1.TableColumn({
            name: 'height',
            type: 'int',
            isNullable: true,
        }));
        await queryRunner.renameColumn('media', 'uploadedByUserId', 'uploadedBy');
    }
}
exports.UpdateMediaEntity1733500000012 = UpdateMediaEntity1733500000012;
//# sourceMappingURL=1733500000012-UpdateMediaEntity.js.map