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
 
import { ViewVariableType } from '@coze-workflow/base';

export const GROUP_NAME_PREFIX = 'Group';

export const MATCHED_VARIABLE_TYPES: ViewVariableType[][] = [
  [ViewVariableType.Number, ViewVariableType.Integer],
];

/**
 * 分组名最大数量
 */
export const MAX_GROUP_NAME_COUNT = 20;
/**
 * 分组最大数量
 */
export const MAX_GROUP_COUNT = 50;
/**
 * 分组变量最大数量
 */
export const MAX_GROUP_VARIABLE_COUNT = 50;
