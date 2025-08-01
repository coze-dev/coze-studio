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

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { SingleSheet } from '@coze-agent-ide/space-bot/component';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { I18n } from '@coze-arch/i18n';
import { LayoutContext, PlacementEnum } from '@coze-arch/bot-hooks';
import { PromptView } from '@coze-agent-ide/prompt-adapter';
import { BotConfigArea } from '@coze-agent-ide/bot-config-area-adapter';

// eslint-disable-next-line @coze-arch/no-deep-relative-import
import s from '../../../../index.module.less';
import { ToolArea, type ToolAreaProps } from './tool-area';

export type AgentConfigAreaProps = ToolAreaProps & {
  modelListExtraHeaderSlot?: React.ReactNode;
};

export const AgentConfigArea: React.FC<AgentConfigAreaProps> = props => {
  const { editable, pageFrom } = usePageRuntimeStore(
    useShallow(state => ({
      editable: state.editable,
      pageFrom: state.pageFrom,
    })),
  );
  return (
    <SingleSheet
      headerClassName={classNames([
        'coz-bg-plus',
        'coz-fg-secondary',
        '!h-12',
        '!px-4',
        '!py-0',
      ])}
      title={I18n.t('bot_build_title')}
      titleClassName="!text-[16px]"
      titleNode={
        <div className={s['sheet-title-node-cover']}>
          <BotConfigArea
            pageFrom={pageFrom}
            editable={editable}
            modelListExtraHeaderSlot={props.modelListExtraHeaderSlot}
          />
        </div>
      }
    >
      <div className={s['tool-card']}>
        <LayoutContext value={{ placement: PlacementEnum.LEFT }}>
          <PromptView />
        </LayoutContext>
        <ToolArea {...props} />
      </div>
    </SingleSheet>
  );
};
