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

/* eslint-disable complexity */
import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';

import {
  type MapperItem,
  type TriggerType,
  VerifyType,
} from '../../../types/database-field';

// Validation Table Name and Field Name
const namingRegexMapper = [
  {
    type: 1,
    regex: /[^a-z0-9_]/,
    errorMsg: I18n.t('db_add_table_field_name_tips2'),
  },
  {
    type: 2,
    regex: /^[^a-z]/,
    errorMsg: I18n.t('db_add_table_field_name_tips3'),
  },
  {
    type: 3,
    regex: /[\s\S]{64,}/,
    errorMsg: I18n.t('db_add_table_field_name_tips4'),
  },
];
export const validateNaming = (str: string, errList: string[] = []) => {
  let list = [...errList];
  namingRegexMapper.forEach(i => {
    list = list.filter(j => j !== i.errorMsg);
    if (i.regex.test(str || '')) {
      list.push(i.errorMsg);
    }
  });
  return list;
};

// Validation Table Fields
export const thMapper: MapperItem[] = [
  {
    label: I18n.t('db_add_table_field_name'),
    key: 'name',
    validator: [
      {
        type: VerifyType.Naming,
        message: '',
      },
      {
        type: VerifyType.Required,
        message: I18n.t('db_table_save_exception_nofieldname'),
      },
      {
        type: VerifyType.Unique,
        message: I18n.t('db_table_save_exception_fieldname'),
      },
    ],
    defaultValue: '',
    require: true,
  },
  {
    label: I18n.t('db_add_table_field_desc'),
    key: 'desc',
    require: false,
    validator: [],
    defaultValue: '',
  },
  {
    label: I18n.t('db_add_table_field_type'),
    key: 'type',
    require: true,
    validator: [
      {
        type: VerifyType.Required,
        message: I18n.t('db_table_save_exception_fieldtype'),
      },
    ],
    defaultValue: '',
  },
  {
    label: I18n.t('db_add_table_field_necessary'),
    key: 'must_required',
    require: false,
    validator: [],
    defaultValue: true,
  },
];
export const validateFields = (
  list: TableMemoryItem[],
  trigger: TriggerType,
) => {
  const resList = list.map(_listItem => {
    const listItem: TableMemoryItem = { ..._listItem };
    thMapper.forEach(thItem => {
      const thKey = thItem.key as keyof TableMemoryItem;

      thItem.validator.forEach(verifyItem => {
        if (!listItem?.errorMapper) {
          listItem.errorMapper = {};
        }
        let errTarget = listItem?.errorMapper?.[thKey];
        const value = listItem[thKey];
        if (!errTarget) {
          listItem.errorMapper[thKey] = [];
          errTarget = [];
        }
        const msg = verifyItem.message;
        switch (verifyItem.type) {
          case VerifyType.Required: {
            // When the error occurs: When clicking the Save button, a prompt appears. When a row in the table fills in the data, but the required fields are not filled in, an error needs to be reported.
            if (
              trigger === 'save' &&
              !value &&
              thMapper.find(
                i =>
                  !!listItem[i.key as keyof TableMemoryItem] && !i.defaultValue,
              )
            ) {
              listItem.errorMapper[thKey].push(msg);
            }
            // Error reporting and disappearance timing: Required text box After entering the content, the error will disappear immediately
            if (trigger === 'change' && value) {
              listItem.errorMapper[thKey] = errTarget.filter(i => i !== msg);
            }
            break;
          }
          case VerifyType.Unique: {
            // When the error occurs: When you click the Save button, a prompt appears.
            if (
              trigger === 'save' &&
              value &&
              list.filter(i => i[thKey] === listItem[thKey]).length !== 1
            ) {
              listItem.errorMapper[thKey].push(msg);
            }
            // Error reporting and disappearance timing: Required text box After entering the content, the error will disappear immediately
            if (
              trigger === 'change' &&
              value &&
              list.filter(i => i[thKey] === listItem[thKey]).length === 1
            ) {
              listItem.errorMapper[thKey] = errTarget.filter(i => i !== msg);
            }
            break;
          }
          case VerifyType.Naming: {
            // Error timing: There is a problem with the naming format. When you lose focus, check the format immediately
            if (
              trigger === 'save' ||
              trigger === 'blur' ||
              (trigger === 'change' && errTarget.length)
            ) {
              listItem.errorMapper[thKey] = validateNaming(
                value as string,
                errTarget,
              );
            }
            break;
          }
          default:
            break;
        }
        listItem.errorMapper[thKey] = Array.from(
          new Set(listItem.errorMapper[thKey]),
        );
      });
    });
    return listItem;
  });

  return resList;
};
