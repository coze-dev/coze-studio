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

import { type FC } from 'react';

import { ConfigProvider } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { CodeSetterContext } from './context';
// import { CodeEditorWithMonaco } from './code-with-monaco';
import { CodeEditorWithBizIDE } from './code-with-biz-ide';

export const CodeSetter: FC<SetterComponentProps> = props => {
  const {
    value,
    onChange,
    options,
    readonly,
    feedbackText,
    feedbackStatus,
    ...othersSetterProps
  } = props;

  const { key, ...others } = options;

  // if (others.enableBizIDE) {
  return (
    <ConfigProvider getPopupContainer={() => document.body}>
      <CodeSetterContext.Provider
        value={{
          ...othersSetterProps,
          readonly,
        }}
      >
        <CodeEditorWithBizIDE
          {...others}
          value={value}
          onChange={onChange}
          feedbackText={feedbackText}
          feedbackStatus={feedbackStatus}
        />
      </CodeSetterContext.Provider>
    </ConfigProvider>
  );
  // } else {
  //   return (
  //     <CodeEditorWithMonaco
  //       {...others}
  //       value={value}
  //       onChange={onChange}
  //       readonly={readonly}
  //     />
  //   );
  // }
};

export const code = {
  key: 'Code',
  component: CodeSetter,
};
