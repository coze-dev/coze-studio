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

import { useState, type FC } from 'react';
import { I18n } from '@coze-arch/i18n';
import { type ButtonProps } from '@coze-arch/coze-design';
import { IconCozDatabase } from '@coze-arch/coze-design/icons';
import { OperateTypeEnum, ToolPane } from '@coze-agent-ide/debug-tool-list';

import { ExternalKnowledgeModal } from './external-knowledge-modal';

export interface ExternalKnowledgeToolPaneProps {
  visible?: boolean;
  externalKnowledge?: any;
  onExternalKnowledgeChange?: (knowledge: any) => void;
}

export const ExternalKnowledgeToolPane: FC<ExternalKnowledgeToolPaneProps> = ({
  visible = true,
  externalKnowledge,
  onExternalKnowledgeChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ToolPane
        visible={visible}
        itemKey="external_knowledge"
        operateType={OperateTypeEnum.NORMAL}
        title={I18n.t('external_knowledge_menu_title', {}, '外部知识库')}
        icon={<IconCozDatabase />}
        onEntryButtonClick={() => {
          setModalVisible(true);
        }}
        buttonProps={
          {
            'data-testid': 'bot-external-knowledge-btn',
          } as unknown as ButtonProps
        }
      />
      
      <ExternalKnowledgeModal
        visible={modalVisible}
        externalKnowledge={externalKnowledge}
        onClose={() => setModalVisible(false)}
        onChange={onExternalKnowledgeChange}
      />
    </>
  );
};