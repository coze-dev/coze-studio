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
/** 一些特化节点的文案 */
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
  /** 是否渲染原始输出 */
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
