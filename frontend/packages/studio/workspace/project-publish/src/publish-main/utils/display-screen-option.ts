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

import { UIPreviewType } from '@coze-arch/idl/product_api';
import { type UIOption } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';

export enum DisplayScreen {
  Web = 'web',
  Mobile = 'mobile',
}

export interface DisplayScreenOption {
  label: string;
  value: DisplayScreen;
  disabled?: boolean;
  tooltip?: string;
}

export function toDisplayScreenOption(uiOption: UIOption): DisplayScreenOption {
  const publicProps = {
    disabled: uiOption.available === false,
    tooltip: uiOption.unavailable_reason,
  };
  if (uiOption.ui_channel === UIPreviewType.Web.toString()) {
    return {
      value: DisplayScreen.Web,
      label: I18n.t('builder_canvas_tools_pc'),
      ...publicProps,
    };
  }
  return {
    value: DisplayScreen.Mobile,
    label: I18n.t('builder_canvas_tools_phone'),
    ...publicProps,
  };
}
