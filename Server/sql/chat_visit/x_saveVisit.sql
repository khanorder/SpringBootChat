DROP PROCEDURE IF EXISTS `x_saveVisit`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `x_saveVisit`(`__session` CHAR(36), `__fp` BIGINT(20) UNSIGNED, `__deviceType` VARCHAR(31), `__deviceVendor` VARCHAR(127), `__deviceModel` VARCHAR(127), `__agent` VARCHAR(255), `__browser` VARCHAR(63), `__browserVersion` VARCHAR(63), `__engine` VARCHAR(63), `__engineVersion` VARCHAR(63), `__os` VARCHAR(63), `__osVersion` VARCHAR(63), `__host` VARCHAR(63), `__ip` VARCHAR(15), `__parameter` TEXT, `__path` VARCHAR(255), `__scheme` TINYINT(1), `__title` VARCHAR(255), `__localTime` DATETIME(6))
SQL SECURITY INVOKER

`MAIN`: BEGIN
	DECLARE `ERR_MSG` VARCHAR(16383) DEFAULT NULL;

	`PROC`: BEGIN
		DECLARE `VISITOR_ID` BIGINT(20) UNSIGNED DEFAULT NULL;
		DECLARE `DEVICE_ID` BIGINT(20) UNSIGNED DEFAULT NULL;
		DECLARE `DEVICE_TYPE_ID` TINYINT(3) UNSIGNED DEFAULT NULL;
		DECLARE `DEVICE_VENDOR_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `DEVICE_MODEL_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `AGENT_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `BROWSER_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `BROWSER_VER_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `ENGINE_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `ENGINE_VER_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `OS_ID` TINYINT(3) UNSIGNED DEFAULT NULL;
		DECLARE `OS_VER_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `HOST_ID` TINYINT(3) UNSIGNED DEFAULT NULL;
		DECLARE `IP_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `PARAM_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `PATH_ID` INT(10) UNSIGNED DEFAULT NULL;
		DECLARE `TITLE_ID` INT(10) UNSIGNED DEFAULT NULL;

		DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN
			ROLLBACK;
			GET DIAGNOSTICS CONDITION 1 @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
			SET `ERR_MSG` = CONCAT(@p1, ':', @p2);
		END;
		
		SELECT `id`, `device` INTO `VISITOR_ID`, `DEVICE_ID` FROM `visitors` WHERE `session` = `__session`;

		IF `VISITOR_ID` IS NULL OR 1 > `VISITOR_ID` THEN
			SET `DEVICE_TYPE_ID` = (SELECT `id` FROM `device_types` WHERE `deviceType` = `__deviceType`);
			IF `DEVICE_TYPE_ID` IS NULL OR 1 > `DEVICE_TYPE_ID` THEN
				INSERT INTO `device_types` (`deviceType`) 
				VALUES (`__deviceType`) ON DUPLICATE KEY UPDATE `deviceType` = `__deviceType`;
				SET `DEVICE_TYPE_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `DEVICE_VENDOR_ID` = (SELECT `id` FROM `device_vendors` WHERE `deviceVendor` = `__deviceVendor`);
			IF `DEVICE_VENDOR_ID` IS NULL OR 1 > `DEVICE_VENDOR_ID` THEN
				INSERT INTO `device_vendors` (`deviceVendor`) 
				VALUES (`__deviceVendor`) ON DUPLICATE KEY UPDATE `deviceVendor` = `__deviceVendor`;
				SET `DEVICE_VENDOR_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `DEVICE_MODEL_ID` = (SELECT `id` FROM `device_models` WHERE `deviceModel` = `__deviceModel`);
			IF `DEVICE_MODEL_ID` IS NULL OR 1 > `DEVICE_MODEL_ID` THEN
				INSERT INTO `device_models` (`deviceModel`) 
				VALUES (`__deviceModel`) ON DUPLICATE KEY UPDATE `deviceModel` = `__deviceModel`;
				SET `DEVICE_MODEL_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `AGENT_ID` = (SELECT `id` FROM `agents` WHERE `agent` = `__agent`);
			IF `AGENT_ID` IS NULL OR 1 > `AGENT_ID` THEN
				INSERT INTO `agents` (`agent`) 
				VALUES (`__agent`) ON DUPLICATE KEY UPDATE `agent` = `__agent`;
				SET `AGENT_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `BROWSER_ID` = (SELECT `id` FROM `browsers` WHERE `browser` = `__browser`);
			IF `BROWSER_ID` IS NULL OR 1 > `BROWSER_ID` THEN
				INSERT INTO `browsers` (`browser`) 
				VALUES (`__browser`) ON DUPLICATE KEY UPDATE `browser` = `__browser`;
				SET `BROWSER_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `BROWSER_VER_ID` = (SELECT `id` FROM `browser_versions` WHERE `browserVersion` = `__browserVersion`);
			IF `BROWSER_VER_ID` IS NULL OR 1 > `BROWSER_VER_ID` THEN
				INSERT INTO `browser_versions` (`browserVersion`) 
				VALUES (`__browserVersion`) ON DUPLICATE KEY UPDATE `browserVersion` = `__browserVersion`;
				SET `BROWSER_VER_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `ENGINE_ID` = (SELECT `id` FROM `engines` WHERE `engine` = `__engine`);
			IF `ENGINE_ID` IS NULL OR 1 > `ENGINE_ID` THEN
				INSERT INTO `engines` (`engine`) 
				VALUES (`__engine`) ON DUPLICATE KEY UPDATE `engine` = `__engine`;
				SET `ENGINE_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `ENGINE_VER_ID` = (SELECT `id` FROM `engine_versions` WHERE `engineVersion` = `__engineVersion`);
			IF `ENGINE_VER_ID` IS NULL OR 1 > `ENGINE_VER_ID` THEN
				INSERT INTO `engine_versions` (`engineVersion`) 
				VALUES (`__engineVersion`) ON DUPLICATE KEY UPDATE `engineVersion` = `__engineVersion`;
				SET `ENGINE_VER_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `OS_ID` = (SELECT `id` FROM `oss` WHERE `os` = `__os`);
			IF `OS_ID` IS NULL OR 1 > `OS_ID` THEN
				INSERT INTO `oss` (`os`) 
				VALUES (`__os`) ON DUPLICATE KEY UPDATE `os` = `__os`;
				SET `OS_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			SET `OS_VER_ID` = (SELECT `id` FROM `os_versions` WHERE `osVersion` = `__osVersion`);
			IF `OS_VER_ID` IS NULL OR 1 > `OS_VER_ID` THEN
				INSERT INTO `os_versions` (`osVersion`) 
				VALUES (`__osVersion`) ON DUPLICATE KEY UPDATE `osVersion` = `__osVersion`;
				SET `OS_VER_ID` = (SELECT LAST_INSERT_ID());
			END IF;

			INSERT INTO `devices` (`id`, `deviceType`, `deviceVendor`, `deviceModel`, `agent`, `browser`, `browserVersion`, `engine`, `engineVersion`, `os`, `osVersion`) 
			VALUES (`__fp`, `DEVICE_TYPE_ID`, `DEVICE_VENDOR_ID`, `DEVICE_MODEL_ID`, `AGENT_ID`, `BROWSER_ID`, `BROWSER_VER_ID`, `ENGINE_ID`, `ENGINE_VER_ID`, `OS_ID`, `OS_VER_ID`) 
			ON DUPLICATE KEY UPDATE `deviceType` = `DEVICE_TYPE_ID`, `deviceVendor` = `DEVICE_VENDOR_ID`, `deviceModel` = `DEVICE_MODEL_ID`, `agent` = `AGENT_ID`, `browser` = `BROWSER_ID`, `browserVersion` = `BROWSER_VER_ID`, `engine` = `ENGINE_ID`, `engineVersion` = `ENGINE_VER_ID`, `os` = `OS_ID`, `osVersion` = `OS_VER_ID`;
			SET `DEVICE_ID` = `__fp`;

			INSERT INTO `visitors` (`session`, `device`) 
			VALUES (`__session`, `DEVICE_ID`) ON DUPLICATE KEY UPDATE `session` = `__session`, `device` = `DEVICE_ID`;
			SET `VISITOR_ID` = (SELECT LAST_INSERT_ID());
		END IF;

		SET `HOST_ID` = (SELECT `id` FROM `hosts` WHERE `host` = `__host`);
		IF `HOST_ID` IS NULL OR 1 > `HOST_ID` THEN
			INSERT INTO `hosts` (`host`) 
			VALUES (`__host`) ON DUPLICATE KEY UPDATE `host` = `__host`;
			SET `HOST_ID` = (SELECT LAST_INSERT_ID());
		END IF;

		SET `IP_ID` = (SELECT `id` FROM `ips` WHERE `ip` = `__ip`);
		IF `IP_ID` IS NULL OR 1 > `IP_ID` THEN
			INSERT INTO `ips` (`ip`) 
			VALUES (`__ip`) ON DUPLICATE KEY UPDATE `ip` = `__ip`;
			SET `IP_ID` = (SELECT LAST_INSERT_ID());
		END IF;

		SET `PARAM_ID` = (SELECT `id` FROM `parameters` WHERE `parameter` = `__parameter`);
		IF `PARAM_ID` IS NULL OR 1 > `IP_ID` THEN
			INSERT INTO `parameters` (`parameter`) 
			VALUES (`__parameter`) ON DUPLICATE KEY UPDATE `parameter` = `__parameter`;
			SET `PARAM_ID` = (SELECT LAST_INSERT_ID());
		END IF;

		SET `PATH_ID` = (SELECT `id` FROM `paths` WHERE `path` = `__path`);
		IF `PATH_ID` IS NULL OR 1 > `IP_ID` THEN
			INSERT INTO `paths` (`path`) 
			VALUES (`__path`) ON DUPLICATE KEY UPDATE `path` = `__path`;
			SET `PATH_ID` = (SELECT LAST_INSERT_ID());
		END IF;

		SET `TITLE_ID` = (SELECT `id` FROM `titles` WHERE `title` = `__title`);
		IF `TITLE_ID` IS NULL OR 1 > `IP_ID` THEN
			INSERT INTO `titles` (`title`) 
			VALUES (`__title`) ON DUPLICATE KEY UPDATE `title` = `__title`;
			SET `TITLE_ID` = (SELECT LAST_INSERT_ID());
		END IF;

		INSERT INTO `visits` (`visitor`, `host`, `ip`, `parameter`, `path`, `scheme`, `title`, `localTime`) 
		VALUES (`VISITOR_ID`, `HOST_ID`, `IP_ID`, `PARAM_ID`, `PATH_ID`, `__scheme`, `TITLE_ID`, `__localTime`);

		SELECT ROW_COUNT();
	END `PROC`;

	IF `ERR_MSG` IS NOT NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = `ERR_MSG`;
	END IF;
END `MAIN`;;
DELIMITER ;