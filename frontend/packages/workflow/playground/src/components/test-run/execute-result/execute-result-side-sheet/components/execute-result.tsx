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
import { useDeepCompareEffect } from 'ahooks';
import { NodeExeStatus } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';

import { useScrollToError } from '../hooks/use-scroll-to-error';
import { useNodeErrorList } from '../hooks/use-node-error-list';
import { useLineErrorList } from '../hooks/use-line-error-list';
import { LogDetail } from '../../execute-result-panel/log-detail';
import { useExecStateEntity } from '../../../../../hooks';
import { SystemError } from './system-error';
import { ErrorList } from './execute-error-list';
import { EmptyDisplay } from './empty-display';

export const ExecuteResult = () => {
  const execEntity = useExecStateEntity();

  const scrollToError = useScrollToError();

  const { nodeErrorList, hasNodeError } = useNodeErrorList();
  const { lineErrorList, hasLineError } = useLineErrorList();

  const firstError = nodeErrorList[0] || lineErrorList[0];

  const { systemError, isSingleMode } = execEntity.config;

  // Automatically locate the first error
  useDeepCompareEffect(() => {
    if (firstError && !isSingleMode) {
      scrollToError(firstError);
    }
  }, [firstError, isSingleMode]);

  const lastResult = execEntity.getEndNodeResult();

  const showResult = lastResult?.nodeStatus === NodeExeStatus.Success;

  const isEmpty = !lastResult && !hasNodeError && !hasLineError && !systemError;

  // When there is a node error, the system error will definitely be repeated with the node error, and it will not be displayed at this time.
  const showSystemError = !!systemError && !hasNodeError && !hasLineError;

  return (
    <div className="flex flex-col space-y-6 overflow-x-hidden h-full">
      {/* Single-node mode does not display results in the right panel*/}
      {isEmpty || isSingleMode ? (
        <EmptyDisplay />
      ) : (
        <>
          {showResult ? (
            <div>
              <LogDetail result={lastResult} scene="resultSideSheet" />
            </div>
          ) : null}

          {hasNodeError ? (
            <ErrorList
              nodeErrorList={nodeErrorList}
              title={I18n.t('workflow_running_results_error_node')}
            />
          ) : null}
          {hasLineError ? (
            <ErrorList
              nodeErrorList={lineErrorList}
              title={I18n.t('workflow_abnormal_connection')}
            />
          ) : null}

          {showSystemError ? <SystemError errorInfo={systemError} /> : null}
        </>
      )}
    </div>
  );
};
