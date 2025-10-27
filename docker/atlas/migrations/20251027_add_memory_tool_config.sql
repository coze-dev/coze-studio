-- Add memory_tool_config column to single_agent_draft and single_agent_version tables
-- Modify "single_agent_draft" table
ALTER TABLE `opencoze`.`single_agent_draft`
ADD COLUMN `memory_tool_config` json NULL COMMENT "Memory Tool Configuration" AFTER `layout_info`;

-- Modify "single_agent_version" table
ALTER TABLE `opencoze`.`single_agent_version`
ADD COLUMN `memory_tool_config` json NULL COMMENT "Memory Tool Configuration" AFTER `version`;
