import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Spin } from '@coze/coze-design';

import { ProblemGroup } from '../problem-group';
import { type ProblemItem } from '../../types';
import { useProblems } from '../../hooks/use-problems';
import { BasePanel } from '../../../../components';

import styles from './problem-panel.module.less';

interface ProblemPanelProps {
  maxHeight: number;
  workflowId: string;
  onScroll: (p: ProblemItem) => void;
  onJump: (p: ProblemItem, workflowId: string) => void;
  onClose: () => void;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  maxHeight,
  workflowId,
  onScroll,
  onJump,
  onClose,
}) => {
  const { problemsV2, validating } = useProblems(workflowId);

  return (
    <BasePanel
      header={
        <div className={styles['panel-title']}>
          {I18n.t('card_builder_check_title')}
          {validating ? (
            <div className={styles.checking}>
              <Spin size="small" />
              {I18n.t('wf_testrun_problems_loading')}
            </div>
          ) : null}
        </div>
      }
      height={300}
      resizable={{
        min: 300,
        max: maxHeight,
      }}
      onClose={onClose}
      className={styles['base-panel']}
    >
      <ProblemGroup {...problemsV2} onScroll={onScroll} onJump={onJump} />
    </BasePanel>
  );
};
