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
        // After the code is rendered through the panel, the readonly field is not responsive, so it is more reasonable to take it from the global
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
        // Instantiate the IDE by workflow, because in project-ide, multiple workflows are open simultaneously
        uuid={globalState.workflowId}
        languageTemplates={languageTemplates}
        spaceId={globalState.spaceId}
      />
    </div>
  );
};
