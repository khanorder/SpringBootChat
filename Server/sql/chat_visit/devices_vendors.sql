CREATE TABLE `device_vendors` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`deviceVendor` VARCHAR(127) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_browser` (`deviceVendor`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
;
