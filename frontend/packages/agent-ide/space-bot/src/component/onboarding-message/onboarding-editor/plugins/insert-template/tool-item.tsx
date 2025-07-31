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

import { type FC, type PropsWithChildren } from 'react';

import { ToolbarButton } from '@coze-common/md-editor-adapter';

const PLUGIN_KEY = 'insertTemplate';

export interface InsertTemplateToolItemProps {
  style?: React.CSSProperties;
  tooltipText?: string;
  pluginValue: string;
}
export const InsertTemplateToolItem: FC<
  PropsWithChildren<InsertTemplateToolItemProps>
> = ({ children, tooltipText, pluginValue }) => (
  <ToolbarButton
    extra={{
      size: 'small',
    }}
    icon={children}
    tooltipText={tooltipText}
    pluginKey={PLUGIN_KEY}
    pluginValue={pluginValue}
  ></ToolbarButton>
);
