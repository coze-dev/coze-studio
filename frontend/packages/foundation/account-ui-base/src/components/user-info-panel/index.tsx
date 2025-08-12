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
  type PropsWithChildren,
  type ReactNode,
  useRef,
  useState,
  useEffect,
} from 'react';

import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import {
  passportApi,
  usernameRegExpValidate,
} from '@coze-foundation/account-adapter';
import { UpdateUserAvatar } from '@coze-common/biz-components';
import { REPORT_EVENTS, createReportEvent } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { refreshUserInfo } from '@coze-arch/foundation-sdk';
import { IconCozWarningCircleFillPalette } from '@coze-arch/coze-design/icons';
import { Input, Toast, Select } from '@coze-arch/coze-design';
import { Form, type Upload } from '@coze-arch/bot-semi';
import { isApiError } from '@coze-arch/bot-http';
import { DeveloperApi } from '@coze-arch/bot-api';

import { UsernameInput } from './username-input';
import { UserInfoField, type UserInfoFieldProps } from './user-info-field';

import styles from './index.module.less';

// The time when the user enters the username to automatically check
export const CHECK_USER_NAME_DEBOUNCE_TIME = 1000;

const WrappedInputWithCount: React.FC<
  Pick<UserInfoFieldProps, 'value' | 'onChange' | 'onEnterPress'>
> = ({ value, onChange, onEnterPress }) => (
  <Input
    value={value}
    onChange={onChange}
    maxLength={20}
    autoFocus
    onEnterPress={onEnterPress}
    placeholder={I18n.t('setting_name_placeholder')}
  />
);

const WrappedUsernameInput: React.FC<
  Pick<
    UserInfoFieldProps,
    'value' | 'onChange' | 'onEnterPress' | 'errorMessage'
  >
> = ({ value, onChange, onEnterPress, errorMessage }) => (
  <UsernameInput
    style={{ marginBottom: 0 }}
    value={value}
    errorMessage={errorMessage}
    onChange={onChange}
    autoFocus
    onEnterPress={onEnterPress}
  />
);

const WrappedPasswordInput: React.FC<
  Pick<UserInfoFieldProps, 'value' | 'onChange' | 'onEnterPress'>
> = ({ value, onChange, onEnterPress }) => (
  <Input
    mode="password"
    value={value}
    onChange={onChange}
    autoFocus
    onEnterPress={onEnterPress}
  />
);

const getLanguageOptions = () => [
  {
    label: I18n.t('settings_language_zh'),
    value: 'zh-CN',
  },
  {
    label: I18n.t('settings_language_en'),
    value: 'en-US',
  },
];

const WrappedSelectInput: React.FC<
  Pick<
    UserInfoFieldProps,
    'value' | 'onChange' | 'onEnterPress' | 'errorMessage'
  >
> = ({ value, onChange, onEnterPress, errorMessage }) => (
  <Select
    optionList={getLanguageOptions()}
    value={value}
    onChange={val => {
      onChange?.(val as string);
    }}
    className="w-[120px]"
  />
);

const UserInfoFieldWrap: React.FC<PropsWithChildren<{ label?: ReactNode }>> = ({
  children,
  label,
}) => (
  <div className={styles['label-wrap']}>
    <Form.Label text={label} className={styles.label} />
    {children}
  </div>
);

const updateProfileEvent = createReportEvent({
  eventName: REPORT_EVENTS.editUserProfile,
});

const updateProfileCheckEvent = createReportEvent({
  eventName: REPORT_EVENTS.updateUserProfileCheck,
});

const getUserName = (userInfo?: DataItem.UserInfo | null): string =>
  userInfo?.bui_audit_info?.audit_status === 1
    ? userInfo?.bui_audit_info?.audit_info.user_unique_name ??
      userInfo?.app_user_info.user_unique_name ??
      ''
    : userInfo?.app_user_info.user_unique_name ?? '';

// eslint-disable-next-line @coze-arch/max-line-per-function
export const UserInfoPanel = () => {
  const userInfo = userStoreService.useUserInfo();

  const [nickname, setNickname] = useState(userInfo?.name);

  const [username, setUsername] = useState(getUserName(userInfo));

  const [userNameErrorInfo, setUsernameErrorInfo] = useState('');

  const [lang, setLang] = useState(
    userInfo?.locale ?? navigator.language ?? 'en-US',
  );

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(userInfo?.avatar_url ?? '');
  const uploadRef = useRef<Upload>(null);

  const onNicknameChange = async (name?: string) => {
    if (!name) {
      return;
    }
    try {
      updateProfileEvent.start();

      setLoading(true);
      await passportApi.updateUserProfile({
        name,
      });
      updateProfileEvent.success();
    } catch (error) {
      updateProfileEvent.error({
        error: error as Error,
        reason: 'update nickname failed',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (newPassword?: string) => {
    try {
      updateProfileEvent.start();
      await passportApi.updatePassword({
        password: newPassword ?? '',
        email: userInfo?.email ?? '',
      });
      updateProfileEvent.success();
    } catch (error) {
      updateProfileEvent.error({
        error: error as Error,
        reason: 'update password failed',
      });
      throw error;
    }
  };

  const onLanguageChange = async (newLang?: string) => {
    if (!newLang) {
      return;
    }

    try {
      updateProfileEvent.start();

      await passportApi.updateUserProfile({
        locale: newLang,
      });
      localStorage.setItem('i18next', newLang === 'en-US' ? 'en' : newLang);
      updateProfileEvent.success();
      // Updating the language settings requires a page refresh to take effect
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      updateProfileEvent.error({
        error: error as Error,
        reason: 'update language failed',
      });
      throw error;
    }
  };

  const handleUsernameRegexpError = (value?: string) => {
    if (!value) {
      setUsernameErrorInfo('');
      return '';
    }
    const message = usernameRegExpValidate(value) || '';
    setUsernameErrorInfo(message);
    return message;
  };

  const { run: validateUsername, cancel: cancelValidateUsername } = useRequest(
    async (innerUsername: string) => {
      await DeveloperApi.UpdateUserProfileCheck(
        {
          user_unique_name: innerUsername,
        },
        { __disableErrorToast: true },
      );
    },
    {
      manual: true,
      debounceWait: CHECK_USER_NAME_DEBOUNCE_TIME,
      debounceLeading: false,
      debounceTrailing: true,
      onBefore: () => {
        updateProfileCheckEvent.start();
        setLoading(true);
      },
      onError: error => {
        updateProfileCheckEvent.error({ error, reason: error.message });
        if (isApiError(error)) {
          setUsernameErrorInfo(error.msg ?? '');
        }
      },
      onSuccess: () => {
        updateProfileCheckEvent.success();
        setUsernameErrorInfo('');
      },
      onFinally: () => {
        setLoading(false);
      },
    },
  );

  const onUsernameChange = async (innerUsername?: string) => {
    if (!innerUsername) {
      return;
    }
    try {
      updateProfileEvent.start();

      setLoading(true);

      await passportApi.updateUserProfile({
        user_unique_name: innerUsername,
      });
      updateProfileEvent.success();
    } catch (error) {
      updateProfileEvent.error({
        error: error as Error,
        reason: 'update username failed',
      });

      if (isApiError(error)) {
        setUsernameErrorInfo(error.msg ?? '');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onUserInfoFieldCancel = () => {
    refreshUserInfo();
    setUsernameErrorInfo('');
  };

  useEffect(() => {
    setNickname(userInfo?.name);
    setUsername(getUserName(userInfo));
    setAvatar(userInfo?.avatar_url ?? '');
  }, [userInfo]);

  // Refresh user information once upon entry and exit
  useEffect(() => {
    refreshUserInfo();
    return () => {
      refreshUserInfo();
    };
  }, []);

  return (
    <div
      className={classNames(
        styles['edit-profile'],
        'flex flex-col w-full h-full',
      )}
    >
      <UpdateUserAvatar
        className={styles['update-avatar']}
        value={avatar}
        onSuccess={url => {
          setAvatar(url);
          Toast.success({
            content: I18n.t('upload_avatar_success'),
            showClose: false,
          });
        }}
        onError={() =>
          Toast.error({
            content: 'upload_avatar_failed',
          })
        }
        ref={uploadRef}
      />
      <UserInfoFieldWrap label={I18n.t('user_info_username')}>
        <div className="flex">
          <UserInfoField
            loading={loading}
            className={styles['info-field']}
            value={username}
            onChange={v => {
              setUsername(v ?? '');
              const message = handleUsernameRegexpError(v);
              if (message) {
                cancelValidateUsername();
                setLoading(false);
              } else {
                v && validateUsername(v);
              }
            }}
            customContent={
              !username ? (
                <div
                  className={classNames(
                    'inline-flex items-center gap-[2px] shrink-0',
                    'text-[12px] font-[500] coz-fg-hglt-red',
                  )}
                >
                  <IconCozWarningCircleFillPalette />
                  {I18n.t('setting_username_empty')}
                </div>
              ) : undefined
            }
            errorMessage={userNameErrorInfo}
            customComponent={WrappedUsernameInput}
            onSave={onUsernameChange}
            onCancel={() => {
              setUsername(getUserName(userInfo));
              onUserInfoFieldCancel();
            }}
          />
        </div>
      </UserInfoFieldWrap>
      <UserInfoFieldWrap label={I18n.t('user_info_custom_name')}>
        <div className="flex">
          <UserInfoField
            loading={loading}
            className={styles['info-field']}
            value={nickname}
            onChange={setNickname}
            customComponent={WrappedInputWithCount}
            onSave={onNicknameChange}
            onCancel={onUserInfoFieldCancel}
          />
        </div>
      </UserInfoFieldWrap>
      <UserInfoFieldWrap label={I18n.t('user_info_email')}>
        <div className="flex">
          <UserInfoField
            readonly
            className={styles['info-field']}
            value={userInfo?.email || '-'}
          />
        </div>
      </UserInfoFieldWrap>
      <UserInfoFieldWrap label={I18n.t('user_info_password')}>
        <div className="flex">
          <UserInfoField
            className={styles['info-field']}
            value={password}
            customContent={'******' /*<PasswordDesc value={password} />*/}
            customComponent={WrappedPasswordInput}
            onChange={val => setPassword(val ?? '')}
            onSave={onPasswordChange}
            onCancel={onUserInfoFieldCancel}
          />
        </div>
      </UserInfoFieldWrap>
      <UserInfoFieldWrap label={I18n.t('language')}>
        <div className="flex">
          <UserInfoField
            className={styles['info-field']}
            value={lang}
            customContent={
              getLanguageOptions().find(item => item.value === lang)?.label
            }
            customComponent={WrappedSelectInput}
            onChange={langValue =>
              setLang((langValue as 'zh-CN' | 'en-US') ?? 'zh-CN')
            }
            onSave={onLanguageChange}
          />
        </div>
      </UserInfoFieldWrap>
    </div>
  );
};
