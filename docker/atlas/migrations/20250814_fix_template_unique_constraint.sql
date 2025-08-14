-- Fix template unique constraint to allow same agent_id in different spaces
-- This allows an agent to be published as both personal template and store template

-- Drop the existing unique constraint on agent_id only
ALTER TABLE `opencoze`.`template` DROP INDEX `uniq_agent_id`;

-- Add new unique constraint on (agent_id, space_id) combination
-- This allows same agent_id in different spaces (personal vs store)
ALTER TABLE `opencoze`.`template` ADD UNIQUE KEY `uniq_agent_id_space_id` (`agent_id`, `space_id`);