/**
 * 流程发布前检查引用关系确认
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
