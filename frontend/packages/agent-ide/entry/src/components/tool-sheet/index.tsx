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

import { type ReactNode } from 'react';

import classNames from 'classnames';
import { SheetView } from '@coze-agent-ide/space-bot/component';
import { I18n } from '@coze-arch/i18n';
import { IconBotMultiLeftBtnIcon } from '@coze-arch/bot-icons';
import { type BotMode } from '@coze-arch/bot-api/developer_api';

import s from '../../pages/index.module.less';

interface ToolSheetProps {
  mode: BotMode;
  titleNode: ReactNode;
  children: ReactNode;
}

export const ToolSheet = ({ mode, titleNode, children }: ToolSheetProps) => (
  <SheetView
    headerClassName={classNames([
      'coz-bg-plus',
      'coz-fg-secondary',
      s['sheet-view-left-header'],
      s['sheet-view-new-header'],
    ])}
    mode={mode}
    title={I18n.t('bot_build_title')}
    titleNode={titleNode}
    slideProps={{
      placement: 'left',
      closeBtnTooltip: I18n.t('chatflow_develop_tooltip_hide'),
      openBtnTooltip: I18n.t('chatflow_develop_tooltip_show'),
      width: 400,
      visible: true,
      btnNode: <IconBotMultiLeftBtnIcon />,
    }}
  >
    {children}
  </SheetView>
);
