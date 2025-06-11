import React, { useState } from 'react';

import { I18n } from '@coze-arch/i18n';

import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import { AutoGenerate } from '@/form-extensions/setters/sql/sql/auto-generate';
import { useField, withField } from '@/form';

import styles from './index.module.less';

const Sql = () => {
  const { value, onChange, readonly, errors } = useField<string>();

  const [key, setKey] = useState<number>(0);

  function handleSubmit(newValue) {
    onChange(newValue);
    setKey(key + 1);
  }

  return (
    <div className={styles.container}>
      {/* The community version does not currently support the AI-generated SQL function for future expansion */}
      {!readonly && !IS_OPEN_SOURCE ? (
        <AutoGenerate
          className={styles['auto-generate']}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ExpressionEditor
        key={key.toString()}
        value={value}
        onChange={e => onChange(e)}
        readonly={readonly}
        isError={Boolean(errors?.length)}
        placeholder={I18n.t('workflow_240218_12')}
        name={'/sql'}
      />
    </div>
  );
};

export const SqlField = withField(Sql);
