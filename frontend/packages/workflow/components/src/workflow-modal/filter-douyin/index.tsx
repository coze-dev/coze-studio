import { type FC, useContext } from 'react';

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Banner, Select } from '@coze-arch/coze-design';

import WorkflowModalContext from '../workflow-modal-context';
import {
  WORKFLOW_LIST_STATUS_ALL,
  type WorkFlowModalModeProps,
  type WorkflowModalState,
} from '../type';
import { CreateWorkflowBtn } from '../sider/create-workflow-btn';
import styles from '../index.module.less';
import { useWorkflowSearch } from '../hooks/use-workflow-search';
import {
  ModalI18nKey,
  WORKFLOW_MODAL_I18N_KEY_MAP,
} from '../hooks/use-i18n-text';
import { statusOptions } from '../constants';

const getStatusOptions = (showAll?: boolean) =>
  showAll
    ? statusOptions
    : statusOptions.filter(item => item.value !== WORKFLOW_LIST_STATUS_ALL);

const WorkflowModalFilterForDouyin: FC<WorkFlowModalModeProps> = props => {
  const context = useContext(WorkflowModalContext);
  const searchNode = useWorkflowSearch();

  if (!context) {
    return null;
  }

  const { updateModalState, flowMode } = context;
  const { status } = context.modalState;
  const { filterOptionShowAll = false } = props;

  const title = I18n.t(
    WORKFLOW_MODAL_I18N_KEY_MAP[flowMode]?.[
      ModalI18nKey.Title
    ] as I18nKeysNoOptionsType,
  );

  return (
    <div className="w-full">
      <div className="flex items-center w-full justify-between mt-[-4px]">
        <div className="flex items-center gap-[24px]">
          <div className={styles.titleForAvatar}>{title}</div>

          <Select
            insetLabel={I18n.t('publish_list_header_status')}
            showClear={false}
            value={status}
            optionList={getStatusOptions(filterOptionShowAll)}
            onChange={value => {
              updateModalState({
                status: value as WorkflowModalState['status'],
              });
            }}
          />
        </div>

        <div className="flex items-center gap-[12px] mr-[12px]">
          <div className="w-[208px]">{searchNode}</div>

          <div className="flex items-center">
            <CreateWorkflowBtn
              onCreateSuccess={props.onCreateSuccess}
              nameValidators={props.nameValidators}
            />
          </div>
        </div>
      </div>

      <Banner
        type="info"
        className="mt-[16px] pt-[7px] pb-[7px] rounded-lg"
        description={I18n.t('dy_avatar_add_workflow_limit')}
        closeIcon={null}
      />
    </div>
  );
};

export { WorkflowModalFilterForDouyin };
