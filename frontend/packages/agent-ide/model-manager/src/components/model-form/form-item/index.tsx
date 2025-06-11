import { type PropsWithChildren, type ReactNode } from 'react';

import { useField } from '@formily/react';
import { type Field } from '@formily/core';
import { Popover } from '@coze-arch/bot-semi';
import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';
import { IconInfo } from '@coze-arch/bot-icons';

import commonStyles from '../index.module.less';

import styles from './index.module.less';

export interface ModelFormItemProps {
  label: ReactNode | undefined;
  popoverContent: string | undefined;
}

export const ModelFormItem: React.FC<PropsWithChildren<ModelFormItemProps>> = ({
  label,
  popoverContent,
  children,
}) => {
  const field = useField<Field>();

  return (
    <div className={styles['form-item']}>
      <div className={styles['field-content']}>
        <label className={styles['label-content']}>
          <span className={styles.label}>{label}</span>
          {popoverContent ? (
            <Popover
              className={commonStyles.popover}
              showArrow
              arrowPointAtCenter
              content={
                <MdBoxLazy
                  markDown={popoverContent}
                  autoFixSyntax={{ autoFixEnding: false }}
                />
              }
            >
              <IconInfo className={styles.icon} />
            </Popover>
          ) : null}
        </label>
        <div className={styles['field-main']}>{children}</div>
      </div>
      {field?.feedbacks?.map((feedback, index) => (
        <p key={index} className={styles['field-feedback']}>
          {feedback.messages}
        </p>
      ))}
    </div>
  );
};
