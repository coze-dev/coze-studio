/* eslint-disable @coze-arch/no-deep-relative-import */
import React, { type FC } from 'react';

import { IconCozPlayCircle } from '@coze/coze-design/icons';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useEntity } from '@flowgram-adapter/free-layout-editor';
import { type EditorProps, Editor } from '@coze-workflow/code-editor-adapter';

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
    <div className={styles.container}>
      <Editor
        title={nodeMeta?.title}
        // code 通过 panel 渲染之后，readonly 字段就非响应式了，所以从全局取比较合理
        readonly={globalState.readonly}
        height="100%"
        width="100%"
        input={parsedInput}
        output={parsedOutput}
        // Bad Case: 因为历史数据里代码的 language 是 javascript
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
