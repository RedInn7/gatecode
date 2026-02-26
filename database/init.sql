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

-- 7. 标签表
CREATE TABLE IF NOT EXISTS `tags` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `type` ENUM('topic', 'company', 'position') NOT NULL,
    `is_vip_only` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. 题目-标签关联表
CREATE TABLE IF NOT EXISTS `problem_tags` (
    `problem_id` BIGINT UNSIGNED NOT NULL,
    `tag_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`problem_id`, `tag_id`),
    CONSTRAINT `fk_pt_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. 用户收藏夹
CREATE TABLE IF NOT EXISTS `user_favorites` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL DEFAULT '默认收藏夹',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. 收藏夹-题目关联表
CREATE TABLE IF NOT EXISTS `user_favorite_problems` (
    `favorite_id` BIGINT UNSIGNED NOT NULL,
    `problem_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`favorite_id`, `problem_id`),
    CONSTRAINT `fk_ufp_fav` FOREIGN KEY (`favorite_id`) REFERENCES `user_favorites`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ufp_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. 扩展 users 表：保研/校招信息
ALTER TABLE `users`
    ADD COLUMN IF NOT EXISTS `target_school` VARCHAR(100) AFTER `avatar_url`,
    ADD COLUMN IF NOT EXISTS `current_school` VARCHAR(100) AFTER `target_school`,
    ADD COLUMN IF NOT EXISTS `apply_year` SMALLINT AFTER `current_school`;

-- 12. 扩展 curriculums 表：难度级别
ALTER TABLE `curriculums`
    ADD COLUMN IF NOT EXISTS `difficulty_level` ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate' AFTER `cover_image`;

-- 13. 扩展 problems 表：per-problem resource limits & judge toggle
ALTER TABLE `problems`
    ADD COLUMN IF NOT EXISTS `time_limit_ms` INT NOT NULL DEFAULT 0 AFTER `is_acm_mode`,
    ADD COLUMN IF NOT EXISTS `memory_limit_mb` INT NOT NULL DEFAULT 0 AFTER `time_limit_ms`;

ALTER TABLE `problems`
    ADD COLUMN IF NOT EXISTS `judge_enabled` BOOLEAN DEFAULT TRUE AFTER `is_spj`;

-- 14. 扩展 problems 表：solutions & editorial
ALTER TABLE `problems`
    ADD COLUMN IF NOT EXISTS `solutions` JSON AFTER `judge_enabled`,
    ADD COLUMN IF NOT EXISTS `editorial` MEDIUMTEXT AFTER `solutions`;

-- 15. 扩展 submissions 状态：add MLE and SE
ALTER TABLE `submissions`
    MODIFY COLUMN `status` ENUM('Pending', 'Running', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Compile Error', 'Runtime Error', 'System Error') DEFAULT 'Pending';