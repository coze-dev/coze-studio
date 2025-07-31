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

import { FormatType } from '@coze-arch/bot-api/knowledge';

import { type ImportKnowledgeSourceSelectModule } from '../module';
import { TextKnowledgeSourceSelect } from './text-knowledge-source-select';
import { TableKnowledgeSourceSelect } from './table-knowledge-source-select';
import { ImageKnowledgeSourceSelect } from './image-knowledge-source-select';

export const ImportKnowledgeSourceSelect: ImportKnowledgeSourceSelectModule =
  props => {
    const { formatType, initValue, onChange } = props;
    if (formatType === FormatType.Text) {
      return (
        <TextKnowledgeSourceSelect initValue={initValue} onChange={onChange} />
      );
    }
    if (formatType === FormatType.Image) {
      return (
        <ImageKnowledgeSourceSelect initValue={initValue} onChange={onChange} />
      );
    }
    if (formatType === FormatType.Table) {
      return (
        <TableKnowledgeSourceSelect initValue={initValue} onChange={onChange} />
      );
    }
  };
