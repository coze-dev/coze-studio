import { useState, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ExpressionEditor } from '../../expression-editor';
import { AutoGenerate } from './auto-generate';

import styles from './index.module.less';

export const Sql: FC<SetterComponentProps<string>> = props => {
  const { onChange, readonly } = props;
  const [key, setKey] = useState<number>(0);

  function handleSubmit(newValue) {
    onChange(newValue);
    setKey(key + 1);
  }

  return (
    <div className={styles.container}>
      {!readonly && (
        <AutoGenerate
          className={styles['auto-generate']}
          onSubmit={handleSubmit}
        />
      )}

      <ExpressionEditor
        key={key}
        {...props}
        options={{
          key: '',
          placeholder: I18n.t('workflow_240218_12'),
        }}
      />
    </div>
  );
};
