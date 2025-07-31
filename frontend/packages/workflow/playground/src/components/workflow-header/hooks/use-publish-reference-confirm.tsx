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

/**
 * Check the reference relationship before the process is published
 */
import { isEmpty } from 'lodash-es';
import { Modal } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import { PublishConfirmContent } from '../../workflow-references/publish-confirm-content';
import { useWorkflowReferences } from '../../../hooks/use-workflow-references';

export const usePublishReferenceConfirm = () => {
  const { refetchReferences } = useWorkflowReferences();

  const publishUpdateReferencedConfirm = async () => {
    const { data } = await refetchReferences();

    if (!data || isEmpty(data.workflowList)) {
      return true;
    }

    return new Promise(resolve => {
      Modal.confirm({
        width: 560,
        icon: null,
        title: I18n.t('card_builder_builtinLogic_confirm_message'),
        content: <PublishConfirmContent {...data} />,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        okText: I18n.t('Confirm'),
        cancelText: I18n.t('Cancel'),
      });
    });
  };

  return {
    publishUpdateReferencedConfirm,
  };
};
