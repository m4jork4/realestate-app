-- schema.sql (UTF-8)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS admin_messages;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;

-- ===== USERS =====
CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER','AGENT','ADMIN') NOT NULL DEFAULT 'USER',
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ===== LISTINGS =====
CREATE TABLE listings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  deal_type VARCHAR(20) NOT NULL,
  property_type VARCHAR(30) NOT NULL,
  price BIGINT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'HUF',
  city VARCHAR(120) NOT NULL,
  district VARCHAR(120) NULL,
  address_line VARCHAR(255) NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  area_m2 INT NOT NULL,
  rooms DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  bathrooms DECIMAL(4,1) NULL,
  floor INT NULL,
  total_floors INT NULL,
  year_built INT NULL,
  heating_type VARCHAR(40) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_listings_owner (owner_user_id),
  CONSTRAINT fk_listings_owner
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ===== LISTING IMAGES =====
CREATE TABLE listing_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_listing_images_listing (listing_id),
  CONSTRAINT fk_listing_images_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ===== FAVORITES =====
CREATE TABLE favorites (
  user_id BIGINT NOT NULL,
  listing_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, listing_id),
  KEY idx_fav_listing (listing_id),
  CONSTRAINT fk_fav_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_fav_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ===== INQUIRIES =====
CREATE TABLE inquiries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inq_listing (listing_id),
  KEY idx_inq_user (user_id),
  CONSTRAINT fk_inq_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_inq_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ===== ADMIN MESSAGES =====
CREATE TABLE admin_messages (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(180) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_msg_user (user_id),
  CONSTRAINT fk_admin_msg_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

SET FOREIGN_KEY_CHECKS = 1;
