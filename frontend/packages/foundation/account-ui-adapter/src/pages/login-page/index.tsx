/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function */
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

import { type FC, useState, useEffect } from 'react';

// import { CozeBrand } from '@coze-studio/components/coze-brand';
import { I18n } from '@coze-arch/i18n';
import {
  Button,
  Form,
  Typography,
  Checkbox,
  Toast,
} from '@coze-arch/coze-design';
import { SignFrame, SignPanel } from '@coze-arch/bot-semi';

import { useLoginService } from './service';

import cls from 'classnames';
import styles from './index.module.less';

import svgEmail from './icon-email.svg';
import svgPassword from './icon-pswd.svg';
import svgUser from './icon-user.svg';
import svgPhone from './icon-phone.svg';
import svgSms from './icon-sms.svg';

const IconEmail: FC = () => (
  <div className="w-[38px] h-[38px] p-[8px]">
    <img src={svgEmail} alt="" className="block w-full h-full" />
  </div>
);

const IconPassword: FC = () => (
  <div className="w-[38px] h-[38px] p-[8px]">
    <img src={svgPassword} alt="" className="block w-full h-full" />
  </div>
);

const IconUser: FC = () => (
  <div className="w-[38px] h-[38px] p-[8px]">
    <img src={svgUser} alt="" className="block w-full h-full" />
  </div>
);

const IconPhone: FC = () => (
  <div className="w-[38px] h-[38px] p-[8px]">
    <img src={svgPhone} alt="" className="block w-full h-full" />
  </div>
);

const IconSms: FC = () => (
  <div className="w-[38px] h-[38px] p-[8px]">
    <img src={svgSms} alt="" className="block w-full h-full" />
  </div>
);

const LoginForm = ({
  setHasError,
  setEmail,
  login,
  setPassword,
  submitDisabled,
}) => (
  <Form
    onErrorChange={errors => {
      setHasError(Object.keys(errors).length > 0);
    }}
  >
    <Form.Input
      noLabel
      size="large"
      type="email"
      field="email"
      prefix={<IconEmail />}
      rules={[
        {
          required: true,
          message: I18n.t('open_source_login_placeholder_email'),
        },
        {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: I18n.t('open_source_login_placeholder_email'),
        },
      ]}
      onChange={setEmail}
      placeholder={I18n.t('open_source_login_placeholder_email')}
    />
    <Form.Input
      data-testid="login.input.password"
      noLabel
      size="large"
      prefix={<IconPassword />}
      rules={[
        {
          required: true,
          message: I18n.t('open_source_login_placeholder_password'),
        },
      ]}
      field="password"
      type="password"
      mode="password"
      onChange={setPassword}
      placeholder={I18n.t('open_source_login_placeholder_password')}
      onKeyPress={e => {
        // 检查是否按下回车键且登录按钮可用
        if (e.key === 'Enter' && !submitDisabled) {
          login();
        }
      }}
    />
  </Form>
);

const RegisterForm = ({
  setHasError,
  setUsername,
  setEmail,
  setRegPassword,
  setPhone,
  setSms,
  phone,
  hasError,
}) => {
  const [countdown, setCountdown] = useState(0);
  const loop = (prev: number) => {
    if (prev <= 0) {
      return;
    }
    setTimeout(() => {
      loop(prev - 1);
      setCountdown(prev - 1);
    }, 1000);
  };

  const getSmsCode = () => {
    loop(60);
    Toast.success(I18n.t('open_source_login_get_sms_code_sended'));
  };
  return (
    <Form
      onErrorChange={errors => {
        setHasError(Object.keys(errors).length > 0);
      }}
    >
      <Form.Input
        noLabel
        size="large"
        type="username"
        field="username"
        prefix={<IconUser />}
        rules={[
          {
            required: true,
            message: I18n.t('open_source_register_placeholder_username'),
          },
          {
            pattern: /^[a-zA-Z0-9_]{5,20}$/, // 5-20个字符，字母、数字、下划线
            message: I18n.t('open_source_register_rule_username_error'),
          },
        ]}
        onChange={setUsername}
        placeholder={I18n.t('open_source_register_placeholder_username')}
      />
      <Form.Input
        noLabel
        size="large"
        type="email"
        field="email"
        prefix={<IconEmail />}
        rules={[
          {
            required: true,
            message: I18n.t('open_source_register_placeholder_email'),
          },
          {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: I18n.t('open_source_register_placeholder_email'),
          },
        ]}
        onChange={setEmail}
        placeholder={I18n.t('open_source_register_placeholder_email')}
      />
      <Form.Input
        noLabel
        size="large"
        type="phone"
        field="phone"
        prefix={<IconPhone />}
        rules={[
          {
            required: true,
            message: I18n.t('open_source_register_placeholder_phone'),
          },
          {
            pattern: /^1[3456789]\d{9}$/,
            message: I18n.t('open_source_register_placeholder_phone'),
          },
        ]}
        onChange={setPhone}
        placeholder={I18n.t('open_source_register_placeholder_phone')}
      />
      <Form.Input
        noLabel
        size="large"
        type="sms"
        field="sms"
        prefix={<IconSms />}
        rules={[
          {
            required: true,
            message: I18n.t('open_source_register_placeholder_sms'),
          },
        ]}
        suffix={
          <Button
            disabled={!phone || hasError || countdown > 0}
            onClick={getSmsCode}
            size="large"
            type="primary"
            className="text-[14px] font-medium coze-fg-plug"
          >
            {I18n.t('open_source_login_get_sms_code') +
              (countdown > 0 ? ` (${countdown})` : '')}
          </Button>
        }
        onChange={setSms}
        placeholder={I18n.t('open_source_register_placeholder_sms')}
      />
      <Form.Input
        noLabel
        size="large"
        prefix={<IconPassword />}
        rules={[
          {
            required: true,
            message: I18n.t('open_source_register_placeholder_password'),
          },
        ]}
        field="regPassword"
        type="regPassword"
        mode="password"
        onChange={setRegPassword}
        placeholder={I18n.t('open_source_register_placeholder_password')}
      />
    </Form>
  );
};

export const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState('');
  const [readChecked, setReadChecked] = useState(false);

  const { login, register, loginLoading, registerLoading } = useLoginService({
    email,
    isLogin,
    password,
    regPassword,
  });

  const submitDisabled = isLogin
    ? !email || !password || hasError
    : !username ||
      !email ||
      !regPassword ||
      !phone ||
      !sms ||
      hasError ||
      !readChecked;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRegPassword('');
    setHasError(false);
  };

  const switchMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogin(!isLogin);
    resetForm();
  };

  // 强制设置页面标题
  useEffect(() => {
    const setTitle = () => {
      document.title = '猎鹰 - 登录';
    };

    // 立即设置
    setTitle();

    // 定期检查并重新设置标题，防止被其他代码覆盖
    const interval = setInterval(() => {
      if (document.title !== '猎鹰 - 登录') {
        setTitle();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <SignFrame className={isLogin ? 'min-h-[600px]' : 'min-h-[800px]'}>
      <SignPanel
        className={cls('flex w-[1000px]', isLogin ? 'h-[520px]' : 'h-[720px]')}
      >
        <div className={cls('w-[50%] h-full', styles.bgCover)} />
        <div className="flex flex-col items-center w-[50%] h-full">
          <div
            className="text-[24px] w-[320px] font-medium coze-fg-plug mt-[80px]"
            // eslint-disable-next-line risxss/catch-potential-xss-react
            dangerouslySetInnerHTML={{
              __html: I18n.t('open_source_login_welcome').replace(
                I18n.t('platform_name'),
                `<span class="${styles.sub}">${I18n.t('platform_name')}</span>`,
              ),
            }}
          />
          <div className="text-[14px] w-[320px] mt-[4px] coz-fg-secondary">
            {I18n.t('open_source_login_slogan')}
          </div>
          <div className="mt-[40px] w-[320px] flex flex-col items-stretch [&_.semi-input-wrapper]:overflow-hidden">
            {isLogin ? (
              <LoginForm
                setHasError={setHasError}
                setEmail={setEmail}
                login={login}
                setPassword={setPassword}
                submitDisabled={submitDisabled}
              />
            ) : (
              <RegisterForm
                hasError={hasError}
                setHasError={setHasError}
                setEmail={setEmail}
                setRegPassword={setRegPassword}
                setUsername={setUsername}
                setPhone={setPhone}
                phone={phone}
                setSms={setSms}
              />
            )}
            {isLogin ? (
              <div className="mt-[12px]">
                <Button
                  disabled={submitDisabled || registerLoading}
                  onClick={login}
                  loading={loginLoading}
                  color="hgltplus"
                  block
                  size="large"
                >
                  {I18n.t('login_button_text')}
                </Button>
                <div className="w-full text-center mt-[16px]">
                  <Typography.Text link onClick={switchMode}>
                    {I18n.t('register')}
                  </Typography.Text>
                </div>
              </div>
            ) : (
              <div className="mt-[12px]">
                <Checkbox
                  checked={readChecked}
                  onChange={e => {
                    setReadChecked(!!e.target.checked);
                  }}
                >
                  <div className="break-words">
                    <span>点击注册代表同意小易AI智能体平台的</span>
                    <Typography.Text link>《服务协议》</Typography.Text>
                    <span>和</span>
                    <Typography.Text link>《隐私协议》</Typography.Text>
                    <span>。</span>
                  </div>
                </Checkbox>
                <Button
                  className="mt-[24px]"
                  disabled={submitDisabled || loginLoading}
                  onClick={register}
                  loading={registerLoading}
                  color="hgltplus"
                  block
                  size="large"
                >
                  {I18n.t('register')}
                </Button>
                <div className="w-full text-center mt-[16px]">
                  <span className="text-[14px] coz-fg-secondary">
                    已有账号？
                  </span>
                  <Typography.Text link onClick={switchMode}>
                    {I18n.t('login')}
                  </Typography.Text>
                </div>
              </div>
            )}
          </div>
        </div>
      </SignPanel>
    </SignFrame>
  );
};
