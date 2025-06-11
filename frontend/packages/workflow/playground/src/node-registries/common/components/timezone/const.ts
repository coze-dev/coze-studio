/**
 * 默认时区，目前用于 task 模块
 *
 * 国内：UTC+8
 * 海外：UTC+0
 */
export const DEFAULT_TIME_ZONE = IS_OVERSEA ? 'Etc/GMT+0' : 'Asia/Shanghai';
export const DEFAULT_TIME_ZONE_OFFSET = IS_OVERSEA ? 'UTC+00:00' : 'UTC+08:00';
// 未知时区，用于兼容
export const UNKNOWN_TIME_ZONE_OFFSET = 'Others';
