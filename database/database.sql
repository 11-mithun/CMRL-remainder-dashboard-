CREATE DATABASE IF NOT EXISTS reminder_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE reminder_dashboard;

-- Also create in cmrl_dashboard for consistency
CREATE DATABASE IF NOT EXISTS cmrl_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cmrl_dashboard;

CREATE TABLE IF NOT EXISTS contractor_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sno VARCHAR(50),
    efile VARCHAR(255),
    contractor TEXT,
    description TEXT,
    value VARCHAR(255),
    start_date DATE,
    end_date DATE,
    duration VARCHAR(255),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bill_tracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sno VARCHAR(50),
    efile VARCHAR(255),
    contractor TEXT,
    start_date DATE,
    end_date DATE,
    duration VARCHAR(255),
    handle_by VARCHAR(255),
    frequency VARCHAR(50),
    months VARCHAR(255),
    pending_status VARCHAR(255),
    remarks TEXT,
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS epbg (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sno VARCHAR(50),
    efile VARCHAR(255),
    contractor TEXT,
    description TEXT,
    value VARCHAR(255),
    start_date DATE,
    end_date DATE,
    duration VARCHAR(255),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Contract renewals table
CREATE TABLE IF NOT EXISTS contract_renewals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_contract_id INT,
    contractor_name VARCHAR(255),
    old_end_date DATE,
    new_end_date DATE,
    renewal_amount DECIMAL(10,2),
    status ENUM('pending', 'paid', 'confirmed', 'cancelled') DEFAULT 'pending',
    payment_id VARCHAR(255),
    ai_analysis_id INT,
    user_action ENUM('renew', 'cancel') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- AI analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT,
    analysis_type ENUM('risk', 'compliance', 'negotiation', 'renewal_suggestion'),
    ai_response TEXT,
    confidence_score DECIMAL(3,2),
    local_data_used BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Payment transactions table (for prototype)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    renewal_id INT,
    payment_gateway VARCHAR(50) DEFAULT 'stripe',
    transaction_id VARCHAR(255),
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'prototype') DEFAULT 'prototype',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user', 'staff') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Insert default users with email support
INSERT INTO users (username, email, password, name, role) VALUES
('Subikshan', 'n.subikshan07@gmail.com', 'Admin@123', 'Admin One', 'admin'),
('admin2', 'admin2@company.com', 'Admin@456', 'Admin Two', 'admin'),
('user1', 'user1@company.com', 'User@123', 'User One', 'user'),
('user2', 'user2@company.com', 'User@456', 'User Two', 'user'),
('user3', 'user3@company.com', 'User@789', 'User Three', 'user'),
('user4', 'user4@company.com', 'User@012', 'User Four', 'user'),
('staff1', 'staff1@company.com', 'Staff@123', 'Staff One', 'staff'),
('staff2', 'staff2@company.com', 'Staff@456', 'Staff Two', 'staff')
ON DUPLICATE KEY UPDATE email=VALUES(email);

SHOW TABLES;

SELECT * FROM contractor_list;
SELECT * FROM bill_tracker;
SELECT * FROM epbg;