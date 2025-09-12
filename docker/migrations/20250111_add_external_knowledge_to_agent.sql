-- Add external_knowledge field to single_agent_draft table
ALTER TABLE `single_agent_draft` 
ADD COLUMN `external_knowledge` JSON DEFAULT NULL COMMENT 'External knowledge base configuration' AFTER `knowledge`;

-- Add external_knowledge field to single_agent_version table  
ALTER TABLE `single_agent_version`
ADD COLUMN `external_knowledge` JSON DEFAULT NULL COMMENT 'External knowledge base configuration' AFTER `knowledge`;