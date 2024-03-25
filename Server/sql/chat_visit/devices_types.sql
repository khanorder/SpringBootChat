CREATE TABLE `device_types` (
	`id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
	`deviceType` VARCHAR(31) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_browser` (`deviceType`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
;
