-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: powerlink
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(50) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `service` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `submittedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('c8a72826dc51e824','Contact Test','contacttest@example.com','8765551212','Emergency Plumbing','Need urgent leak assistance.','2026-03-31 03:35:13');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `reference` varchar(50) NOT NULL,
  `customer` varchar(100) NOT NULL,
  `item` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `fulfillment` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `submittedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('PL-022957-464','Test Customer','Andre Walker plumbing service','Plumber Booking',115.00,'Scheduled service','Scheduled','2026-04-01 20:57:03'),('PL-732146-825','Kate Buchanan','Copper Tube Set','Supply Order',123.00,'Delivery','Confirmed','2026-04-01 21:08:52'),('TEST-1775084303389','Test Order User','Test Plumbing Service','Plumber Booking',150.00,'Scheduled service','Scheduled','2026-04-01 17:58:23');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `experience` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `submittedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,'tim john','plumping','st catherine',5,'Approved','2026-04-01 17:23:57'),(2,'kin who','plumping','kingston',19,'Pending Verification','2026-04-01 18:16:48'),(3,'Test Plumber','Emergency Leaks','Kingston',10,'Pending Verification','2026-04-01 20:49:33');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `cart` json DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('19ba4fc257da0729','Test Customer','testcustomer@example.com','1234567890','$2b$10$k0SxZgBFF83MPhaXzD..Ae0EaOOKFRVe2BDaVlIYX9bFwF/uWvy5i','[]','2026-04-01 20:51:58'),('29204f0b9751ac10','Cart Test','carttest1774924992@example.com','5551234567','$2b$10$opMtJVV9i0a6ZAEgFxi4dek/yFg8KdXyBy87QVTaHzJdY1LcFT89.','[{\"name\": \"PVC Pipe Bundle\", \"unit\": \"bundle\", \"price\": 68, \"category\": \"Pipes\", \"quantity\": 2}]','2026-03-31 02:43:12'),('6e4fc2ad23c62ea9','rojwayne codner','rojwayne1@gmail.com','8768564025','$2b$10$xpORgKY/CGssP.2ewEoK6Ox2WQpQC9/ulRI4HOTUt6Zg/LSrNjcbe','[]','2026-03-31 03:00:05'),('a35055316f2859f0','leon amavi','testuser_flow@example.com','123456789','$2b$10$N.UrEMRluF.5ndX9yukqu.8.zRXS8LtsrEjarY.fSW.8PkQJiyFZ6','[]','2026-04-01 21:26:08'),('bd68e1e71abb376f','Kate Buchanan','kake.101buchanan@gmail.com','8768563843','$2b$10$BNxVngOCTt4WzHus02uqp.dywOikpqGBvBsFdyfqYkniQz0A9IXqe','[]','2026-04-01 18:27:04'),('e0b4519a8580b7ea','Test Order User','test_1775084303275@test.com','555-0199','$2b$10$PwnjZKWtHb2PFTNFZYCEIOQXDXc4SdNXG2i5w38SOuLK2DRz0JBAG','[]','2026-04-01 17:58:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-01 21:17:19
