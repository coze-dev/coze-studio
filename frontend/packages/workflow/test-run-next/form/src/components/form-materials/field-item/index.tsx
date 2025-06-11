import React from 'react';

import { I18n } from '@coze-arch/i18n';

import {
  FieldItem as BaseFieldItem,
  type FieldItemProps,
} from '../../base-form-materials';
import { useFieldSchema } from '../../../form-engine';
import { TestFormFieldName } from '../../../constants';

export const FieldItem: React.FC<React.PropsWithChildren<FieldItemProps>> = ({
  tag,
  ...props
}) => {
  const schema = useFieldSchema();

  const isBatchField = schema.path.includes(TestFormFieldName.Batch);
  /** 批处理变量 tag 增加额外描述 */
  const currentTag =
    tag && isBatchField
      ? `${tag} - ${I18n.t('workflow_detail_node_batch')}`
      : tag;

  return (
    <BaseFieldItem
      title={schema.title}
      description={schema.description}
      required={schema.required}
      tag={currentTag}
      {...props}
    />
  );
};
