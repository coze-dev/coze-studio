import { ErrorBoundary } from 'react-error-boundary';
import { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozIllusError } from '@coze/coze-design/illustrations';
import {
  IconCozInfoCircle,
  IconCozCross,
  IconCozRefresh,
} from '@coze/coze-design/icons';
import { Modal, Tooltip, Button, EmptyState } from '@coze/coze-design';
import { type DependencyTree } from '@coze-arch/bot-api/workflow_api';
import { ResourceTree } from '@coze-common/resource-tree';

import { TooltipContent } from './tooltip-content';
import { LinkNode } from './link-node';

import s from './index.module.less';

export const ReferenceModal = ({
  modalVisible,
  data,
  spaceId,
  setModalVisible,
  onRetry,
}: {
  modalVisible: boolean;
  data: DependencyTree;
  spaceId: string;
  setModalVisible: (vis: boolean) => void;
  onRetry: () => void;
}) => {
  const handleClose = () => {
    setModalVisible(false);
  };
  const renderLinkNode = useCallback(
    extraInfo => <LinkNode extraInfo={extraInfo} spaceId={spaceId} />,
    [],
  );
  return (
    <Modal
      className={s.modal}
      visible={modalVisible}
      type="dialog"
      hasScroll={false}
    >
      <div className={s['modal-container']}>
        <div className={s['workflow-list']}>
          <div className={s['list-header-container']}>
            {I18n.t('reference_graph_modal_title')}
            <Tooltip theme="dark" content={<TooltipContent />}>
              <IconCozInfoCircle color="secondary" fontSize={16} />
            </Tooltip>
          </div>
        </div>
        <div className={s['resource-tree-container']}>
          <ErrorBoundary
            fallback={
              <EmptyState
                size="full_screen"
                icon={<IconCozIllusError />}
                title={I18n.t('reference_graph_tip_fail_to_load')}
                buttonProps={{
                  icon: <IconCozRefresh />,
                  color: 'primary',
                }}
                buttonText={I18n.t(
                  'reference_graph_tip_fail_to_load_retry_needed',
                )}
                onButtonClick={onRetry}
              />
            }
          >
            <ResourceTree
              className={s['resource-tree']}
              data={data}
              renderLinkNode={renderLinkNode}
            />
          </ErrorBoundary>
        </div>
        <Button
          className={s['close-icon']}
          color="secondary"
          size="large"
          onClick={handleClose}
        >
          <IconCozCross fontSize={20} />
        </Button>
      </div>
    </Modal>
  );
};
