import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO, type OutputValueVO } from '@coze-workflow/base';
import { ConfigProvider } from '@coze/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type CodeEditorValue } from '@/form-extensions/setters/code/types';
import { type InputParams } from '@/form-extensions/setters/code/hooks/use-ide-input-output-type';
import { CodeSetterContext } from '@/form-extensions/setters/code/context';
import { CodeEditorWithBizIDE } from '@/form-extensions/setters/code/code-with-biz-ide';
import { useField, withField } from '@/form';

export const CodeField = withField(
  ({
    tooltip,
    outputParams,
    inputParams,
  }: {
    tooltip?: string;
    outputParams?: OutputValueVO[];
    inputParams?: InputValueVO[];
  }) => {
    const { value, onChange, errors } = useField<CodeEditorValue>();
    const readonly = useReadonly();

    const feedbackText = errors?.[0]?.message || '';
    const feedbackStatus = feedbackText ? 'error' : undefined;
    const flowNodeEntity = useCurrentEntity();

    return (
      <ConfigProvider getPopupContainer={() => document.body}>
        <CodeSetterContext.Provider
          value={{
            readonly,
            flowNodeEntity,
          }}
        >
          <CodeEditorWithBizIDE
            feedbackStatus={feedbackStatus}
            feedbackText={feedbackText}
            inputParams={inputParams as InputParams}
            onChange={onChange}
            outputParams={outputParams}
            outputPath={'/outputs'}
            tooltip={tooltip}
            value={value}
          />
        </CodeSetterContext.Provider>
      </ConfigProvider>
    );
  },
);
