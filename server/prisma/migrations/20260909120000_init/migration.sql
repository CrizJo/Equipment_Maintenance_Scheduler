-- CreateTable
CREATE TABLE `equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `assigned_technician` VARCHAR(191) NOT NULL,
    `status` ENUM('operational', 'under_maintenance', 'out_of_service', 'retired') NOT NULL DEFAULT 'operational',
    `repeat_type` ENUM('daily', 'weekly', 'monthly', 'yearly', 'weekdays', 'custom') NOT NULL DEFAULT 'monthly',
    `repeat_interval` INTEGER NULL,
    `repeat_unit` ENUM('days', 'weeks', 'months') NULL,
    `fixed_interval` BOOLEAN NOT NULL DEFAULT true,
    `next_maintenance_date` DATE NULL,
    `expiry_date` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `equipment_name_idx`(`name`),
    INDEX `equipment_assigned_technician_idx`(`assigned_technician`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment_id` INTEGER NOT NULL,
    `type` ENUM('preventive', 'corrective', 'inspection') NOT NULL DEFAULT 'preventive',
    `description` TEXT NOT NULL,
    `assigned_to` VARCHAR(191) NOT NULL,
    `scheduled_date` DATE NOT NULL,
    `completed_date` DATE NULL,
    `status` ENUM('scheduled', 'in_progress', 'completed', 'overdue') NOT NULL DEFAULT 'scheduled',
    `completion_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `maintenance_records_equipment_id_idx`(`equipment_id`),
    INDEX `maintenance_records_status_idx`(`status`),
    INDEX `maintenance_records_scheduled_date_idx`(`scheduled_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `maintenance_records` ADD CONSTRAINT `maintenance_records_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
