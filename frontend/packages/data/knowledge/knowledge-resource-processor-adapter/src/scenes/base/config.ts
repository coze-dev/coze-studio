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

import { get } from 'lodash-es';
import {
  type GetUploadConfig,
  UnitType,
  OptType,
  type UploadBaseState,
  type UploadBaseAction,
} from '@coze-data/knowledge-resource-processor-core';
import { TextResegmentConfig } from '@coze-data/knowledge-resource-processor-base/features/resegment/text';
import { TableResegmentConfig } from '@coze-data/knowledge-resource-processor-base/features/resegment/table';
import { TextLocalResegmentConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/text/first-party/local/resegment';
import { TextLocalAddUpdateConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/text/first-party/local/add';
import { TextCustomAddUpdateConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/text/first-party/custom/add';
import { TableLocalIncrementalConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/table/first-party/local/incremental';
import { TableLocalAddConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/table/first-party/local/add';
import { TableCustomIncrementalConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/table/first-party/custom/incremental';
import { TableCustomAddConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/table/first-party/custom/add';
import { ImageFileAddConfig } from '@coze-data/knowledge-resource-processor-base/features/knowledge-type/image/file';

const getConfigV2 = () => ({
  [UnitType.TEXT]: {
    [OptType.RESEGMENT]: TextResegmentConfig,
  },
  [UnitType.TABLE]: {
    [OptType.RESEGMENT]: TableResegmentConfig,
  },
  [UnitType.TEXT_DOC]: {
    [OptType.ADD]: TextLocalAddUpdateConfig,
    [OptType.RESEGMENT]: TextLocalResegmentConfig,
  },
  [UnitType.TEXT_CUSTOM]: {
    [OptType.ADD]: TextCustomAddUpdateConfig,
  },
  [UnitType.TABLE_DOC]: {
    [OptType.ADD]: TableLocalAddConfig,
    [OptType.INCREMENTAL]: TableLocalIncrementalConfig,
  },
  [UnitType.TABLE_CUSTOM]: {
    [OptType.ADD]: TableCustomAddConfig,
    [OptType.INCREMENTAL]: TableCustomIncrementalConfig,
  },
  [UnitType.IMAGE_FILE]: {
    [OptType.ADD]: ImageFileAddConfig,
  },
});

/**
 * Knowledge information architecture reconstruction changes are not small, so split into two configs. Change points:
 * 1. Remove the update operation from all links
 * 2. The resegment of the text shares one, because the interaction is already the same
 * 3. There are some detailed UI changes
 * 4. All interfaces have been migrated to KnowledgeAPI.
 */
export const getUploadConfig: GetUploadConfig<
  number,
  UploadBaseState<number> & UploadBaseAction<number>
> = (type, opt) => {
  const optKey = opt || OptType.ADD; // When opt === '' , the default is ADD.
  const config = getConfigV2();

  return get(config, `${type}.${optKey}`, null);
};
