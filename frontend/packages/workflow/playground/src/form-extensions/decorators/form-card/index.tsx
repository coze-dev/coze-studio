import { type FC } from 'react';

import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

import { FormCard, type FormCardProps } from '../../components/form-card';
import {
  ColumnsTitle,
  type ColumnsTitleProps,
} from '../../components/columns-title';

import styles from './index.module.less';
interface FormCardDecoratorOptions extends FormCardProps {
  columns: ColumnsTitleProps['columns'];
}

const FormCardDecorator: FC<
  DecoratorComponentProps<FormCardDecoratorOptions>
> = props => {
  const { context, children, options, feedbackText, feedbackStatus } = props;
  const { title } = context.meta;

  const { key, columns, ...others } = options;
  return (
    <FormCard
      header={title}
      {...others}
      feedbackText={feedbackText}
      feedbackStatus={feedbackStatus}
    >
      {columns ? (
        <div className={styles.formCardColumns}>
          <ColumnsTitle columns={columns} />
        </div>
      ) : null}
      {children}
    </FormCard>
  );
};

export const formCard = {
  key: 'FormCard',
  component: FormCardDecorator,
};

export const formCardAction = {
  key: 'FormCardAction',
  component: FormCard.Action,
};
