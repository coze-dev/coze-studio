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

import { type CSSProperties } from 'react';

import { I18n } from '@coze-arch/i18n';
import { InputType } from '@coze-arch/bot-api/playground_api';

export const studioVarTextareaLineHeightKey =
  '--studio-var-textarea-line-height';

export const studioVarTextareaLineHeight = 22;

export const getCssVarStyle = (options?: {
  rows?: number;
  style?: CSSProperties;
}): CSSProperties | undefined => {
  const { rows, style } = options ?? {};

  if (typeof rows !== 'number') {
    return style;
  }

  const vars = {
    [studioVarTextareaLineHeightKey]: studioVarTextareaLineHeight * rows,
  };

  return {
    ...style,
    ...vars,
  };
};

export const componentTypeOptionMap: Partial<
  Record<
    InputType,
    {
      label: string;
    }
  >
> = {
  [InputType.TextInput]: {
    label: I18n.t('shortcut_component_type_text'),
  },
  [InputType.Select]: {
    label: I18n.t('shortcut_component_type_selector'),
  },
  [InputType.MixUpload]: {
    label: I18n.t('shortcut_modal_components_modal_upload_component'),
  },
};
