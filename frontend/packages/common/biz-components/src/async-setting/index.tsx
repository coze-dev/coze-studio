import React, { useState, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  Switch,
  TextArea,
  Button,
  type ButtonProps,
} from '@coze/coze-design';

interface IValue {
  isOpen?: boolean;
  replyText?: string;
}

interface AsyncFormProps {
  value?: IValue;
  onChange?: (value: IValue) => void;
  switchStatus?: 'default' | 'hidden' | 'disabled';
  disabled?: boolean;
  textAreaVisible?: boolean;
  saveButtonProps?: ButtonProps;
}

const REPLY_MAX_LENGTH = 1000;
const validate = (value: IValue, needReply: boolean): string => {
  if (!needReply) {
    return '';
  }
  if (!value.replyText) {
    return I18n.t('asyn_task_reply_need');
  }
  if (value.replyText.length > REPLY_MAX_LENGTH) {
    return I18n.t('asyn_task_reply_toolong');
  }
  return '';
};

export const AsyncSettingUI: FC<AsyncFormProps> = props => {
  const {
    onChange,
    switchStatus = 'default',
    textAreaVisible = true,
    saveButtonProps = {},
    disabled,
  } = props;

  const [value, setValue] = useState<IValue>(props.value ?? {});
  const [error, setError] = useState('');
  return (
    <div className="flex flex-col h-full gap-[12px] text-lg">
      <div className="flex flex-col  gap-[4px]">
        <div className="flex">
          <div className="flex-1 font-semibold coz-fg-primary">
            {I18n.t('asyn_task_setting_title')}
          </div>
          {switchStatus === 'hidden' ? null : (
            <Switch
              size="small"
              disabled={switchStatus === 'disabled' || disabled}
              checked={value?.isOpen}
              onChange={(v: boolean) => {
                setValue({
                  ...value,
                  isOpen: v,
                });
              }}
            />
          )}
        </div>
        <div className="coz-fg-secondary">
          {I18n.t('asyn_task_setting_desc')}
        </div>
      </div>

      {textAreaVisible && value?.isOpen ? (
        <div className="flex flex-col flex-1 gap-[12px]">
          <div className="font-semibold coz-fg-primary">
            {I18n.t('asyn_task_setting_response_title')}
            <span className="coz-fg-hglt-red">*</span>
          </div>
          <div className="flex-1">
            <TextArea
              disabled={disabled}
              error={!!error}
              className="h-[135px]"
              suffix={
                <div>{`${
                  value?.replyText?.length || 0
                }/${REPLY_MAX_LENGTH}`}</div>
              }
              value={value?.replyText}
              onChange={(v: string) => {
                const newValue = {
                  ...value,
                  replyText: v,
                };
                setValue(newValue);
                setError(validate(newValue, textAreaVisible));
              }}
              placeholder={I18n.t('asyn_task_setting_response_content')}
            />
            {error ? (
              <div className="coz-fg-hglt-red text-base">{error}</div>
            ) : undefined}
          </div>
        </div>
      ) : undefined}

      <div className="flex justify-end mt-auto">
        <Button
          {...saveButtonProps}
          disabled={disabled}
          onClick={() => {
            setError(validate(value, textAreaVisible));
            if (!error) {
              onChange?.(value);
            }
          }}
        >
          {I18n.t('Save')}
        </Button>
      </div>
    </div>
  );
};
