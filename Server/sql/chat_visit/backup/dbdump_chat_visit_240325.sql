-- MariaDB dump 10.19-11.1.2-MariaDB, for Win64 (AMD64)
--
-- Host: 192.168.0.2    Database: chat_visit
-- ------------------------------------------------------
-- Server version	10.6.16-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `agent` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_agent` (`agent`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `browser_versions`
--

DROP TABLE IF EXISTS `browser_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `browser_versions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `browserVersion` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browserVersion` (`browserVersion`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `browser_versions`
--

LOCK TABLES `browser_versions` WRITE;
/*!40000 ALTER TABLE `browser_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `browser_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `browsers`
--

DROP TABLE IF EXISTS `browsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `browsers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `browser` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browser` (`browser`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `browsers`
--

LOCK TABLES `browsers` WRITE;
/*!40000 ALTER TABLE `browsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `browsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_models`
--

DROP TABLE IF EXISTS `device_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_models` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `deviceModel` varchar(127) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browser` (`deviceModel`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_models`
--

LOCK TABLES `device_models` WRITE;
/*!40000 ALTER TABLE `device_models` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_types`
--

DROP TABLE IF EXISTS `device_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_types` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `deviceType` varchar(31) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browser` (`deviceType`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_types`
--

LOCK TABLES `device_types` WRITE;
/*!40000 ALTER TABLE `device_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_vendors`
--

DROP TABLE IF EXISTS `device_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_vendors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `deviceVendor` varchar(127) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browser` (`deviceVendor`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_vendors`
--

LOCK TABLES `device_vendors` WRITE;
/*!40000 ALTER TABLE `device_vendors` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devices` (
  `id` bigint(20) unsigned NOT NULL,
  `deviceType` tinyint(3) unsigned NOT NULL,
  `deviceVendor` int(10) unsigned NOT NULL,
  `deviceModel` int(10) unsigned NOT NULL,
  `agent` int(11) unsigned NOT NULL,
  `browser` int(10) unsigned NOT NULL,
  `browserVersion` int(10) unsigned NOT NULL,
  `engine` int(10) unsigned NOT NULL,
  `engineVersion` int(10) unsigned NOT NULL,
  `os` tinyint(3) unsigned NOT NULL,
  `osVersion` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `engine_versions`
--

DROP TABLE IF EXISTS `engine_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `engine_versions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `engineVersion` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browserVersion` (`engineVersion`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `engine_versions`
--

LOCK TABLES `engine_versions` WRITE;
/*!40000 ALTER TABLE `engine_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `engine_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `engines`
--

DROP TABLE IF EXISTS `engines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `engines` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `engine` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_browser` (`engine`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `engines`
--

LOCK TABLES `engines` WRITE;
/*!40000 ALTER TABLE `engines` DISABLE KEYS */;
/*!40000 ALTER TABLE `engines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hosts`
--

DROP TABLE IF EXISTS `hosts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hosts` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `host` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hosts`
--

LOCK TABLES `hosts` WRITE;
/*!40000 ALTER TABLE `hosts` DISABLE KEYS */;
/*!40000 ALTER TABLE `hosts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ips`
--

DROP TABLE IF EXISTS `ips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ips` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(15) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ips`
--

LOCK TABLES `ips` WRITE;
/*!40000 ALTER TABLE `ips` DISABLE KEYS */;
/*!40000 ALTER TABLE `ips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `os_versions`
--

DROP TABLE IF EXISTS `os_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `os_versions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `osVersion` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_osVersion` (`osVersion`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `os_versions`
--

LOCK TABLES `os_versions` WRITE;
/*!40000 ALTER TABLE `os_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `os_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oss`
--

DROP TABLE IF EXISTS `oss`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oss` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `os` varchar(63) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_os` (`os`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oss`
--

LOCK TABLES `oss` WRITE;
/*!40000 ALTER TABLE `oss` DISABLE KEYS */;
/*!40000 ALTER TABLE `oss` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parameters`
--

DROP TABLE IF EXISTS `parameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parameters` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parameter` text NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parameters`
--

LOCK TABLES `parameters` WRITE;
/*!40000 ALTER TABLE `parameters` DISABLE KEYS */;
/*!40000 ALTER TABLE `parameters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paths`
--

DROP TABLE IF EXISTS `paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paths` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paths`
--

LOCK TABLES `paths` WRITE;
/*!40000 ALTER TABLE `paths` DISABLE KEYS */;
/*!40000 ALTER TABLE `paths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `titles`
--

DROP TABLE IF EXISTS `titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `titles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `titles`
--

LOCK TABLES `titles` WRITE;
/*!40000 ALTER TABLE `titles` DISABLE KEYS */;
/*!40000 ALTER TABLE `titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitors`
--

DROP TABLE IF EXISTS `visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visitors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `session` char(24) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `device` bigint(20) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_session` (`session`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visits` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `visitor` bigint(20) unsigned NOT NULL,
  `host` tinyint(3) unsigned NOT NULL,
  `ip` int(10) unsigned NOT NULL,
  `parameter` int(10) unsigned NOT NULL,
  `path` int(10) unsigned NOT NULL,
  `scheme` tinyint(1) unsigned NOT NULL,
  `title` int(10) unsigned NOT NULL,
  `localTime` datetime(6) NOT NULL,
  `serverTime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `visits_infos`
--

DROP TABLE IF EXISTS `visits_infos`;
/*!50001 DROP VIEW IF EXISTS `visits_infos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `visits_infos` AS SELECT
 1 AS `id`,
  1 AS `session`,
  1 AS `host`,
  1 AS `ip`,
  1 AS `path`,
  1 AS `parameter`,
  1 AS `localTime`,
  1 AS `serverTime` */;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'chat_visit'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `x_saveVisit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
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
END `MAIN` ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `visits_infos`
--

/*!50001 DROP VIEW IF EXISTS `visits_infos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `visits_infos` AS select `a`.`id` AS `id`,`b`.`session` AS `session`,`c`.`host` AS `host`,`d`.`ip` AS `ip`,`e`.`path` AS `path`,`f`.`parameter` AS `parameter`,`a`.`localTime` AS `localTime`,`a`.`serverTime` AS `serverTime` from (((((`visits` `a` left join `visitors` `b` on(`a`.`visitor` = `b`.`id`)) left join `hosts` `c` on(`a`.`host` = `c`.`id`)) left join `ips` `d` on(`a`.`ip` = `d`.`id`)) left join `paths` `e` on(`a`.`path` = `e`.`id`)) left join `parameters` `f` on(`a`.`parameter` = `f`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-25 21:53:30
