CREATE TABLE `device_models` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`deviceModel` VARCHAR(127) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_browser` (`deviceModel`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
;
