import React from 'react';

import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import { IconButton, CozAvatar } from '@coze-arch/coze-design';

import { WorkflowInfo } from '../workflow-header-info';
import { useGlobalState } from '../../hooks';
import { getWorkflowHeaderTestId } from './utils';
import { PublishButton } from './components/publish-button-v2';
import {
  CollaboratorsButton,
  SubmitButton,
  DuplicateButton,
  HistoryButton,
  CreditButton,
  ReferenceButton,
} from './components';

import styles from './index.module.less';

const WorkFlowHeader: React.FC = () => {
  const globalState = useGlobalState();
  const { readonly, info, playgroundProps, workflowId } = globalState;

  return (
    <div className={styles.container}>
      <div
        className={styles.left}
        data-testid={getWorkflowHeaderTestId('info')}
      >
        <IconButton
          icon={<IconCozArrowLeft />}
          color="secondary"
          data-testid={getWorkflowHeaderTestId('back')}
          onClick={() => {
            playgroundProps.onBackClick?.(globalState);
          }}
        />

        <CozAvatar src={info.url || ''} type="platform" alt="Avatar" />

        <WorkflowInfo />
      </div>

      <div className={styles.right}>
        {/** The community version does not currently provide resource tree modal. Will allow for future expansion. */}
        {IS_OPEN_SOURCE ? null : <ReferenceButton workflowId={workflowId} />}

        {/** The community version does not currently provide features such as billing, collaboration, history, and workspaces to allow for future expansion. */}
        {IS_OPEN_SOURCE ? null : (
          <>
            {!readonly && <CreditButton />}

            <HistoryButton />

            <CollaboratorsButton />

            <SubmitButton />
          </>
        )}

        <PublishButton />

        <DuplicateButton mode={readonly ? 'button' : 'icon'} />
      </div>
    </div>
  );
};

export default React.memo(WorkFlowHeader);
