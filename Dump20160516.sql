CREATE DATABASE  IF NOT EXISTS `google_data` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `google_data`;
-- MySQL dump 10.13  Distrib 5.7.9, for osx10.9 (x86_64)
--
-- Host: localhost    Database: google_data
-- ------------------------------------------------------
-- Server version	5.7.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Calendar`
--

DROP TABLE IF EXISTS `Calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Calendar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `color` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Calendar_User1_idx` (`owner_id`),
  CONSTRAINT `fk_Calendar_User1` FOREIGN KEY (`owner_id`) REFERENCES `User` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Calendar`
--

LOCK TABLES `Calendar` WRITE;
/*!40000 ALTER TABLE `Calendar` DISABLE KEYS */;
/*!40000 ALTER TABLE `Calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Configuration`
--

DROP TABLE IF EXISTS `Configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Configuration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `redirect_url` varchar(256) NOT NULL,
  `api_key` varchar(256) DEFAULT NULL,
  `client_id` varchar(256) NOT NULL,
  `client_secret` varchar(256) NOT NULL,
  `external_service_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Configuration_External_Service1_idx` (`external_service_id`),
  CONSTRAINT `fk_Configuration_External_Service1` FOREIGN KEY (`external_service_id`) REFERENCES `External_Service` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Configuration`
--

LOCK TABLES `Configuration` WRITE;
/*!40000 ALTER TABLE `Configuration` DISABLE KEYS */;
INSERT INTO `Configuration` VALUES (1,'http://localhost:8866/google/authorization','AIzaSyAUxyb3trMKXkq6hG71cRo2TRFHkYP2TK4','702560347090-3m5n4glqrvjg96rvl4kqlcoikvq1g52f.apps.googleusercontent.com','7UTol3UEL2Fdidub1JzHcA2W',1);
/*!40000 ALTER TABLE `Configuration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event`
--

DROP TABLE IF EXISTS `Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `color` varchar(45) NOT NULL,
  `title` varchar(256) NOT NULL,
  `description` varchar(2048) DEFAULT NULL,
  `rrule` varchar(256) DEFAULT NULL,
  `calendar_id` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Event_Calendar1_idx` (`calendar_id`),
  CONSTRAINT `fk_Event_Calendar1` FOREIGN KEY (`calendar_id`) REFERENCES `Calendar` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event`
--

LOCK TABLES `Event` WRITE;
/*!40000 ALTER TABLE `Event` DISABLE KEYS */;
/*!40000 ALTER TABLE `Event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `External_Account`
--

DROP TABLE IF EXISTS `External_Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `External_Account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `access_token` varchar(256) NOT NULL,
  `refresh_token` varchar(256) NOT NULL,
  `user_id` int(11) NOT NULL,
  `external_service_id` int(11) NOT NULL,
  `ext_user_id` varchar(1000) NOT NULL,
  `is_current` tinyint(1) unsigned zerofill NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_external_username_unique` (`ext_user_id`,`user_id`,`external_service_id`),
  KEY `fk_Google_Account_User_idx` (`user_id`),
  KEY `fk_External_Account_External_Service1_idx` (`external_service_id`),
  CONSTRAINT `fk_External_Account_External_Service1` FOREIGN KEY (`external_service_id`) REFERENCES `External_Service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Google_Account_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `External_Account`
--

LOCK TABLES `External_Account` WRITE;
/*!40000 ALTER TABLE `External_Account` DISABLE KEYS */;
INSERT INTO `External_Account` VALUES (14,'ya29.CjPkArbuoReRUU0bC2gxX-39Iy3OHhVyX28JuYC26DntvnFwcqXNG92FWzx2kdUSj8QX7tc','1/HO5HBAqxbVQiP_o4ieKvKQX0J11c_LEfMrrHldZfpcY',3,1,'113100039880681506704',1),(15,'ya29.CjPkAvw9qg2OHFefIvDwKRCaVmhCW-ZFtWyuVK6Q9sJzJ6pnTs3ClDO-SCIp316e6gDIhVc','1/JIUPSUNc8YQ8Mc-UP8bGDg_bb6bT0brbTrqrrnWl-WI',3,1,'109667856257701172849',0),(16,'ya29.CjPkArsnHRuuVrXpRuAEM6ZIGLqoQitaKgSJOO1TngnSwpl6-HzxzI07CGcELQDV6SuaLHA','1/RZqgqKNWmspsNVzHq7mbktkxxrknUWtLOz_W6YM2Yzl90RDknAdJa_sgfheVM0XT',3,1,'109709962794361904348',0);
/*!40000 ALTER TABLE `External_Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `External_Service`
--

DROP TABLE IF EXISTS `External_Service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `External_Service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `External_Service`
--

LOCK TABLES `External_Service` WRITE;
/*!40000 ALTER TABLE `External_Service` DISABLE KEYS */;
INSERT INTO `External_Service` VALUES (1,'Google');
/*!40000 ALTER TABLE `External_Service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Task`
--

DROP TABLE IF EXISTS `Task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_list_id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Task_Task_List1_idx` (`task_list_id`),
  CONSTRAINT `fk_Task_Task_List1` FOREIGN KEY (`task_list_id`) REFERENCES `Task_List` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Task`
--

LOCK TABLES `Task` WRITE;
/*!40000 ALTER TABLE `Task` DISABLE KEYS */;
/*!40000 ALTER TABLE `Task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Task_List`
--

DROP TABLE IF EXISTS `Task_List`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Task_List` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Task_List_User1_idx` (`user_id`),
  CONSTRAINT `fk_Task_List_User1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Task_List`
--

LOCK TABLES `Task_List` WRITE;
/*!40000 ALTER TABLE `Task_List` DISABLE KEYS */;
/*!40000 ALTER TABLE `Task_List` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Task_Status`
--

DROP TABLE IF EXISTS `Task_Status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Task_Status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  KEY `fk_task_status_Task1_idx` (`task_id`),
  CONSTRAINT `fk_task_status_Task1` FOREIGN KEY (`task_id`) REFERENCES `Task` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Task_Status`
--

LOCK TABLES `Task_Status` WRITE;
/*!40000 ALTER TABLE `Task_Status` DISABLE KEYS */;
/*!40000 ALTER TABLE `Task_Status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(64) NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `avatar_url` varchar(1000) DEFAULT NULL,
  `email` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (3,'alexey.kastyuk','e7ac7175fdd85ccc3435b6e38647a0f3','Alexey','Kastyuk','1995-01-05','/avatars/mAtbT_l_cGQrTbF3ZX4pbujF.jpg','alexeykastyuk@gmail.com');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User_has_Calendar`
--

DROP TABLE IF EXISTS `User_has_Calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User_has_Calendar` (
  `user_id` int(11) NOT NULL,
  `calendar_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`calendar_id`),
  KEY `fk_User_has_Calendar_Calendar1_idx` (`calendar_id`),
  KEY `fk_User_has_Calendar_User1_idx` (`user_id`),
  CONSTRAINT `fk_User_has_Calendar_Calendar1` FOREIGN KEY (`calendar_id`) REFERENCES `Calendar` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_User_has_Calendar_User1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User_has_Calendar`
--

LOCK TABLES `User_has_Calendar` WRITE;
/*!40000 ALTER TABLE `User_has_Calendar` DISABLE KEYS */;
/*!40000 ALTER TABLE `User_has_Calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `get_user_external_accounts_info`
--

DROP TABLE IF EXISTS `get_user_external_accounts_info`;
/*!50001 DROP VIEW IF EXISTS `get_user_external_accounts_info`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `get_user_external_accounts_info` AS SELECT 
 1 AS `username`,
 1 AS `password`,
 1 AS `id`,
 1 AS `access_token`,
 1 AS `refresh_token`,
 1 AS `is_current`,
 1 AS `name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `get_user_internal_info`
--

DROP TABLE IF EXISTS `get_user_internal_info`;
/*!50001 DROP VIEW IF EXISTS `get_user_internal_info`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `get_user_internal_info` AS SELECT 
 1 AS `password`,
 1 AS `username`,
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `birth_date`,
 1 AS `avatar_url`,
 1 AS `email`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `googlecredentials`
--

DROP TABLE IF EXISTS `googlecredentials`;
/*!50001 DROP VIEW IF EXISTS `googlecredentials`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `googlecredentials` AS SELECT 
 1 AS `client_id`,
 1 AS `client_secret`,
 1 AS `redirect_url`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('Lmtgmkv_zy9nnOi8Xeu9-NbxVCboQklo',1463512821,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"username\":\"alexey.kastyuk\",\"password\":\"1995Alexey22\"}}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'google_data'
--

--
-- Dumping routines for database 'google_data'
--
/*!50003 DROP PROCEDURE IF EXISTS `add_new_external_account` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_new_external_account`(	IN Username VARCHAR(64), IN Password VARCHAR(64), IN Access_Token VARCHAR(1000), 
																		IN Refresh_Token VARCHAR(1000), IN Ext_User_Id VARCHAR(1000), IN Service_Name VARCHAR(100))
BEGIN
    INSERT INTO External_Account (`access_token`, `refresh_token`, `user_id`, `ext_user_id`, `external_service_id`) 
    VALUES 
    (Access_Token, Refresh_Token, 
			(SELECT id FROM User AS u WHERE u.username = Username AND u.password = Password LIMIT 1),
            Ext_User_Id,
            (SELECT id FROM External_Service WHERE name = Service_Name LIMIT 1));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_accounts` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_accounts`(IN Username VARCHAR(64), IN Password VARCHAR(64))
BEGIN

	SELECT username, first_name, last_name, birth_date, avatar_url, email FROM User WHERE username = Username;

	SELECT 	ext_acc.id AS id, ext_acc.access_token, ext_acc.refresh_token, 
			ext_acc.is_current, ext_serv.name AS name
	FROM User AS u
	LEFT JOIN External_Account AS ext_acc ON u.id = ext_acc.user_id
	INNER JOIN External_Service AS ext_serv ON ext_acc.external_service_id = ext_serv.id
    WHERE u.username = Username AND u.password = Password;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `get_user_external_accounts_info`
--

/*!50001 DROP VIEW IF EXISTS `get_user_external_accounts_info`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `get_user_external_accounts_info` AS select `u`.`username` AS `username`,`u`.`password` AS `password`,`ext_acc`.`id` AS `id`,`ext_acc`.`access_token` AS `access_token`,`ext_acc`.`refresh_token` AS `refresh_token`,`ext_acc`.`is_current` AS `is_current`,`ext_serv`.`name` AS `name` from ((`user` `u` left join `external_account` `ext_acc` on((`u`.`id` = `ext_acc`.`user_id`))) join `external_service` `ext_serv` on((`ext_acc`.`external_service_id` = `ext_serv`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `get_user_internal_info`
--

/*!50001 DROP VIEW IF EXISTS `get_user_internal_info`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `get_user_internal_info` AS select `user`.`password` AS `password`,`user`.`username` AS `username`,`user`.`first_name` AS `first_name`,`user`.`last_name` AS `last_name`,`user`.`birth_date` AS `birth_date`,`user`.`avatar_url` AS `avatar_url`,`user`.`email` AS `email` from `user` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `googlecredentials`
--

/*!50001 DROP VIEW IF EXISTS `googlecredentials`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `googlecredentials` AS select `config`.`client_id` AS `client_id`,`config`.`client_secret` AS `client_secret`,`config`.`redirect_url` AS `redirect_url` from (`external_service` `ex` join `configuration` `config` on((`config`.`external_service_id` = `ex`.`id`))) where (`ex`.`name` = 'Google') */;
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

-- Dump completed on 2016-05-16 22:30:46
