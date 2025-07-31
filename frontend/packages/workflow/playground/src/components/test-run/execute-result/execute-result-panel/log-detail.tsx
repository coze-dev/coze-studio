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
import React, { useMemo, useState, useCallback } from 'react';

import { nanoid } from 'nanoid';
import { pick, isNil, isObject, isEmpty } from 'lodash-es';
import cls from 'classnames';
import { type NodeResult } from '@coze-workflow/base/api';
import { WorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { Icon } from '@coze-arch/bot-semi';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { JsonViewer } from '@coze-common/json-viewer';

import {
  generateLog,
  isConditionLog,
  isTreeLog,
  type Log as LogType,
} from '../../utils/generate-log';
import { LogNavigationV2 } from '../../log-navigation-v2';
import { LogDetailWrap } from '../../log-detail/log-detail-wrap';
import { ImgLogV2 } from '../../img-log-v2';
import { ConditionLog } from '../../condition-log';
import { useExecStateEntity } from '../../../../hooks';
import { EmptyIcon } from './empty-image';

import styles from './index.module.less';

/**
 * Differentiate between different usage scenarios
 * - Do not pass the default is the result panel of the node
 * - resultSideSheet: use from execute-result-side-sheet
 */
type LogDetailScene = 'resultSideSheet' | undefined;

const LogField: React.FC<{
  log: LogType;
  secondary?: boolean;
  scene?: LogDetailScene;
}> = ({ log, secondary, scene }) => {
  if (isConditionLog(log)) {
    return (
      <>
        {log.conditions.map((branch, idx) => (
          <LogDetailWrap
            label={`${I18n.t('workflow_detail_condition_condition')} ${
              idx + 1
            }`}
            copyTooltip={I18n.t('workflow_detail_title_testrun_copyinput')}
            source={{
              name: branch.name,
              logic: branch.logic,
              conditions: branch.conditions.map(condition =>
                pick(condition, ['left', 'right', 'oprator']),
              ),
            }}
          >
            {branch.conditions.map((condition, cIdx) => (
              <>
                <ConditionLog condition={condition} />
                {cIdx < branch.conditions.length - 1 && (
                  <div className="my-2 text-center">{branch.logicData}</div>
                )}
              </>
            ))}
          </LogDetailWrap>
        ))}
      </>
    );
  }
  if (isTreeLog(log)) {
    return (
      <LogDetailWrap label={log.label} copyable={false}>
        {log.children.map((l, idx) => (
          <LogField key={idx} log={l} secondary={true} scene={scene} />
        ))}
      </LogDetailWrap>
    );
  }

  const disableCopy =
    isNil(log.data) || (isObject(log.data) && isEmpty(log.data));

  return (
    <LogDetailWrap
      label={log.label}
      source={log.source}
      copyable={!disableCopy}
      copyTooltip={log.copyTooltip}
      size={secondary ? 'secondary' : 'primary'}
      mockInfo={log.mockInfo}
    >
      <JsonViewer
        data={log.data}
        className={cls({
          [styles['flow-side-sheet-json-viewer']]: scene === 'resultSideSheet',
        })}
      />
    </LogDetailWrap>
  );
};

export const LogDetail: React.FC<{
  result: NodeResult;
  node?: FlowNodeEntity;
  scene?: LogDetailScene;
}> = ({ result, node, scene }) => {
  const { batch, isBatch, nodeId } = result;

  /** Start from 0 */
  const [page, setPage] = useState(0);

  // Whether the batch list is empty (after filtering)
  const [isBatchEmpty, setIsBatchEmpty] = useState(false);

  const [refreshKey, refresh] = useState(nanoid());

  // Get Testrun UI Data
  const entity = useExecStateEntity();
  const wrappedNode = useMemo(
    () => (node ? new WorkflowNode(node) : null),
    [node],
  );

  const errorSetting = entity.getNodeErrorSetting(nodeId || '');

  // Deserialize to get all iterated arrays
  const batchData: NodeResult[] = useMemo(() => {
    if (!isBatch) {
      return [];
    }
    const data = safeJSONParse(batch, []);
    return (Array.isArray(data) ? data : []).map(i => {
      if (!i) {
        return i;
      }
      return {
        ...i,
        /** The tag is not included in the batch data, and it is added manually. */
        isBatch: true,
      };
    });
  }, [isBatch, batch]);

  // current execution log
  const current: NodeResult = useMemo(() => {
    if (!isBatch) {
      return result;
    }
    return batchData[page];
  }, [page, isBatch, batchData, result]);

  // Get log classification data (input, output, batchValue, etc.)
  const { logs } = useMemo(
    () => generateLog(current, wrappedNode?.data),
    [current, wrappedNode],
  );

  // log details
  const logFields = useMemo(() => {
    // When batch processing, and the result list is empty
    if (isBatch && isBatchEmpty) {
      return (
        <div className={cls(styles['flow-test-run-empty-wrapper'])}>
          <p>
            <Icon svg={<EmptyIcon />} />
          </p>
          <p className="mt-[16px] text-xl font-semibold">
            {I18n.t('workflow_batch_no_failed_entries')}
          </p>
        </div>
      );
    }
    return (
      <>
        {logs.map((log, idx) => (
          <LogField key={idx} log={log} scene={scene} />
        ))}
        {current ? <ImgLogV2 nodeId={nodeId} testRunResult={current} /> : null}
      </>
    );
  }, [logs, isBatch, current, isBatchEmpty]);

  const handleFilterChange = useCallback(
    (_isEmpty: boolean, showError: boolean, needUpdate = true) => {
      if (needUpdate) {
        // If you need to use backend storage, just open the following statement (the latter statement needs to be deleted).
        // textRunUIData.showError = showError;
        entity.setNodeErrorSetting(nodeId || '', { showError });
        refresh(nanoid());
      }
      setIsBatchEmpty(_isEmpty);
    },
    [nodeId],
  );

  return (
    <>
      {/* paging */}
      {isBatch ? (
        <LogDetailWrap label={''} copyable={false}>
          <LogNavigationV2
            key={refreshKey}
            value={page}
            batch={batchData}
            onChange={setPage}
            showError={errorSetting?.showError ?? false}
            onFilterChange={handleFilterChange}
          />
        </LogDetailWrap>
      ) : null}

      {logFields}
    </>
  );
};
