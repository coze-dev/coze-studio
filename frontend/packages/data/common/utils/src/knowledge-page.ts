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

import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { FormatType } from '@coze-arch/bot-api/knowledge';

export const getFormatTypeFromUnitType = (type: UnitType) => {
  switch (type) {
    case UnitType.TABLE:
    case UnitType.TABLE_API:
    case UnitType.TABLE_DOC:
    case UnitType.TABLE_CUSTOM:
    case UnitType.TABLE_FEISHU:
    case UnitType.TABLE_GOOGLE_DRIVE:
      return FormatType.Table;
    case UnitType.IMAGE:
    case UnitType.IMAGE_FILE:
      return FormatType.Image;
    default:
      return FormatType.Text;
  }
};
