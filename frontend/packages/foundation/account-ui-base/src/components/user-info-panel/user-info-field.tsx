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

import {
  type CSSProperties,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
  useState,
} from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import {
  IconButton,
  Input,
  Button,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';

import s from './index.module.less';

interface BaseValueProps {
  value?: string;
  onChange?: (v?: string) => void;
  onEnterPress?: () => void;
  errorMessage?: string;
}

export interface UserInfoFieldProps extends BaseValueProps {
  onSave?: (v?: string) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  customComponent?: ComponentType<BaseValueProps>;
  className?: string;
  style?: CSSProperties;
  readonly?: boolean;
  disabled?: boolean;
  disabledTip?: ReactNode;
  customContent?: ReactNode;
}

const EditWrap: React.FC<
  PropsWithChildren<
    Pick<
      UserInfoFieldProps,
      | 'onSave'
      | 'onCancel'
      | 'loading'
      | 'className'
      | 'style'
      | 'errorMessage'
      | 'value'
    >
  >
> = ({
  onSave,
  onCancel,
  loading,
  children,
  className,
  style,
  errorMessage,
  value,
}) => (
  <div className={classNames(s['field-edit'], className)} style={style}>
    <div className={s['field-edit-children']}>{children}</div>
    <Button
      className={s.btn}
      color="primary"
      loading={loading}
      onClick={() => {
        onCancel?.();
      }}
      data-testid="bot-edit-field-cancel-button"
    >
      {I18n.t('Cancel')}
    </Button>
    <Button
      disabled={Boolean(errorMessage) || !value}
      className={s.btn}
      loading={loading}
      onClick={() => {
        onSave?.();
      }}
      data-testid="bot-edit-field-save-button"
    >
      {I18n.t('setting_name_save')}
    </Button>
  </div>
);

export const UserInfoField: React.FC<UserInfoFieldProps> = ({
  value,
  onChange,
  onCancel,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  customComponent: CustomComponent,
  onSave,
  loading,
  className,
  style,
  readonly,
  disabled,
  disabledTip,
  errorMessage,
  customContent,
}) => {
  const [isEdit, setEdit] = useState(false);
  const handleSave = async () => {
    await onSave?.(value);
    setEdit(false);
  };
  const EditButton = (
    <IconButton
      disabled={disabled}
      icon={<IconCozEdit />}
      size="mini"
      color="secondary"
      className="ml-[8px]"
      onClick={() => {
        setEdit(true);
      }}
    />
  );

  if (!isEdit) {
    return (
      <div className={classNames(s['filed-readonly'], className)} style={style}>
        {customContent ? (
          customContent
        ) : (
          <Typography.Text
            fontSize="14px"
            className="!font-medium coz-fg-primary"
            ellipsis
          >
            {value}
          </Typography.Text>
        )}
        {!readonly &&
          (disabled && disabledTip ? (
            <Tooltip content={disabledTip}>{EditButton}</Tooltip>
          ) : (
            EditButton
          ))}
      </div>
    );
  }
  if (CustomComponent) {
    return (
      <EditWrap
        value={value}
        errorMessage={errorMessage}
        onSave={handleSave}
        loading={loading}
        onCancel={() => {
          setEdit(false);
          onCancel?.();
        }}
      >
        <CustomComponent
          errorMessage={errorMessage}
          onEnterPress={handleSave}
          value={value}
          onChange={onChange}
        />
      </EditWrap>
    );
  }
  return (
    <EditWrap
      value={value}
      errorMessage={errorMessage}
      onSave={handleSave}
      loading={loading}
      onCancel={() => {
        setEdit(false);
        onCancel?.();
      }}
    >
      <Input onEnterPress={handleSave} value={value} onChange={onChange} />
    </EditWrap>
  );
};
