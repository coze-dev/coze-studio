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
