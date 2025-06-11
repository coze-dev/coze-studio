import { type FC } from 'react';

import { ConfigProvider } from '@coze/coze-design';
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
