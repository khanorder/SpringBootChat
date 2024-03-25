CREATE TABLE `visitors` (
	`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`session` CHAR(24) NOT NULL COLLATE 'utf8mb4_bin',
	`device` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uniq_session` (`session`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
