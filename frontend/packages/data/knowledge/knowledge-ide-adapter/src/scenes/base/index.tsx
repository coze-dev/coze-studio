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

import { useGetKnowledgeType } from '@coze-data/knowledge-ide-base/hooks/use-case';
import { FormatType } from '@coze-arch/bot-api/knowledge';

import { type BaseKnowledgeIDEProps } from './types';
import { BaseKnowledgeTextIDE } from './text-ide';
import { BaseKnowledgeTableIDE } from './table-ide';
import { BaseKnowledgeImgIDE } from './img-ide';

export type { BaseKnowledgeIDEProps };

export const BaseKnowledgeIDE = (props: BaseKnowledgeIDEProps) => {
  const { dataSetDetail: { format_type } = {} } = useGetKnowledgeType();
  if (format_type === FormatType.Text) {
    return <BaseKnowledgeTextIDE {...props} />;
  }
  if (format_type === FormatType.Table) {
    return <BaseKnowledgeTableIDE {...props} />;
  }
  if (format_type === FormatType.Image) {
    return <BaseKnowledgeImgIDE {...props} />;
  }
  return null;
};
