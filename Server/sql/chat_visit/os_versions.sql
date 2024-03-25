CREATE TABLE `os_versions` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`osVersion` VARCHAR(63) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_osVersion` (`osVersion`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
