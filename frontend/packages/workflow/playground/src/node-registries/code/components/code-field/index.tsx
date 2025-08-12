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

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO, type OutputValueVO } from '@coze-workflow/base';
import { ConfigProvider } from '@coze-arch/coze-design';

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
