import { I18n } from '@coze-arch/i18n';
import { isString } from 'lodash-es';

import styles from './field-empty.module.less';

interface FieldEmptyProps {
  fieldName: string | React.ReactNode;
}

export function FieldEmpty({ fieldName }: FieldEmptyProps) {
  return (
    <div className={styles['field-empty']}>
      <span className="flex-1 overflow-hidden truncate nowrap">
        {isString(fieldName)
          ? `${I18n.t('workflow_240919_01')}${fieldName}`
          : I18n.t('workflow_240919_01')}
        {!isString(fieldName) && fieldName}
      </span>
    </div>
  );
}
