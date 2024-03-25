CREATE TABLE `agents` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`agent` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_agent` (`agent`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
