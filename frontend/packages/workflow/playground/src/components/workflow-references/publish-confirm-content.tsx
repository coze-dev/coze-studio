/**
 * 流程发布前检查引用关系确认
 */
import { type FC } from 'react';

import { type Workflow } from '@coze-workflow/base/api';
import { Table } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import styles from './publish-confirm-content.module.less';

interface PublishConfirmContentProps {
  workflowList: Workflow[];
}

export const ReferenceTable = ({ num }: { num: number }) => (
  <div className={styles.referenceTable}>
    <Table
      pagination={false}
      dataSource={[
        {
          relationship: I18n.t('workflow_detail_node_workflows_referencing', {
            number: num,
          }),
          impact: I18n.t('workflow_detail_node_workflows_referencing_invalid'),
        },
      ]}
      columns={[
        {
          title: I18n.t(
            'workflow_detail_node_workflows_referencing_relationship',
          ),
          dataIndex: 'relationship',
        },
        {
          title: I18n.t('workflow_detail_node_workflows_referencing_impact'),
          dataIndex: 'impact',
        },
      ]}
    />
  </div>
);

export const PublishConfirmContent: FC<PublishConfirmContentProps> = props => {
  const { workflowList } = props;
  return (
    <div>
      <div
        style={{
          margin: '24px 0 16px 0',
          color: 'var(--semi-color-text-2)',
        }}
      >
        {I18n.t('workflow_detail_node_workflows_referencing_update')}
      </div>
      <ReferenceTable num={workflowList.length} />
    </div>
  );
};
