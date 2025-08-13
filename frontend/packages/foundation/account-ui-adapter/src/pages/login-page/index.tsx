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

import { type FC, useState } from 'react';

// import { CozeBrand } from '@coze-studio/components/coze-brand';
import { I18n } from '@coze-arch/i18n';
import { Button, Form } from '@coze-arch/coze-design';
import { SignFrame, SignPanel } from '@coze-arch/bot-semi';

import { useLoginService } from './service';

import cls from 'classnames';
import styles from './index.module.less';

import svgEmail from './icon-email.svg';
import svgPassword from './icon-pswd.svg';

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

export const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

  const { login, register, loginLoading, registerLoading } = useLoginService({
    email,
    password,
  });

  const submitDisabled = !email || !password || hasError;

  return (
    <SignFrame>
      <SignPanel className="flex w-[1000px] h-[520px]">
        <div className={cls('w-[50%] h-full', styles.bgCover)}></div>
        <div className="flex flex-col items-center w-[50%] h-full">
          <div
            className="text-[24px] w-[320px] font-medium coze-fg-plug mt-[80px]"
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
            <Form
              onErrorChange={errors => {
                setHasError(Object.keys(errors).length > 0);
              }}
            >
              <Form.Input
                data-testid="login.input.email"
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
                onChange={newVal => {
                  setEmail(newVal);
                }}
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
            <Button
              data-testid="login.button.login"
              className="mt-[12px]"
              disabled={submitDisabled || registerLoading}
              onClick={login}
              loading={loginLoading}
              color="hgltplus"
              size="large"
            >
              {I18n.t('login_button_text')}
            </Button>
            <Button
              data-testid="login.button.signup"
              className="mt-[20px]"
              disabled={submitDisabled || loginLoading}
              onClick={register}
              loading={registerLoading}
              color="primary"
              size="large"
            >
              {I18n.t('register')}
            </Button>
          </div>
        </div>
      </SignPanel>
    </SignFrame>
  );
};
