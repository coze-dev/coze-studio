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
 * Knowledge 信息架构重构改动不小，故拆成两个 config。改动点：
 * 1、所有链路去掉 update 操作
 * 2、text 的 resegment 共用一个，因为交互上已经是同一个了
 * 3、有一些细节UI改动
 * 4、所有接口都迁移到了 KnowledgeApi
 */
export const getUploadConfig: GetUploadConfig<
  number,
  UploadBaseState<number> & UploadBaseAction<number>
> = (type, opt) => {
  const optKey = opt || OptType.ADD; // 当 opt === '' 时，默认当做 ADD
  const config = getConfigV2();

  return get(config, `${type}.${optKey}`, null);
};
