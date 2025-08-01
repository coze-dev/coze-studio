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
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { OperateTypeEnum, ToolPane } from '@coze-agent-ide/debug-tool-list';

import { useEvaluationPanelStore } from '@/store/evaluation-panel';

import { useDebugStore } from '../../store/debug-panel';

export const BotDebugToolPane: React.FC = () => {
  const { isDebugPanelShow, setIsDebugPanelShow, setCurrentDebugQueryId } =
    useDebugStore();
  const { setIsEvaluationPanelVisible } = useEvaluationPanelStore();
  return (
    <ToolPane
      visible={true}
      itemKey={'key_debug'}
      title={I18n.t('debug_btn')}
      operateType={OperateTypeEnum.CUSTOM}
      icon={(<IconCozDebug />) as React.ReactNode}
      customShowOperateArea={isDebugPanelShow}
      beforeVisible={async () => {
        await sendTeaEvent(EVENT_NAMES.open_debug_panel, {
          path: 'preview_debug',
        });
        setCurrentDebugQueryId('');
        if (!isDebugPanelShow) {
          setIsEvaluationPanelVisible(false);
        }
        setIsDebugPanelShow(!isDebugPanelShow);
      }}
    />
  );
};
