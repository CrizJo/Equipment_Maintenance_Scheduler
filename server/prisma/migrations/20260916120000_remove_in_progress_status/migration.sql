UPDATE `maintenance_records` SET `status` = 'scheduled' WHERE `status` = 'in_progress';

ALTER TABLE `maintenance_records` MODIFY `status` ENUM('scheduled', 'completed', 'overdue') NOT NULL DEFAULT 'scheduled';
