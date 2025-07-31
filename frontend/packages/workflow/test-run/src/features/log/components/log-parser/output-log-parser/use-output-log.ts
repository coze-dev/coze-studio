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

import { useState, useMemo } from 'react';

import { toString } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { type OutputLog } from '../../../types';
import { useTestRunReporterService } from '../../../../../hooks';
import { isDifferentOutput } from './is-different-output';

const CODE_TEXT = {
  tabLabel: I18n.t('workflow_detail_testrun_panel_raw_output_code'),
};
const LLM_TEXT = {
  tabLabel: I18n.t('workflow_detail_testrun_panel_raw_output_llm'),
};
const DEFAULT_TEXT = {
  tabLabel: I18n.t('workflow_detail_testrun_panel_raw_output'),
};
/** Copywriting for some specialized nodes */
const TEXT = {
  Code: CODE_TEXT,
  LLM: LLM_TEXT,
};

export enum TabValue {
  Output,
  RawOutput,
}

export const useOutputLog = (log: OutputLog) => {
  const [tab, setTab] = useState(TabValue.Output);
  const reporter = useTestRunReporterService();
  /** Whether to render the original output */
  const showRawOutput = useMemo(() => {
    const [result, err] = isDifferentOutput({
      nodeOutput: log.data,
      rawOutput: log.rawOutput?.data,
      isLLM: log.nodeType === 'LLM',
    });
    reporter.logRawOutputDifference({
      is_difference: result,
      error_msg: err ? toString(err) : undefined,
      log_node_type: log.nodeType,
    });
    return result;
  }, [log]);

  const text = useMemo(() => TEXT[log.nodeType] || DEFAULT_TEXT, [log]);

  const options = useMemo(
    () => [
      {
        value: TabValue.Output,
        label: I18n.t('workflow_detail_testrun_panel_final_output2'),
      },
      {
        value: TabValue.RawOutput,
        label: text.tabLabel,
      },
    ],
    [text],
  );

  const data = useMemo(
    () => (tab === TabValue.Output ? log.data : log.rawOutput?.data),
    [tab, log],
  );

  return {
    showRawOutput,
    options,
    text,
    tab,
    data,
    setTab,
  };
};
