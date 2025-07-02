import { isEmpty } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Banner } from '@coze-arch/coze-design';

import { useWorkflowReferences } from '../../hooks/use-workflow-references';
import { useGlobalState } from '../../hooks';

import styles from './index.module.less';
export const ModifyBanner = () => {
  const { readonly } = useGlobalState();

  const { references } = useWorkflowReferences();

  const showBanner = !readonly && !isEmpty(references?.workflowList);

  if (!showBanner) {
    return null;
  }

  return (
    <Banner
      type="info"
      icon={null}
      className={styles['modify-banner']}
      closeIcon={
        <div
          className={classNames(
            'flex items-center',
            'cursor-pointer space-x-2',
            'text-[#06070980]',
          )}
        >
          <div>{I18n.t('workflow_detail_edit_prompt_button')}</div>
          <IconCozCross />
        </div>
      }
      description={
        <div>{I18n.t('workflow_detail_sub_workflow_change_banner')}</div>
      }
    />
  );
};
