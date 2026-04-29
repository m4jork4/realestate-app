-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 29. 17:45
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `realestate`
--
CREATE DATABASE IF NOT EXISTS `realestate` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `realestate`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `admin_messages`
--

DROP TABLE IF EXISTS `admin_messages`;
CREATE TABLE `admin_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `admin_messages`
--

INSERT INTO `admin_messages` (`id`, `user_id`, `name`, `email`, `subject`, `message`, `created_at`) VALUES
(1, NULL, 'kis zsolt', 'm4jork4.0@gmail.com', 'hiba', 'teszt', '2026-03-03 14:06:44'),
(2, 3, 'Kiss Zsolt', 'tesztzsolt@example.com', 'hibás', 'teszt2', '2026-03-03 14:10:20'),
(3, 4, 'Admin', 'drotosm88@gmail.com', 'fdhdfgh', 'hgdfhgfd', '2026-03-03 15:28:03'),
(4, 4, 'Admin', 'drotosm88@gmail.com', 'hiba', 'teszt', '2026-03-03 16:44:07'),
(5, NULL, 'Admin', 'drotosm88@gmail.com', 'hiba', 'teszt', '2026-03-07 10:59:55'),
(6, NULL, 'Admin', 'drotosm88@gmail.com', 'hiba', 'teszt', '2026-03-07 11:06:53');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `favorites`
--

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `inquiries`
--

DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `inquiries`
--

INSERT INTO `inquiries` (`id`, `listing_id`, `user_id`, `name`, `email`, `phone`, `message`, `created_at`) VALUES
(6, 15, 4, 'Admin', 'drotosm88@gmail.com', '7476547657456', 'teszt', '2026-03-03 20:09:01'),
(7, 15, 4, 'Admin', 'drotosm88@gmail.com', NULL, 'érdekel', '2026-03-07 12:40:23');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `listings`
--

DROP TABLE IF EXISTS `listings`;
CREATE TABLE `listings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `deal_type` varchar(20) NOT NULL,
  `property_type` varchar(30) NOT NULL,
  `price` bigint(20) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'HUF',
  `city` varchar(120) NOT NULL,
  `district` varchar(120) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `area_m2` int(11) NOT NULL,
  `rooms` decimal(4,1) NOT NULL DEFAULT 1.0,
  `bathrooms` decimal(4,1) DEFAULT NULL,
  `floor` int(11) DEFAULT NULL,
  `total_floors` int(11) DEFAULT NULL,
  `year_built` int(11) DEFAULT NULL,
  `heating_type` varchar(40) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `listings`
--

INSERT INTO `listings` (`id`, `owner_user_id`, `title`, `description`, `status`, `deal_type`, `property_type`, `price`, `currency`, `city`, `district`, `address_line`, `lat`, `lng`, `area_m2`, `rooms`, `bathrooms`, `floor`, `total_floors`, `year_built`, `heating_type`, `created_at`, `updated_at`) VALUES
(1, 1, 'Modern lakás a belvárosban', 'Gyönyörű új lakás, közel mindenhez', 'ACTIVE', 'SALE', 'APARTMENT', 45000000, 'HUF', 'Budapest', 'V', NULL, NULL, NULL, 55, 2.0, NULL, NULL, NULL, NULL, NULL, '2026-02-26 08:14:52', '2026-02-26 08:14:52'),
(2, 1, 'Családi ház kerttel', 'Nagy kert, csendes környék', 'ACTIVE', 'SALE', 'HOUSE', 89000000, 'HUF', 'Budapest', 'XVI', NULL, NULL, NULL, 120, 4.0, NULL, NULL, NULL, NULL, NULL, '2026-02-26 08:14:52', '2026-02-26 08:14:52'),
(15, 3, 'Eladó lakás', 'Eladó', 'ACTIVE', 'SALE', 'APARTMENT', 24000000, 'HUF', 'Miskolc', NULL, NULL, NULL, NULL, 60, 3.0, NULL, NULL, NULL, NULL, NULL, '2026-03-03 09:50:13', '2026-03-03 09:50:13');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `listing_images`
--

DROP TABLE IF EXISTS `listing_images`;
CREATE TABLE `listing_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `listing_id` bigint(20) UNSIGNED NOT NULL,
  `url` varchar(500) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `listing_images`
--

INSERT INTO `listing_images` (`id`, `listing_id`, `url`, `sort_order`, `created_at`) VALUES
(1, 1, 'https://picsum.photos/seed/apt1/900/600', 0, '2026-02-26 08:14:52'),
(2, 2, 'https://picsum.photos/seed/house1/900/600', 0, '2026-02-26 08:14:52'),
(13, 15, '/uploads/listings/15/1b154119-8c5f-4937-9b3b-5dc278e8271f.jpg', 0, '2026-03-03 09:50:13'),
(14, 15, '/uploads/listings/15/b468740e-3718-4153-9793-d118e4b6632b.jpg', 1, '2026-03-03 09:50:13'),
(15, 15, '/uploads/listings/15/7f52fe5e-e694-4698-bb52-f451a775b152.jpg', 2, '2026-03-03 09:50:13'),
(16, 15, '/uploads/listings/15/8d34cd1a-3fca-44b1-8979-bbdca7147629.jpg', 3, '2026-03-03 09:50:13');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('USER','AGENT','ADMIN') NOT NULL DEFAULT 'USER',
  `name` varchar(120) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(500) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `name`, `phone`, `created_at`, `avatar_url`, `deleted_at`) VALUES
(1, 'seed@example.com', 'SEED_ONLY_DO_NOT_USE_FOR_LOGIN', 'USER', 'Seed User', '+36300000000', '2026-02-26 08:14:52', NULL, NULL),
(2, 'tesztmark@example.com', '$2a$11$mdjnI.EkqygyhNYZ6RZFNeuf9eKAgJAJbp5CgRFwmkVR7Csk/UChe', 'USER', 'Márk Drótos', '06301201258', '2026-02-26 08:35:23', NULL, NULL),
(3, 'tesztzsolt@example.com', '$2a$11$Xcgfy0E643uYrbfS7LwJ5uHADWKC4qmMR1Vf1KNWUwSTa9X31mEse', 'USER', 'Kiss Zsolt', NULL, '2026-02-26 08:48:17', NULL, NULL),
(4, 'drotosm88@gmail.com', '$2a$11$8tbijnvmx3Bcvs1SFVlhjey6XSPhy6.d9twNhkHhOICXjVn/iaFiu', 'ADMIN', 'Admin', NULL, '2026-02-28 13:35:05', NULL, NULL);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `admin_messages`
--
ALTER TABLE `admin_messages`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`user_id`,`listing_id`),
  ADD KEY `listing_id` (`listing_id`);

--
-- A tábla indexei `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_id` (`listing_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_user_id` (`owner_user_id`);

--
-- A tábla indexei `listing_images`
--
ALTER TABLE `listing_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_id` (`listing_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_deleted_at` (`deleted_at`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `admin_messages`
--
ALTER TABLE `admin_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `listings`
--
ALTER TABLE `listings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT a táblához `listing_images`
--
ALTER TABLE `listing_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `listing_images`
--
ALTER TABLE `listing_images`
  ADD CONSTRAINT `listing_images_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
