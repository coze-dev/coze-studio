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

/* eslint-disable @coze-arch/max-line-per-function */

import { useEffect, type FC, useRef } from 'react';

import classNames from 'classnames';
import { useInViewport, useUpdateEffect } from 'ahooks';
import {
  OperateType,
  type VersionMetaInfo,
  withQueryClient,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozFocus } from '@coze-arch/coze-design/icons';
import { EmptyState, Spin, Timeline, Typography } from '@coze-arch/coze-design';

import { useVersionHistory } from './use-version-history';
import { type WorkflowCommitListProps } from './type';
import { CommitItem } from './commit-item';

import css from './history-list.module.less';

const { Text } = Typography;

const currentKey = 'current';

const WorkflowCommitListComp: FC<WorkflowCommitListProps> = withQueryClient(
  ({
    className,
    spaceId,
    value,
    workflowId,
    readonly,
    type,
    enablePublishPPE,
    showCurrent,
    onItemClick,
    onPublishPPE,
    onResetToCommit,
    onShowCommit,
    onCurrentClick,
    hideCommitId,
  }) => {
    const {
      queryParams,
      updatePageParam,
      list,
      loadingStatus,
      fetchNextPage,
      isFetching,
      hasNextPage,
    } = useVersionHistory({
      spaceId,
      workflowId,
      type,
      enabled: true,
    });

    /** Scroll container */
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    /** Monitor the bottom observer */
    const intersectionObserverDom = useRef<HTMLDivElement>(null);
    // Is it bottoming out?
    const [inViewPort] = useInViewport(intersectionObserverDom, {
      root: () => scrollContainerRef.current,
      threshold: 0.8,
    });

    useEffect(() => {
      updatePageParam({ type });
    }, [type, updatePageParam]);

    // The first effect is not executed, this is the effect of switching the state
    useUpdateEffect(() => {
      // When the filter item changes, return to the top
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: 0,
        });
      }
    }, [queryParams]);

    // Get next page logic
    useEffect(() => {
      if (!inViewPort) {
        return;
      }

      if (loadingStatus !== 'success' || isFetching || !hasNextPage) {
        return;
      }

      fetchNextPage();
    }, [inViewPort, loadingStatus, isFetching, hasNextPage]);

    if (loadingStatus === 'error') {
      return (
        <div className="flex justify-center items-center min-h-[300px] w-full">
          <EmptyState
            title="An error occurred"
            description="Please try again later"
          />
        </div>
      );
    }

    if (loadingStatus === 'pending') {
      return (
        <Spin wrapperClassName="flex justify-center items-center min-h-[300px] w-full" />
      );
    }

    if (loadingStatus === 'success' && !list.length && !showCurrent) {
      return (
        <div className="flex justify-center items-center min-h-[300px] w-full">
          <EmptyState
            title={I18n.t('query_data_empty')}
            description={I18n.t('bwc_no_version_record')}
          />
        </div>
      );
    }

    const timelineType = (data: VersionMetaInfo, index) => {
      // PPE history, online activation
      if (type === OperateType.PubPPEOperate) {
        return !data.offline ? 'ongoing' : 'default';
      }

      // Submission history and release history, latest activations
      return index === 0 ? 'ongoing' : 'default';
    };

    return (
      <div ref={scrollContainerRef} className={className}>
        <Timeline>
          {showCurrent ? (
            <Timeline.Item
              className={css['history-item']}
              type="warning"
              dot={value === currentKey ? <IconCozFocus /> : undefined}
            >
              <div
                className={classNames(
                  'relative top-[-8px] p-2 rounded-mini',
                  value === currentKey
                    ? 'coz-mg-hglt'
                    : 'hover:coz-mg-secondary',
                  !readonly && 'cursor-pointer',
                )}
                onClick={() => onCurrentClick?.(currentKey)}
              >
                <Text className="font-bold">
                  {I18n.t('devops_publish_multibranch_Current')}
                </Text>
              </div>
            </Timeline.Item>
          ) : null}
          {list.map((item, index) => (
            <Timeline.Item
              className={css['history-item']}
              key={item.commit_id}
              type={timelineType(item, index)}
              dot={value === item.commit_id ? <IconCozFocus /> : undefined}
            >
              <CommitItem
                className="relative top-[-8px]"
                data={item}
                readonly={readonly}
                isActive={value === item.commit_id}
                enablePublishPPE={enablePublishPPE}
                onClick={!readonly ? onItemClick : undefined}
                onPublishPPE={onPublishPPE}
                onResetToCommit={onResetToCommit}
                onShowCommit={onShowCommit}
                hideCommitId={hideCommitId}
              />
            </Timeline.Item>
          ))}
        </Timeline>
        {hasNextPage ? (
          <div
            className="flex justify-center py-1"
            ref={intersectionObserverDom}
          >
            <Spin spinning wrapperClassName="mr-2" />
            <div className="coz-fg-primary">{I18n.t('Loading')}</div>
          </div>
        ) : null}
      </div>
    );
  },
);

export const WorkflowCommitList = Object.assign(WorkflowCommitListComp, {
  Item: CommitItem,
});
