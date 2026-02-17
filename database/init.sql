-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `gatecode` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gatecode`;

-- 1. 用户表：基础信息与会员状态 (#6)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `avatar_url` VARCHAR(255),
    `role` ENUM('user', 'admin') DEFAULT 'user',
    `is_vip` BOOLEAN DEFAULT FALSE,
    `vip_expire_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. 题目表：存储算法题 (#1, #3, #11)
CREATE TABLE IF NOT EXISTS `problems` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `frontend_question_id` INT NOT NULL UNIQUE,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL UNIQUE,
    `difficulty` ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    `content` TEXT,
    `template_code` JSON, -- 存储各语言初始代码模板
    `test_cases` JSON,    -- 存储测试用例
    `is_vip_only` BOOLEAN DEFAULT FALSE,
    `is_acm_mode` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. 提交记录表：判题结果 (#4)
CREATE TABLE IF NOT EXISTS `submissions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `problem_id` BIGINT UNSIGNED NOT NULL,
    `code` TEXT NOT NULL,
    `language` VARCHAR(20) NOT NULL,
    `status` ENUM('Pending', 'Running', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compile Error', 'Runtime Error') DEFAULT 'Pending',
    `runtime_ms` INT,
    `memory_kb` INT,
    `error_message` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_problem` (`user_id`, `problem_id`),
    CONSTRAINT `fk_submission_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_submission_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. 题单/课程表 (#7, #8, #9, #10)
CREATE TABLE IF NOT EXISTS `curriculums` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500),
    `cover_image` VARCHAR(255),
    `is_vip_only` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. 题单与题目的关联表 (#7)
CREATE TABLE IF NOT EXISTS `curriculum_problems` (
    `curriculum_id` BIGINT UNSIGNED NOT NULL,
    `problem_id` BIGINT UNSIGNED NOT NULL,
    `order_index` INT DEFAULT 0,
    PRIMARY KEY (`curriculum_id`, `problem_id`),
    CONSTRAINT `fk_cp_curriculum` FOREIGN KEY (`curriculum_id`) REFERENCES `curriculums`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cp_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. 支付订单表 (#12)
CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `provider` ENUM('stripe', 'alipay') NOT NULL,
    `trade_no` VARCHAR(100) NOT NULL UNIQUE,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;