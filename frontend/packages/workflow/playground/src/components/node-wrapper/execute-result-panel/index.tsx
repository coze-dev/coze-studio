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

import React, { useCallback } from 'react';

import copy from 'copy-to-clipboard';
import classNames from 'classnames';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { DEFAULT_NODE_META_PATH } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { UIIconButton } from '@coze-arch/bot-semi';
import { IconCopy, IconWorkflowRunResultClose } from '@coze-arch/bot-icons';
import { CustomError } from '@coze-arch/bot-error';
import { Toast, Tooltip } from '@coze-arch/coze-design';

import { useExecStateEntity } from '../../../hooks';

import styles from './index.module.less';

type ExecuteResultPanelProps = React.PropsWithChildren<{
  id: string;
  node: FlowNodeEntity;
  showResult: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}>;

/**
 * raw_output could be a JSON string or a native string
 */
const getSafeOutput = (
  type?: StandardNodeType,
  output?: string,
  rawOutput?: string,
  errorInfo?: string,
  // eslint-disable-next-line max-params
) => {
  let safeOutput = safeJSONParse(output, output) || {};
  // The LLM CODE node needs to use the output package separately
  if (type === StandardNodeType.LLM || type === StandardNodeType.Code) {
    safeOutput = {
      output: safeOutput,
    };
    if (safeOutput && rawOutput) {
      safeOutput.raw_output = safeJSONParse(rawOutput, rawOutput);
    }
  }
  if (errorInfo) {
    safeOutput.errorInfo = errorInfo;
  }
  return safeOutput;
};

const JSON_STRINGIFY_FORMAT_CODE = 2;

export default function ExecuteResultPanel({
  id,
  node,
  showResult,
  onClose,
  className,
  style,
  onClick,
}: ExecuteResultPanelProps) {
  const entity = useExecStateEntity();

  const executeResult = entity.getNodeExecResult(id);
  const type = node.flowNodeType as StandardNodeType;
  const formData = node.getData(FlowNodeFormData);
  const title = formData?.formModel.getFormItemValueByPath(
    node.getNodeMeta().nodeMetaPath || DEFAULT_NODE_META_PATH,
  )?.title;

  const safeOutput = getSafeOutput(
    type,
    executeResult?.output,
    executeResult?.raw_output,
    executeResult?.errorInfo,
  );

  const onCopy = useCallback((text: string) => {
    const res = copy(text);
    if (!res) {
      throw new CustomError(REPORT_EVENTS.parmasValidation, 'empty copy');
    }
    Toast.success({
      content: I18n.t('copy_success'),
      showClose: false,
    });
  }, []);

  const ShowValueOptions = [
    {
      label: I18n.t('workflow_detail_node_input'),
      code: JSON.stringify(
        safeJSONParse(executeResult?.input) ?? '{}',
        undefined,
        JSON_STRINGIFY_FORMAT_CODE,
      ),
      copyTip: I18n.t('workflow_detail_title_testrun_copyinput'),
    },
    {
      label: I18n.t('workflow_detail_node_output'),
      code: JSON.stringify(safeOutput, undefined, JSON_STRINGIFY_FORMAT_CODE),
      copyTip: I18n.t('workflow_detail_title_testrun_copyoutput'),
    },
  ];

  if (!showResult) {
    return null;
  }
  return (
    <div
      className={classNames(styles.container, className, 'flow-move-hot-zone')}
      style={style}
      onClick={onClick}
      data-testid="workflow.detail.node.testrun.result-panel"
    >
      <div className={styles.wrapper}>
        <div className={styles['delete-icon']} onClick={onClose}>
          <IconWorkflowRunResultClose className={styles.icon} />
        </div>
        <span className={styles.title}>
          {title}&ensp;{I18n.t('workflow_detail_title_testrun_process')}
        </span>
        <div className={styles.content}>
          {ShowValueOptions.map(item => (
            <div className={styles['block-item']} key={item.label}>
              <div className={styles.info}>
                <span className={styles.label}>{item.label}</span>
                <Tooltip content={item.copyTip}>
                  <UIIconButton
                    iconSize="small"
                    className={styles.copy}
                    icon={<IconCopy className={styles['icon-config']} />}
                    onClick={() => onCopy(item.code)}
                  />
                </Tooltip>
              </div>
              <pre
                className={classNames(styles.code, 'nowheel')}
                data-testid="workflow.detail.node.testrun.result-item"
              >
                {item.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
