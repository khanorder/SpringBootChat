CREATE TABLE `parameters` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`parameter` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
