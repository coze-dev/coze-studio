CREATE TABLE `data_copy_task` (
  `master_task_id` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '复制任务ID',
  `origin_data_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '源id',
  `target_data_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '目标id',
  `origin_space_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '源团队空间',
  `target_space_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '目标团队空间',
  `origin_user_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '源用户ID',
  `target_user_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '目标用户ID',
  `origin_app_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '源AppID',
  `target_app_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '目标AppID',
  `data_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '数据类型 1:knowledge, 2:database',
  `ext_info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '存储额外信息',
  `start_time` bigint(20) NOT NULL DEFAULT 0 COMMENT '任务开始时间',
  `finish_time` bigint(20) NULL DEFAULT NULL COMMENT '任务结束时间',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1:创建 2:执行中 3:成功 4:失败',
  `error_msg` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '错误信息',
  PRIMARY KEY (`master_task_id`,`origin_data_id`,`data_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='data方向复制任务记录表'