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

import React, { useMemo } from 'react';

import { isUndefined } from 'lodash-es';
import copy from 'copy-to-clipboard';
import { BottomPanel } from '@coze-workflow/test-run-shared';
import { I18n } from '@coze-arch/i18n';
import { type TraceFrontendSpan } from '@coze-arch/bot-api/workflow_api';
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import { Divider, IconButton, Toast, Typography } from '@coze-arch/coze-design';

import { StatusTag } from '../status-tag';
import { FocusButton } from '../focus-button';
import {
  formatDuration,
  getTokensFromSpan,
  getGotoNodeParams,
} from '../../utils';
import { type GotoParams } from '../../types';
import {
  MessagePanel,
  ObservationModules,
  type MessagePanelProps,
} from '../../observation-components';
import { PayBlocks } from './pay-block';

import styles from './trace-detail-panel.module.less';

const ResultViewer: React.FC<
  Omit<MessagePanelProps, 'i18nMapping'>
> = props => (
  <MessagePanel
    {...props}
    className={styles['json-viewer']}
    i18nMapping={
      {
        [ObservationModules.INPUT]: {
          title: I18n.t('workflow_detail_node_input'),
        },
        [ObservationModules.OUTPUT]: {
          title: I18n.t('workflow_detail_node_output'),
        },
      } as unknown as MessagePanelProps['i18nMapping']
    }
  />
);

interface TraceDetailPanelProps {
  span: TraceFrontendSpan;
  onClose: () => void;
  onGotoNode: (params: GotoParams) => void;
}

export const TraceDetailPanel: React.FC<TraceDetailPanelProps> = ({
  span,
  onClose,
  onGotoNode,
}) => {
  const pays = useMemo(() => {
    const temp = [
      {
        label: I18n.t('analytic_query_detail_key_latency'),
        value: span.duration
          ? formatDuration(span.duration as unknown as number)
          : '0ms',
      },
    ];
    const tokens = getTokensFromSpan(span);
    if (!isUndefined(tokens)) {
      temp.push({
        label: I18n.t('analytic_query_table_title_tokens'),
        value: `${tokens}`,
      });
    }
    return temp;
  }, [span]);

  const handleCopy = () => {
    try {
      copy(span.log_id || '');
      Toast.success({ content: I18n.t('copy_success'), showClose: false });
    } catch {
      Toast.error(I18n.t('copy_failed'));
    }
  };

  const handleScroll = () => {
    onGotoNode(getGotoNodeParams(span));
  };

  return (
    <BottomPanel
      header={I18n.t('workflow_running_results')}
      onClose={onClose}
      className={styles['trace-detail-panel']}
    >
      <div className={styles['trace-detail']}>
        <div className={styles['detail-title']}>
          <Typography.Text strong>{span.alias_name}</Typography.Text>
          <StatusTag status={span.status_code} />
          <FocusButton span={span} onClick={handleScroll} />
        </div>
        <PayBlocks options={pays} />
        {span.log_id ? (
          <div className={styles['log-id']}>
            <Typography.Text type="secondary" size="small">
              LogId: {span.log_id}
            </Typography.Text>
            <IconButton
              icon={<IconCozCopy />}
              size="mini"
              onClick={handleCopy}
              color="secondary"
            />
          </div>
        ) : null}
        <Divider margin={16} />
        {span.input?.content ? (
          <ResultViewer
            content={span.input?.content}
            category={ObservationModules.INPUT}
            jsonViewerProps={{
              displayDataTypes: false,
            }}
          />
        ) : null}
        {span.output?.content ? (
          <ResultViewer
            content={span.output?.content}
            category={ObservationModules.OUTPUT}
            jsonViewerProps={{
              displayDataTypes: false,
            }}
          />
        ) : null}
      </div>
    </BottomPanel>
  );
};
