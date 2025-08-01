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

import { DocumentSource, FormatType } from '@coze-arch/bot-api/knowledge';
import { isFeishuOrLarkDocumentSource } from '@coze-data/utils';
import { IconUnitsTable, IconUnitsFile } from '@coze-arch/bot-icons';

import { IconWithSuffix } from './suffix';

// Get icon
export const RenderDocumentIcon = ({
  formatType,
  sourceType,
  isDisconnect,
  className,
  iconSuffixClassName,
}: {
  formatType?: FormatType;
  sourceType?: DocumentSource;
  isDisconnect?: boolean;
  className?: string;
  iconSuffixClassName?: string;
}) => {
  if (
    sourceType &&
    ([DocumentSource.Notion, DocumentSource.GoogleDrive].includes(sourceType) ||
      isFeishuOrLarkDocumentSource(sourceType))
  ) {
    return (
      <IconWithSuffix
        hasSuffix={!!isDisconnect}
        formatType={formatType}
        className={iconSuffixClassName}
      />
    );
  } else {
    return formatType === FormatType.Table ? (
      <IconUnitsTable className={className} />
    ) : (
      <IconUnitsFile className={className} />
    );
  }
};
