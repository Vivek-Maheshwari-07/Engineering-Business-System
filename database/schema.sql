-- ═══════════════════════════════════════════════════════════
--   Hari Krupa Engineering System — Database Schema
--   Updated: 2026-05-02 | Fixed: invoices, order_items, users
-- ═══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS engineering_erp;
USE engineering_erp;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(20)  DEFAULT NULL,          -- ← ADDED
    password    VARCHAR(255) NOT NULL,
    role        ENUM('owner', 'employee', 'customer') DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT false,
    otp         VARCHAR(10),
    otp_expiry  DATETIME,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    name           VARCHAR(255) NOT NULL,
    category       VARCHAR(255) NOT NULL,
    gst_percentage FLOAT DEFAULT 0,
    image_url      VARCHAR(255),
    status         ENUM('active', 'inactive') DEFAULT 'active',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Product Variants ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size       VARCHAR(255) NOT NULL,
    quantity   FLOAT NOT NULL DEFAULT 0,
    unit       VARCHAR(50)  NOT NULL,
    price      FLOAT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── Inventory ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    variant_id         INT NOT NULL UNIQUE,
    quantity_available FLOAT NOT NULL DEFAULT 0,
    last_updated       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    variant_id     INT NOT NULL,
    change_type    ENUM('IN', 'OUT') NOT NULL,
    quantity       FLOAT NOT NULL,
    reference_type VARCHAR(50)  DEFAULT 'MANUAL',
    reference_id   INT          DEFAULT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    customer_id  INT NOT NULL,
    total_amount FLOAT NOT NULL DEFAULT 0,
    status       ENUM('pending', 'partially_paid', 'completed', 'cancelled') DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    order_id   INT NOT NULL,
    variant_id INT NOT NULL,
    quantity   FLOAT NOT NULL,
    price      FLOAT NOT NULL,
    subtotal   FLOAT NOT NULL DEFAULT 0,   -- ← ADDED
    FOREIGN KEY (order_id)   REFERENCES orders(id)           ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- ── Invoices (GST Billing) ───────────────────────────────────
-- Fixed: replaces old gst_total with split taxable/cgst/sgst/total_tax
CREATE TABLE IF NOT EXISTS invoices (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    order_id       INT NOT NULL UNIQUE,
    taxable_amount FLOAT NOT NULL DEFAULT 0,   -- base before GST
    cgst           FLOAT NOT NULL DEFAULT 0,   -- 9%
    sgst           FLOAT NOT NULL DEFAULT 0,   -- 9%
    total_tax      FLOAT NOT NULL DEFAULT 0,   -- cgst + sgst
    final_amount   FLOAT NOT NULL DEFAULT 0,   -- taxable + total_tax
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    order_id       INT NOT NULL,
    amount_paid    DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash','upi','bank_transfer','cheque','card') NOT NULL DEFAULT 'cash',
    payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ── Employee & Salary ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_profiles (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL UNIQUE,
    base_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    join_date   DATE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS salary_records (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    employee_id  INT NOT NULL,
    month        TINYINT NOT NULL,
    year         SMALLINT NOT NULL,
    base_salary  DECIMAL(12,2) NOT NULL,
    deductions   DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_salary   DECIMAL(12,2) NOT NULL,
    notes        TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_employee_month_year (employee_id, month, year),
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);
