
CREATE DATABASE realestate
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_hungarian_ci;

USE realestate;

-- ===== SCHEMA =====
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS admin_messages;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER','AGENT','ADMIN') NOT NULL DEFAULT 'USER',
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE listings (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT(20) UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  deal_type VARCHAR(20) NOT NULL,
  property_type VARCHAR(30) NOT NULL,
  price BIGINT(20) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'HUF',
  city VARCHAR(120) NOT NULL,
  district VARCHAR(120) NULL,
  address_line VARCHAR(255) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  area_m2 INT(11) NOT NULL,
  rooms DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  bathrooms DECIMAL(4,1) NULL,
  floor INT(11) NULL,
  total_floors INT(11) NULL,
  year_built INT(11) NULL,
  heating_type VARCHAR(40) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  KEY owner_user_id (owner_user_id),
  CONSTRAINT listings_ibfk_1
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE listing_images (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT(20) UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT(11) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  KEY listing_id (listing_id),
  CONSTRAINT listing_images_ibfk_1
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE favorites (
  user_id BIGINT(20) UNSIGNED NOT NULL,
  listing_id BIGINT(20) UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (user_id, listing_id),
  KEY listing_id (listing_id),
  CONSTRAINT favorites_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT favorites_ibfk_2
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE inquiries (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_id BIGINT(20) UNSIGNED NOT NULL,
  user_id BIGINT(20) UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  KEY listing_id (listing_id),
  KEY user_id (user_id),
  CONSTRAINT inquiries_ibfk_1
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE,
  CONSTRAINT inquiries_ibfk_2
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE admin_messages (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT(20) UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(180) NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT admin_messages_ibfk_1
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ===== SEED =====
INSERT INTO users (email, password_hash, role, name, phone)
VALUES ('seed@example.com', 'SEED_ONLY_DO_NOT_USE_FOR_LOGIN', 'USER', 'Seed User', '+36300000000');

INSERT INTO listings
(owner_user_id, title, description, status, deal_type, property_type, price, currency, city, district, address_line, lat, lng, area_m2, rooms)
VALUES
(1, 'Modern lakás a belvárosban', 'Gyönyörű új lakás, közel mindenhez', 'ACTIVE', 'SALE', 'APARTMENT', 45000000, 'HUF', 'Budapest', 'V', NULL, NULL, NULL, 55, 2.0),
(1, 'Családi ház kerttel', 'Nagy kert, csendes környék', 'ACTIVE', 'SALE', 'HOUSE', 89000000, 'HUF', 'Budapest', 'XVI', NULL, NULL, NULL, 120, 4.0);

INSERT INTO listing_images (listing_id, url, sort_order) VALUES
(1, 'https://picsum.photos/seed/apt1/900/600', 0),
(2, 'https://picsum.photos/seed/house1/900/600', 0);
