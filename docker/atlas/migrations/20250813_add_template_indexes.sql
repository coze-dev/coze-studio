-- Add index for template queries optimization
-- This improves performance for template publishing feature

-- Add index for space_id queries (filtering by template space)
ALTER TABLE `opencoze`.`template` ADD INDEX `idx_space_id` (`space_id`);

-- Add compound index for space_id and created_at (for pagination and ordering)
ALTER TABLE `opencoze`.`template` ADD INDEX `idx_space_id_created_at` (`space_id`, `created_at` DESC);

-- Add index for product_entity_type (filtering by template types)
ALTER TABLE `opencoze`.`template` ADD INDEX `idx_product_entity_type` (`product_entity_type`);