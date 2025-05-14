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