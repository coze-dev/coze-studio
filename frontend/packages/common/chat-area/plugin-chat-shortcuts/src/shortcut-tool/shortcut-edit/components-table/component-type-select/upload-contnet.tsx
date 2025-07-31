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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Form } from '@coze-arch/bot-semi';
import { InputType } from '@coze-arch/bot-api/playground_api';

import { type UploadComponentTypeItem } from '../types';
import { ACCEPT_UPLOAD_TYPES } from '../../../../utils/file-const';

import styles from './index.module.less';

export interface UploadContentProps {
  value: UploadComponentTypeItem['uploadTypes'] | undefined;
  onChange?: (value: UploadComponentTypeItem['uploadTypes']) => void;
}

const { Checkbox, CheckboxGroup } = Form;

const DefaultValue = [
  InputType.UploadImage,
  InputType.UploadAudio,
  InputType.UploadDoc,
  InputType.UploadTable,
  InputType.CODE,
  InputType.ARCHIVE,
  InputType.PPT,
  InputType.VIDEO,
  InputType.TXT,
];

export const UploadContent = (props: UploadContentProps) => {
  const { value = DefaultValue, onChange } = props;
  return (
    <>
      <div className="coz-fg-plus text-[16px] font-medium">
        {I18n.t('shortcut_modal_upload_component_supported_file_formats')}
      </div>
      <CheckboxGroup
        field="values.uploadTypes"
        onChange={checkedValues => {
          onChange?.(checkedValues);
        }}
        initValue={value}
        className={cls('flex flex-wrap flex-row', styles['upload-content'])}
        noLabel
        noErrorMessage
        rules={[
          {
            validator: (rules, newValue) => !!newValue?.length,
            message: I18n.t(
              'shortcut_modal_please_select_file_formats_for_upload_component_tip',
            ),
          },
        ]}
      >
        {ACCEPT_UPLOAD_TYPES.map(({ type, label, icon }) => (
          <div key={type} className="flex-1 basis-1/2">
            <Checkbox
              className="flex-row-reverse justify-end"
              noLabel
              defaultChecked={value?.includes(type)}
              value={type}
            >
              <div className="flex gap-1">
                <img src={icon} alt={label} className="w-5 h-[25px] mr-2" />
                {label}
              </div>
            </Checkbox>
          </div>
        ))}
      </CheckboxGroup>
    </>
  );
};
