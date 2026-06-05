-- ============================================================
-- DAB Enterprise LTD - Store Management System (SMS)
-- Database: SMS
-- Author: Iradukunda Bertin
-- National Practical Exam 2026
-- ============================================================

CREATE DATABASE IF NOT EXISTS SMS;
USE SMS;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,   -- PK
    user_name VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: stockIn
-- ============================================================
CREATE TABLE IF NOT EXISTS stockIn (
    stockIn_id INT AUTO_INCREMENT PRIMARY KEY,  -- PK
    user_id INT NOT NULL,                        -- FK -> users(user_id)
    itemName VARCHAR(100) NOT NULL,
    description TEXT,
    quantityIn INT NOT NULL DEFAULT 0,
    totalQuantityIn INT NOT NULL DEFAULT 0,
    supplierName VARCHAR(150) NOT NULL,
    stockInDate DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stockIn_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: stockOut
-- ============================================================
CREATE TABLE IF NOT EXISTS stockOut (
    stockOut_id INT AUTO_INCREMENT PRIMARY KEY,  -- PK
    user_id INT NOT NULL,                         -- FK -> users(user_id)
    stockIn_id INT NOT NULL,                      -- FK -> stockIn(stockIn_id)
    itemName VARCHAR(100) NOT NULL,
    quantityOut INT NOT NULL DEFAULT 0,
    totalQuantityOut INT NOT NULL DEFAULT 0,
    stockOutDate DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stockOut_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stockOut_stockIn FOREIGN KEY (stockIn_id) REFERENCES stockIn(stockIn_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- DEFAULT ADMIN USER (password: admin123)
-- ============================================================
INSERT INTO users (user_name, password) VALUES
('admin', '$2b$10$Jar7Hi3/8RlpvMc6ZYYYp.xXJCjerfABJLDO4b1eIu1I.qRK/vQI6');

-- ============================================================
-- SAMPLE ITEMS STOCK IN DATA
-- ============================================================
INSERT INTO stockIn (user_id, itemName, description, quantityIn, totalQuantityIn, supplierName, stockInDate) VALUES
(1, 'Steel Bars',      'High tensile steel reinforcement bars', 200, 200, 'Rwanda Steel Ltd',     CURDATE()),
(1, 'Wheelbarrows',    'Heavy duty construction wheelbarrows',  50,  50,  'BuildCo Rwanda',       CURDATE()),
(1, 'Ceramic Tiles',   '60x60 ceramic floor tiles',            500, 500, 'Tile Masters Kigali',  CURDATE()),
(1, 'Cement',          'Portland cement 50kg bags',             300, 300, 'CIMERWA',              CURDATE()),
(1, 'Painting Brush',  'Professional paint brushes set',        150, 150, 'Paint World Rwanda',   CURDATE()),
(1, 'Color Paint',     'Interior/exterior wall paint 20L',      100, 100, 'Sadolin Rwanda',       CURDATE()),
(1, 'Masonry Nails',   'Steel masonry nails assorted sizes',    1000,1000,'Hardware Hub Kigali',  CURDATE()),
(1, 'Iron Sheets',     'Galvanized corrugated iron sheets',     400, 400, 'Rwanda Iron Works',    CURDATE());
