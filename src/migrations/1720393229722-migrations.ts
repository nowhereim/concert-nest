import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1720393229722 implements MigrationInterface {
    name = 'Migrations1720393229722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_95de4b8b69eb92eeedb8aa328e\` ON \`cash_entity\``);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` ADD \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` ADD \`type\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` DROP COLUMN \`deletedAt\``);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`cash_history_entity\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_95de4b8b69eb92eeedb8aa328e\` ON \`cash_entity\` (\`user\`)`);
    }

}
