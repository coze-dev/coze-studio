import { type FC, useState } from 'react';

import { CozeBrand } from '@coze-studio/components/coze-brand';
import { I18n } from '@coze-arch/i18n';
import { SignFrame, SignPanel } from '@coze-arch/bot-semi';
import { Button, Form } from '@coze/coze-design';

import { useLoginService } from './service';
import { Favicon } from './favicon';

export const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

  const { login, register, loginLoading, registerLoading } = useLoginService({
    email,
    password,
  });

  return (
    <SignFrame brandNode={<CozeBrand isOversea={IS_OVERSEA} />}>
      <SignPanel className="w-[600px] h-[640px] pt-[96px]">
        <div className="flex flex-col items-center w-full h-full">
          <Favicon />
          <div className="text-[24px] font-medium coze-fg-plug leading-[36px] mt-[32px]">
            {I18n.t('open_source_login_welcome')}
          </div>
          <div className="mt-[64px] w-[320px] flex flex-col items-stretch [&_.semi-input-wrapper]:overflow-hidden">
            <Form
              onErrorChange={errors => {
                setHasError(Object.keys(errors).length > 0);
              }}
            >
              <Form.Input
                noLabel
                type="email"
                field="email"
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
                noLabel
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
              />
            </Form>
            <Button
              className="mt-[12px]"
              disabled={hasError || registerLoading}
              onClick={login}
              loading={loginLoading}
              color="hgltplus"
            >
              {I18n.t('login_button_text')}
            </Button>
            <Button
              className="mt-[20px]"
              disabled={hasError || loginLoading}
              onClick={register}
              loading={registerLoading}
              color="primary"
            >
              {I18n.t('register')}
            </Button>
            <div className="mt-[12px] flex justify-center">
              <a href="" target="_blank" className="no-underline coz-fg-hglt">
                {I18n.t('open_source_terms_linkname')}
              </a>
            </div>
          </div>
        </div>
      </SignPanel>
    </SignFrame>
  );
};
