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

import { type FC } from 'react';

import { type RenderFileItemProps } from '@coze-arch/bot-semi/Upload';
import {
  IconPDFFile,
  IconUnknowFile as IconUnknownFile,
  IconTextFile,
  IconDocxFile,
} from '@coze-arch/bot-icons';

import { getFileExtension } from '../../utils/common';
import { type FileType } from './types';

export const PreviewFile: FC<RenderFileItemProps> = props => {
  const type = (getFileExtension(props.name) || 'unknown') as FileType;

  const components: Record<FileType, React.FC> = {
    unknown: IconUnknownFile,
    pdf: IconPDFFile,
    text: IconTextFile,
    docx: IconDocxFile,
  };

  const ComponentToRender = components[type] || IconUnknownFile;

  return <ComponentToRender />;
};
