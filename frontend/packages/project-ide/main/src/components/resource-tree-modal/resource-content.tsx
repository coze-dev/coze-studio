import { ErrorBoundary } from 'react-error-boundary';
import React, { useCallback } from 'react';

import { LinkNode } from '@coze-project-ide/biz-workflow';
import { ResourceTree, isDepEmpty } from '@coze-common/resource-tree';
import { I18n } from '@coze-arch/i18n';
import { type DependencyTree } from '@coze-arch/bot-api/workflow_api';
import {
  IconCozIllusNone,
  IconCozIllusError,
} from '@coze/coze-design/illustrations';
import { IconCozRefresh } from '@coze/coze-design/icons';
import { EmptyState } from '@coze/coze-design';

import s from './styles.module.less';

export const ResourceContent = ({
  data,
  spaceId,
  projectId,
  onRetry,
}: {
  data: DependencyTree;
  spaceId: string;
  projectId: string;
  onRetry: () => void;
}) => {
  const isEmpty = isDepEmpty(data);
  const renderLinkNode = useCallback(
    extraInfo => (
      <LinkNode extraInfo={extraInfo} spaceId={spaceId} projectId={projectId} />
    ),
    [spaceId, projectId],
  );
  if (isEmpty) {
    return (
      <EmptyState
        size="full_screen"
        icon={<IconCozIllusNone />}
        title={I18n.t('reference_graph_tip_current_workflow_has_no_reference')}
      />
    );
  }
  return (
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
          buttonText={I18n.t('reference_graph_tip_fail_to_load_retry_needed')}
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
  );
};
