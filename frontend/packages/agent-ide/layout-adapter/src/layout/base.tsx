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

import { type ReactNode, type PropsWithChildren } from 'react';
import cls from 'classnames';

import { I18n } from '@coze-arch/i18n';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import BotEditorLayout, {
  type BotEditorLayoutProps,
  BotHeader,
  DeployButton,
} from '@coze-agent-ide/layout';

import { useInitAgent } from '../hooks/use-init-agent';
import { modeOptionList } from '../header/mode-list';
import { HeaderAddonAfter } from '../header';

export interface LayoutAdapterProps {
  headerExtra?: ReactNode;
  pageName?: string;
}

export const BotEditorInitLayoutAdapter: React.FC<
  PropsWithChildren<BotEditorLayoutProps & LayoutAdapterProps>
> = ({ children, headerExtra, pageName, ...layoutProps }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabOptions = [
    {
      label: I18n.t('bot_build_title'),
      value: 'arrange',
    },
    {
      label: I18n.t('analytic_query_summary_title'),
      value: 'statistic',
    },
  ];

  const { botId, spaceId } = useBotInfoStore(
    useShallow(s => ({
      description: s.description,
      botId: s.botId,
      botInfo: s,
      spaceId: s.space_id,
    })),
  );

  const tabPath = location.pathname.split(botId)[1];

  const switchRoute = (path: String) => {
    navigate(`/space/${spaceId}/bot/${botId}/${path}`, { replace: true });
  };

  useInitAgent();

  const isPreview = usePageRuntimeStore(state => state.isPreview);
  const isEditLocked = isPreview || tabPath.includes('statistic');

  return (
    <BotEditorLayout
      {...layoutProps}
      header={
        <BotHeader
          pageName={pageName}
          isEditLocked={isPreview}
          addonAfter={
            <HeaderAddonAfter pageName={pageName} isEditLocked={isEditLocked} />
          }
          addonCenter={
            <div className="flex items-center gap-4 cursor-pointer">
              {tabOptions.map(item => (
                <div
                  key={item.value}
                  className={cls('font-bold', {
                    'coz-fg-plus': tabPath.includes(item.value),
                  })}
                  onClick={() => switchRoute(item.value)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          }
          modeOptionList={modeOptionList}
          deployButton={
            <DeployButton
              btnType="warning"
              btnText={I18n.t('bot_publish_ republish_btn')}
              customStyle={{ height: '38px' }}
            />
          }
        />
      }
    >
      {children}
    </BotEditorLayout>
  );
};
