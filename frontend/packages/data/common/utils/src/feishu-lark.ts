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

import { DataSourceType } from '@coze-arch/bot-api/memory';
import { DocumentSource } from '@coze-arch/bot-api/knowledge';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';

export const isFeishuOrLarkDocumentSource = (
  source: DocumentSource | undefined,
) => source === DocumentSource.FeishuWeb || source === DocumentSource.LarkWeb;

export const isFeishuOrLarkDataSourceType = (
  source: DataSourceType | undefined,
) => source === DataSourceType.FeishuWeb || source === DataSourceType.LarkWeb;

export const isFeishuOrLarkTextUnit = (unitType: UnitType | undefined) =>
  unitType === UnitType.TEXT_FEISHU || unitType === UnitType.TEXT_LARK;

export const isFeishuOrLarkTableUnit = (unitType: UnitType | undefined) =>
  unitType === UnitType.TABLE_FEISHU || unitType === UnitType.TABLE_LARK;
