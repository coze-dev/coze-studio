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
