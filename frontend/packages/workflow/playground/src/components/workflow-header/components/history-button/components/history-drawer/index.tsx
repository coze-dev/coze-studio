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

/* eslint-disable @coze-arch/no-deep-relative-import */
import { type FC, useState, useEffect, useMemo } from 'react';

import { WorkflowCommitList } from '@coze-workflow/components';
import { OperateType } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import {
  Button,
  IconButton,
  Typography,
  SideSheet,
  Select,
} from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { IconCloseNoCycle } from '@coze-arch/bot-icons';
import { useNavigate } from 'react-router-dom';

import { useFloatLayoutService } from '@/hooks';

import { getWorkflowOuterSideSheetHolder } from '../../../../../../utils/get-workflow-outer-side-sheet-holder';
import { useGlobalState } from '../../../../../../hooks';
import { useCommitAction } from './use-commit-action';

interface HistoryDrawerProps {
  spaceId: string;
  workflowId: string;
  visible;
  value?: string;
  enablePublishPPE?: boolean;
  onClose?: () => void;
}

const defaultTabOptions = [
  {
    value: OperateType.SubmitPublishPPEOperate,
    label: I18n.t('query_status_all'),
  },
  {
    value: OperateType.SubmitOperate,
    label: I18n.t('workflow_publish_multibranch_submitted_title'),
  },
  {
    value: OperateType.PubPPEOperate,
    label: I18n.t('bmv_ppe_lane'),
  },
  {
    value: OperateType.PublishOperate,
    label: I18n.t('workflow_publish_multibranch_published_title'),
  },
];

const { Title } = Typography;

const defaultActiveItem = 'current';

export const HistoryDrawer: FC<HistoryDrawerProps> = ({
  spaceId,
  workflowId,
  visible,
  onClose,
  enablePublishPPE,
}) => {
  const globalState = useGlobalState();
  const navigate = useNavigate();
  const flowLayoutService = useFloatLayoutService();

  const {
    resetToCommit,
    viewCommit,
    publishPPE,
    showCurrent,
    viewCommitNewPage,
  } = useCommitAction();
  const tabOptions = useMemo(() => {
    if (enablePublishPPE) {
      return defaultTabOptions;
    }

    return defaultTabOptions.filter(
      item => item.value !== OperateType.PubPPEOperate,
    );
  }, [enablePublishPPE]);
  const [optType, setOptType] = useState(tabOptions[0].value);
  const [activeItem, setActiveItem] = useState(defaultActiveItem);

  /**
   * Whether to display the current version
   */
  const showLatest = useMemo(
    () =>
      optType === OperateType.SubmitOperate ||
      optType === OperateType.SubmitPublishPPEOperate,
    [optType],
  );

  const SideSheetTitle = () => (
    <div className="flex">
      <Title heading={5} className="flex-1">
        {I18n.t('workflow_publish_multibranch_history')}
      </Title>

      <IconButton
        icon={<IconCloseNoCycle />}
        onClick={() => {
          if (activeItem !== 'current') {
            showCurrent();
          }
          onClose?.();
        }}
      />
    </div>
  );

  const goPublish = () => {
    navigate(`/space/${spaceId}/workflow/${workflowId}/publish`, {
      replace: true,
    });
  };

  useEffect(() => {
    if (!visible) {
      setActiveItem(defaultActiveItem);
      setOptType(tabOptions[0].value);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    sendTeaEvent(EVENT_NAMES.workflow_history_show, {
      workspace_id: spaceId,
      workflow_id: workflowId,
      from: 0,
      channel: optType,
    });
  }, [visible, optType]);

  return (
    <SideSheet
      width={400}
      visible={visible}
      getPopupContainer={getWorkflowOuterSideSheetHolder}
      title={<SideSheetTitle />}
      // During the animation, the scrollWidth of the parent container will be stretched open, resulting in the scrollbar. Trigger a recalculation after the animation to make the scrollbar disappear
      afterVisibleChange={() => requestAnimationFrame(() => undefined)}
      closable={false}
      mask={false}
      maskClosable={false}
      footer={
        enablePublishPPE ? (
          <Button
            className="w-full"
            color="highlight"
            onClick={() => {
              sendTeaEvent(EVENT_NAMES.workflow_pre_release_ppe, {
                workspace_id: globalState.spaceId,
                workflow_id: globalState.workflowId,
                channel: 1,
              });
              goPublish();
            }}
          >
            {I18n.t('bwc_view_multiple_environments')}
          </Button>
        ) : undefined
      }
    >
      <Select
        optionList={tabOptions}
        value={optType}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          setOptType(e);
        }}
        className="w-full"
      />
      <WorkflowCommitList
        className="mt-3"
        showCurrent={showLatest}
        value={activeItem}
        enablePublishPPE={enablePublishPPE}
        spaceId={spaceId}
        workflowId={workflowId}
        type={optType}
        hideCommitId={!globalState.isDevSpace}
        onResetToCommit={async item => {
          const isSuccess = await resetToCommit(item);
          if (isSuccess) {
            onClose?.();
          }
        }}
        onShowCommit={viewCommitNewPage}
        onPublishPPE={item => {
          sendTeaEvent(EVENT_NAMES.workflow_pre_release_ppe, {
            workspace_id: globalState.spaceId,
            workflow_id: globalState.workflowId,
            channel: 2,
          });
          publishPPE(item);
        }}
        onCurrentClick={key => {
          if (activeItem === key) {
            return;
          }

          setActiveItem(key);
          showCurrent();
          flowLayoutService.closeAll();
        }}
        onItemClick={item => {
          if (activeItem === item.commit_id) {
            return;
          }

          setActiveItem(item.commit_id || '');
          viewCommit(item);
          flowLayoutService.closeAll();
        }}
      />
    </SideSheet>
  );
};

export function useHistoryDrawer({
  ...props
}: Omit<HistoryDrawerProps, 'visible' | 'onClose'>) {
  const [visible, setVisible] = useState(false);

  const node = (
    <HistoryDrawer
      visible={visible}
      onClose={() => setVisible(false)}
      {...props}
    />
  );
  return {
    node,
    show: () => setVisible(true),
    close: () => setVisible(false),
  };
}
