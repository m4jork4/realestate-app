-- seed.sql (UTF-8)
SET NAMES utf8mb4;




INSERT INTO users (email, password_hash, role, name, phone)
VALUES ('owner@example.com', 'DUMMY_HASH', 'USER', 'Owner User', '+36301234567');

SET @owner_id = LAST_INSERT_ID();

INSERT INTO listings
(owner_user_id, title, description, status, deal_type, property_type, price, currency, city, district, area_m2, rooms)
VALUES
(@owner_id, 'Modern lakás a belvárosban', 'Gyönyörű új lakás, közel mindenhez', 'ACTIVE', 'SALE', 'APARTMENT', 45000000, 'HUF', 'Budapest', 'V', 55, 2.0),
(@owner_id, 'Családi ház kerttel', 'Nagy kert, csendes környék', 'ACTIVE', 'SALE', 'HOUSE', 89000000, 'HUF', 'Budapest', 'XVI', 120, 4.0);

-- cover kép 1. hirdetéshez 
INSERT INTO listing_images (listing_id, url, sort_order)
VALUES (1, 'https://picsum.photos/seed/house1/1200/800', 0);
