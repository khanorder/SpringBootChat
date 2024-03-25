CREATE TABLE `engine_versions` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`engineVersion` VARCHAR(63) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_browserVersion` (`engineVersion`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
;
