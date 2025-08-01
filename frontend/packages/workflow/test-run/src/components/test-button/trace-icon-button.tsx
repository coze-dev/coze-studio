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

import { I18n } from '@coze-arch/i18n';
import { IconCozDebug } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip, type ButtonProps } from '@coze-arch/coze-design';

type TraceIconButtonProps = ButtonProps;

export const TraceIconButton: React.FC<TraceIconButtonProps> = props => (
  <Tooltip content={I18n.t('debug_btn')}>
    <IconButton
      icon={<IconCozDebug className="coz-fg-primary" />}
      color="secondary"
      {...props}
    />
  </Tooltip>
);
