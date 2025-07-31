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

import { useEffect, useState } from 'react';

import { useDataModalWithCoze } from '@coze-data/utils';
import { I18n } from '@coze-arch/i18n';
import { TextArea } from '@coze-arch/coze-design';

export interface IEditUnitNameProps {
  name: string;
  onOk?: (val: string) => void;
}

export const useEditUnitNameModal = (props: IEditUnitNameProps) => {
  const { name, onOk } = props;
  const [value, setValue] = useState(name);
  useEffect(() => {
    setValue(name);
  }, [name]);
  const onColse = () => {
    close();
    setValue(name);
  };
  const { modal, open, close } = useDataModalWithCoze({
    width: 480,
    title: I18n.t('knowledge_edit_unit_name_title'),
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('Confirm'),
    okButtonProps: {
      disabled: !value,
    },
    onOk: () => {
      onColse();
      onOk?.(value);
    },
    onCancel: onColse,
  });
  return {
    node: modal(
      <TextArea
        value={value}
        onChange={setValue}
        maxCount={100}
        maxLength={100}
        rows={3}
      />,
    ),
    open,
  };
};
