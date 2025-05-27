-- 初始化用户表数据
-- 使用 INSERT ON DUPLICATE KEY UPDATE 语句
-- 当主键或唯一键冲突时，不会插入新记录，而是更新指定字段

-- email: developer@opencoze.com, password: 123456
INSERT INTO user (id, name, unique_name, email, password, description, icon_uri, user_verified, country_code, session_key, created_at, updated_at)
VALUES (888, 'developer', 'developer@opencoze.com', 'developer@opencoze.com',
'$argon2id$v=19$m=65536,t=3,p=4$NuzvhNc89RHjGkwmfItHkg$hWXhVXjQFTP/Pa637AqtcHXs84evoDUzeQsTKTElau4',
'', 'default_icon/user_default_icon.png', 0, 0, '', 1746698238701, 1746698238701)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password = VALUES(password),
    description = VALUES(description),
    icon_uri = VALUES(icon_uri),
    user_verified = VALUES(user_verified),
    country_code = VALUES(country_code),
    updated_at = VALUES(updated_at);

-- 初始化空间表数据
INSERT INTO space (id, owner_id, name, description, icon_uri, creator_id, created_at, updated_at, deleted_at)
VALUES (666, 888, 'Personal Space', 'This is your personal space', 'default_icon/team_default_icon.png',
        888, 1747043468643, 1747043468643, NULL)
ON DUPLICATE KEY UPDATE
    owner_id = VALUES(owner_id),
    name = VALUES(name),
    description = VALUES(description),
    icon_uri = VALUES(icon_uri),
    creator_id = VALUES(creator_id),
    updated_at = VALUES(updated_at),
    deleted_at = VALUES(deleted_at);

-- 初始化空间成员表数据
INSERT INTO space_user (id, space_id, user_id, role_type, created_at, updated_at)
VALUES (1, 666, 888, 1, 1747043468643, 1747043468643)
ON DUPLICATE KEY UPDATE
    space_id = VALUES(space_id),
    user_id = VALUES(user_id),
    role_type = VALUES(role_type),
    updated_at = VALUES(updated_at);


-- mock chat mode config for self-test, if publish should remove
INSERT INTO `opencoze`.`model_meta` (`id`, `model_name`, `protocol`, `icon_uri`, `capability`, `conn_config`, `status`, `description`, `created_at`, `updated_at`, `deleted_at`)
VALUES (123, '方舟', 'ark', '', '{\"support_sp\": true, \"function_call\": true, \"search_enhance\": false, \"support_stream\": true}', '{\"ark\": {\"region\": \"\", \"access_key\": \"bb5b06d3-06a1-42fb-9bbf-e7eef262e6a3\", \"secret_key\": \"\"}, \"model\": \"ep-20240923105216-clktf\", \"api_key\": \"bb5b06d3-06a1-42fb-9bbf-e7eef262e6a3\", \"base_url\": \"\"}', 1, '', 0, 0, NULL)
ON DUPLICATE KEY UPDATE
   id = VALUES(id);


INSERT INTO `opencoze`.`model_entity` (`id`, `meta_id`, `name`, `description`, `default_params`, `scenario`, `status`, `created_at`, `updated_at`, `deleted_at`)
VALUES (1, 123, '豆包·1.5·Pro·32k', "", '[{\"name\":\"temperature\",\"label\":\"生成随机性\",\"desc\":\"- **temperature**: 调高温度会使得模型的输出更多样性和创新性，反之，降低温度会使输出内容更加遵循指令要求但减少多样性。建议不要与“Top p”同时调整。\",\"type\":\"float\",\"min\":\"0\",\"max\":\"1\",\"default_val\":{\"balance\":\"0.8\",\"creative\":\"1\",\"default_val\":\"1.0\",\"precise\":\"0.3\"},\"precision\":1,\"options\":null,\"param_class\":{\"class_id\":\"slider\",\"label\":\"生成随机性\"}},{\"name\":\"max_tokens\",\"label\":\"最大回复长度\",\"desc\":\"控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于 150 个中文汉字。\",\"type\":\"int\",\"min\":\"1\",\"max\":\"12288\",\"default_val\":{\"default_val\":\"4096\"},\"options\":null,\"param_class\":{\"class_id\":\"slider\",\"label\":\"输入及输出设置\"}}]',
        1, 0, 0, 0, NULL)
    ON DUPLICATE KEY UPDATE
    id = VALUES(id);
