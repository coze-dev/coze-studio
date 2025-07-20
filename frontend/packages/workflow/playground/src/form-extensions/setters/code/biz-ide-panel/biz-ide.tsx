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
import React, { type FC } from 'react';

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useEntity } from '@flowgram-adapter/free-layout-editor';
import { type EditorProps, Editor } from '@coze-workflow/code-editor-adapter';
import { useNodeTestId } from '@coze-workflow/base';
import { IconCozPlayCircle } from '@coze-arch/coze-design/icons';

import { useTestFormState } from '@/hooks';

import { type CodeEditorValue } from '../types';
import {
  type InputParams,
  type OutputParams,
  // type ParsedOutput,
  useIDEInputOutputType,
} from '../hooks/use-ide-input-output-type';
import { useCodeSetterContext } from '../context';
import {
  DEFAULT_LANGUAGES,
  LANG_CODE_NAME_MAP,
  LANG_NAME_CODE_MAP,
} from '../constants';
import { useBizIDEState } from '../../../../hooks/use-biz-ide-state';
import { WorkflowGlobalStateEntity } from '../../../../entities';

import styles from './index.module.less';

export const BizIDE: FC<{
  value: CodeEditorValue;
  onChange: (value?: CodeEditorValue) => void;
  onClose: () => void;
  languageTemplates?: EditorProps['languageTemplates'];
  inputParams?: InputParams;
  outputParams?: OutputParams;
  outputPath: string;
}> = props => {
  const {
    value,
    onChange,
    onClose,
    inputParams,
    outputParams,
    outputPath,
    languageTemplates = DEFAULT_LANGUAGES,
  } = props;
  const testFormState = useTestFormState();

  const handleTestClick = () => {
    testFormState.showTestNodeForm();
  };

  const { parsedInput, parsedOutput } = useIDEInputOutputType({
    inputParams,
    outputParams,
    outputPath,
  });
  const { flowNodeEntity } = useCodeSetterContext();

  const { setIsBizIDETesting } = useBizIDEState();
  const { getNodeSetterId } = useNodeTestId();
  const setterTestId = getNodeSetterId('biz-editor');

  const globalState = useEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
  );

  // const handleOutputSchemaChange = (output: ParsedOutput[]) => {
  //   updateOutput(output);
  // };

  const handleOnChange: EditorProps['onChange'] = (code, language) => {
    onChange?.({
      code,
      language: LANG_NAME_CODE_MAP.get(language) as number,
    });
  };

  const handleOnStatusChange = (status: string) => {
    setIsBizIDETesting(status === 'running');
  };
  const formModel =
    flowNodeEntity?.getData<FlowNodeFormData>(FlowNodeFormData).formModel;

  const nodeMeta = formModel?.getFormItemValueByPath('/nodeMeta');

  return (
    <div className={styles.container} data-testid={setterTestId}>
      <Editor
        title={nodeMeta?.title}
        // code 通过 panel 渲染之后，readonly 字段就非响应式了，所以从全局取比较合理
        readonly={globalState.readonly}
        height="100%"
        width="100%"
        input={parsedInput}
        output={parsedOutput}
        defaultLanguage={
          LANG_CODE_NAME_MAP.get(value?.language) ?? 'typescript'
        }
        defaultContent={value?.code}
        onTestRunStateChange={handleOnStatusChange}
        onTestRun={handleTestClick}
        testRunIcon={<IconCozPlayCircle />}
        onChange={handleOnChange}
        onClose={onClose}
        // 按workflow实例化IDE，因为在project-ide中，会同时打开多个workflow
        uuid={globalState.workflowId}
        languageTemplates={languageTemplates}
        spaceId={globalState.spaceId}
      />
    </div>
  );
};
