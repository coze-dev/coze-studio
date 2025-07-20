-- Modify "plugin_oauth_auth" table
ALTER TABLE `opencoze`.`plugin_oauth_auth` MODIFY COLUMN `access_token` text NOT NULL COMMENT "Access Token", MODIFY COLUMN `refresh_token` text NOT NULL COMMENT "Refresh Token";
