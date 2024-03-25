CREATE TABLE `hosts` (
	`id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
	`host` VARCHAR(63) NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;