/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Default time zone, currently used by the task module
 *
 * Domestic: UTC + 8
 * Overseas: UTC + 0
 */
export const DEFAULT_TIME_ZONE = IS_OVERSEA ? 'Etc/GMT+0' : 'Asia/Shanghai';
export const DEFAULT_TIME_ZONE_OFFSET = IS_OVERSEA ? 'UTC+00:00' : 'UTC+08:00';
// Unknown time zone for compatibility
export const UNKNOWN_TIME_ZONE_OFFSET = 'Others';
