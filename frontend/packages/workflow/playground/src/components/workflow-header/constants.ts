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

import { I18n } from '@coze-arch/i18n';

export enum ChangeType {
  Add = 'Add',
  Modify = 'Modify',
  Delete = 'Delete',
}

export const COLOR_STYLE_MAP = {
  Info: {
    backgroundColor: 'var(--semi-color-info-light-hover)',
    color: 'var(--semi-color-info)',
  },
  Success: {
    backgroundColor: 'var(--semi-color-success-light-hover)',
    color: 'var(--semi-color-success)',
  },
  Danger: {
    backgroundColor: 'var(--semi-color-danger-light-hover)',
    color: 'var(--semi-color-danger)',
  },
  Warning: {
    backgroundColor: 'var(--semi-color-warning-light-hover)',
    color: 'var(--semi-color-warning)',
  },
  Tertiary: {
    backgroundColor: 'var(--semi-color-tertiary-light-hover)',
    color: 'var(--semi-color-tertiary-active)',
  },
};

export const CHANGE_TYPE_TAG_STYLES = {
  Add: COLOR_STYLE_MAP.Success,
  Modify: COLOR_STYLE_MAP.Warning,
  Delete: COLOR_STYLE_MAP.Danger,
};

export enum DiffItems {
  Name = 'name_dif',
  Describe = 'describe_dif',
  IconUrl = 'icon_url_dif',
  Schema = 'schema_dif',
}

export const MERGE_KEY_MAP = {
  name_dif: 'name',
  describe_dif: 'desc',
  icon_url_dif: 'icon_uri',
  schema_dif: 'schema',
};

export const DIFF_ITEM_NAMES = {
  name_dif: I18n.t('workflow_publish_multibranch_workflow_name'),
  describe_dif: I18n.t('workflow_publish_multibranch_workflow_describe'),
  icon_url_dif: I18n.t('workflow_publish_multibranch_workflow_picture'),
  schema_dif: I18n.t('workflow_publish_multibranch_workflow_flow'),
};

export const DIFF_ITEM_MODIFY_MSG = {
  icon_url_dif: I18n.t('workflow_publish_multibranch_change_picture'),
  schema_dif: I18n.t('workflow_publish_multibranch_modity_flow'),
};

export enum Retained {
  Submit = 'submit',
  Draft = 'draft',
}

export type RetainedResult = {
  [key in DiffItems]?: Retained;
};
