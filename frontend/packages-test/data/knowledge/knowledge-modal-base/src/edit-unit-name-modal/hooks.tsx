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
