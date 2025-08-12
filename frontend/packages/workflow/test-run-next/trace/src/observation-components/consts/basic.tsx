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

import { type Value, TagType } from '../typings/idl';

export enum StatusCode {
  SUCCESS = 0,
  ERROR = 1,
}

export const META_TAGS_VALUE_TYPE_MAP: Record<TagType, keyof Value> = {
  [TagType.STRING]: 'v_str',
  [TagType.DOUBLE]: 'v_double',
  [TagType.BOOL]: 'v_bool',
  [TagType.LONG]: 'v_long',
  [TagType.BYTES]: 'v_bytes',
};

export enum RegionMap {
  CN = 'cn',
  I18N = 'i18N',
}
