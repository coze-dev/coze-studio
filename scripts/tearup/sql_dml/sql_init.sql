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

-- 输出操作结果
SELECT 
    CASE 
        WHEN ROW_COUNT() = 1 THEN 'User data inserted successfully.' 
        WHEN ROW_COUNT() = 2 THEN 'User data updated successfully.' 
        ELSE 'No changes made to user data.' 
    END AS message;