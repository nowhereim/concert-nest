import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1720391460496 implements MigrationInterface {
    name = 'Migrations1720391460496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cash_entity\` ADD \`balance\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cash_entity\` ADD \`user\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cash_entity\` ADD UNIQUE INDEX \`IDX_95de4b8b69eb92eeedb8aa328e\` (\`user\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_95de4b8b69eb92eeedb8aa328e\` ON \`cash_entity\` (\`user\`)`);
        await queryRunner.query(`ALTER TABLE \`cash_entity\` ADD CONSTRAINT \`FK_95de4b8b69eb92eeedb8aa328eb\` FOREIGN KEY (\`user\`) REFERENCES \`user_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cash_entity\` DROP FOREIGN KEY \`FK_95de4b8b69eb92eeedb8aa328eb\``);
        await queryRunner.query(`DROP INDEX \`REL_95de4b8b69eb92eeedb8aa328e\` ON \`cash_entity\``);
        await queryRunner.query(`ALTER TABLE \`cash_entity\` DROP INDEX \`IDX_95de4b8b69eb92eeedb8aa328e\``);
        await queryRunner.query(`ALTER TABLE \`cash_entity\` DROP COLUMN \`user\``);
        await queryRunner.query(`ALTER TABLE \`cash_entity\` DROP COLUMN \`balance\``);
    }

}
