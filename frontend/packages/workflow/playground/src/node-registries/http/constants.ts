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

import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

export enum JsonEditorTheme {
  Light = 'coze-light',
  Dark = 'coze-dark',
}

export const PARAMS_COLUMNS = [
  {
    title: I18n.t('workflow_detail_node_parameter_name'),
    style: {
      flex: 2,
    },
  },
  {
    title: I18n.t('card_builder_api_http_params_columns_type'),
    style: {
      flex: 2,
    },
  },
  {
    title: I18n.t('workflow_detail_node_parameter_value'),
    style: {
      flex: 3,
    },
  },
];

export const INPUT_VALUE_COLUMNS = [
  {
    title: I18n.t('workflow_detail_node_parameter_name'),
    style: {
      flex: 2,
    },
  },
  {
    title: I18n.t('workflow_detail_node_parameter_value'),
    style: {
      flex: 3,
    },
  },
];

export enum DTOFieldType {
  File = 'file',
  String = 'string',
}

/**
 * Backend Data Types - > Frontend Data Types
 */
export const fileTypeDTOToVO = {
  [DTOFieldType.File]: ViewVariableType.File,
  [DTOFieldType.String]: ViewVariableType.String,
};

/**
 * Front-end data types - > Back-end data types
 */
export const fileTypeVOToDTO = {
  [ViewVariableType.File]: DTOFieldType.File,
  [ViewVariableType.String]: DTOFieldType.String,
};
