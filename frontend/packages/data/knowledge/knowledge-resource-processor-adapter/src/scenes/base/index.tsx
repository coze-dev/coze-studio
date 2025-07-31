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

import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import {
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import {
  KnowledgeResourceProcessorLayout,
  type KnowledgeResourceProcessorLayoutProps,
} from '@coze-data/knowledge-resource-processor-base/layout/base';

import { getUploadConfig } from './config';

export type KnowledgeResourceProcessorProps =
  KnowledgeResourceProcessorLayoutProps;

export const KnowledgeResourceProcessor = (
  props: KnowledgeResourceProcessorProps,
) => {
  const { type, opt } = useKnowledgeParams();
  const uploadConfig = getUploadConfig(
    type ?? UnitType.TEXT,
    opt ?? OptType.ADD,
  );
  if (!uploadConfig) {
    return <></>;
  }
  return (
    <KnowledgeResourceProcessorLayout {...props} uploadConfig={uploadConfig} />
  );
};
