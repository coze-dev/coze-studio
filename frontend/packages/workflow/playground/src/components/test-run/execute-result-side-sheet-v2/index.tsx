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

import { useDeepCompareEffect } from 'ahooks';
import { I18n } from '@coze-arch/i18n';

import { useScrollToError } from '../execute-result/execute-result-side-sheet/hooks/use-scroll-to-error';
import { useNodeErrorList } from '../execute-result/execute-result-side-sheet/hooks/use-node-error-list';
import { useLineErrorList } from '../execute-result/execute-result-side-sheet/hooks/use-line-error-list';
import { EmptyDisplay } from '../execute-result/execute-result-side-sheet/components/empty-display';
import { CommonSideSheetHeaderV2 } from '../common-side-sheet-v2';
import { ErrorList } from './execute-error-list';

export const ExecuteResultSideSheetV2 = () => {
  const { nodeErrorList, hasNodeError } = useNodeErrorList();
  const { lineErrorList, hasLineError } = useLineErrorList();
  const scrollToError = useScrollToError();

  const firstError = nodeErrorList[0] || lineErrorList[0];

  const isEmpty = !hasNodeError && !hasLineError;

  useDeepCompareEffect(() => {
    if (firstError) {
      scrollToError(firstError);
    }
  }, [firstError]);

  return (
    <div className="w-full flex flex-col">
      <CommonSideSheetHeaderV2>
        {I18n.t('workflow_running_results')}
      </CommonSideSheetHeaderV2>
      <div className="flex-1 overflow-y-auto p-[16px]">
        {isEmpty ? (
          <EmptyDisplay />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
