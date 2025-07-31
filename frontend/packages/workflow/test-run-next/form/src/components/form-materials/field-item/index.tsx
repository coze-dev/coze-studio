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
  /** Batch variable tag adds extra description */
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
