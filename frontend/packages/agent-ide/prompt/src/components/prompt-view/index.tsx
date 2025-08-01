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

import { type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { ToolContentBlock } from '@coze-agent-ide/tool';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { BotMode } from '@coze-arch/bot-api/developer_api';

import { PromptEditorEntry } from '../prompt-editor';

import s from './index.module.less';

export interface PromptViewProps {
  actionButton?: React.ReactNode;
  editorExtensions?: React.ReactNode;
  className?: string;
}

export const PromptView: React.FC<
  PropsWithChildren<PromptViewProps>
> = props => {
  const { actionButton, className, children, editorExtensions } = props;

  const isReadonly = useBotDetailIsReadonly();
  const mode = useBotInfoStore(innerS => innerS.mode);

  const isSingle = mode === BotMode.SingleMode;
  const isMulti = mode === BotMode.MultiMode;

  return (
    <>
      <div
        className={classNames(
          s['system-area'],
          isMulti && s['system-area-multi'],
        )}
      >
        <ToolContentBlock
          className={classNames(
            s['bot-system-block'],
            'coz-bg-plus',
            isReadonly && s['bot-system-block-readOnly'],
            s['bot-system-block-no-border'],
            className,
          )}
          headerClassName={classNames(
            isSingle && s['prompt-content-header'],
            '!pl-5',
          )}
          childNodeWrapClassName={classNames(
            s['child-block'],
            isSingle && '!p-0',
          )}
          showBorderTopRadius
          showBottomBorder
          defaultExpand
          header={I18n.t('bot_persona_and_prompt')}
          actionButton={actionButton}
          collapsible={isMulti}
        >
          <PromptEditorEntry
            isSingle={isSingle}
            className={s['bot-debug-system']}
            editorExtensions={editorExtensions}
          />
          {children}
        </ToolContentBlock>
      </div>
    </>
  );
};
