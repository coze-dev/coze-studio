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

import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';

import { get } from 'lodash-es';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import { IconCozTamplate } from '@coze-arch/coze-design/icons';
import {
  Button,
  Form,
  type FormApi,
  IconButton,
  Popover,
  Typography,
} from '@coze-arch/coze-design';
import { type GenerateUserQueryCollectPolicyRequest } from '@coze-arch/bot-api/playground_api';

import { Tips } from './tips';

import s from './index.module.less';

const options = [
  {
    label: I18n.t('bot_dev_privacy_setting_conversation'),
    value: I18n.t('bot_dev_privacy_setting_conversation'),
  },
];
const defaultOptionsValue = [I18n.t('bot_dev_privacy_setting_conversation')];
interface GenerateByTemplateProps {
  handleGenerate: (v: GenerateUserQueryCollectPolicyRequest) => void;
  loading: boolean;
  templateLink: string;
  link: string;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const GenerateByTemplate: FC<GenerateByTemplateProps> = ({
  handleGenerate,
  loading,
  templateLink,
  link,
}) => {
  const { botId } = useBotInfoStore($store => ({
    botId: $store.botId,
  }));
  const [visible, setVisible] = useState(false);
  const [configInfo, setConfigInfo] =
    useState<GenerateUserQueryCollectPolicyRequest>();
  const [isFailToValid, setIsFailToValid] = useState(true);

  const formApi = useRef<FormApi<GenerateUserQueryCollectPolicyRequest>>();

  const onFormValueChange = (values: GenerateUserQueryCollectPolicyRequest) => {
    const developerName = get(values, 'developer_name');
    const contactInformation = get(values, 'contact_information');
    setIsFailToValid(!(developerName && contactInformation));
    setConfigInfo({
      ...values,
    });
  };

  const onVisibleChange = (isVisble: boolean) => {
    if (isVisble) {
      setDefaultValue();
    }
  };

  const setDefaultValue = () => {
    if (configInfo) {
      formApi.current?.setValue('developer_name', configInfo.developer_name);
      formApi.current?.setValue(
        'contact_information',
        configInfo.contact_information,
      );
    }
  };
  useEffect(() => {
    if (link) {
      setConfigInfo({ developer_name: '', contact_information: '' });
      setVisible(false);
    }
  }, [link]);

  const onClickGenerate = () => {
    handleGenerate({ ...configInfo, bot_id: botId });
  };
  const onOpen = (e: MouseEvent) => {
    e.stopPropagation();
    setVisible(true);
  };
  return (
    <Popover
      position="right"
      trigger="custom"
      stopPropagation={true}
      onVisibleChange={onVisibleChange}
      visible={visible}
      onClickOutSide={() => setVisible(false)}
      content={
        <div className="p-[16px] w-[320px]">
          <div className="coz-fg-plus text-[20px] font-medium leading-[32px]">
            {I18n.t('bot_dev_privacy_setting_privacy_template_1')}
          </div>
          <div className="coz-fg-primary text-[14px] font-normal leading-[20px] pb-[12px]">
            {I18n.t('bot_dev_privacy_setting_privacy_template_2', {
              privacy_template: (
                <Typography.Text link onClick={() => window.open(templateLink)}>
                  {I18n.t('bot_dev_privacy_setting_privacy_template_3')}
                </Typography.Text>
              ),
            })}
          </div>
          <div>
            <Form<GenerateUserQueryCollectPolicyRequest>
              getFormApi={api => (formApi.current = api)}
              labelPosition="top"
              showValidateIcon={false}
              className={s['form-wrap']}
              onValueChange={values =>
                onFormValueChange(
                  values as GenerateUserQueryCollectPolicyRequest,
                )
              }
              autoComplete="off"
              disabled={loading}
            >
              <Form.Input
                field="developer_name"
                label={I18n.t('bot_dev_privacy_setting_developer_name')}
                style={{ width: '100%' }}
                trigger="blur"
                maxLength={50}
                placeholder={I18n.t(
                  'bot_dev_privacy_setting_developer_collect3',
                )}
                rules={[
                  {
                    required: true,
                    message: I18n.t(
                      'bot_dev_privacy_setting_developer_collect3',
                    ),
                  },
                ]}
              />
              <Form.Select
                field="collect_detail"
                label={{
                  text: I18n.t('bot_dev_privacy_setting_developer_collect1'),
                  extra: (
                    <Tips
                      content={I18n.t(
                        'bot_dev_privacy_setting_developer_collect7',
                      )}
                      size="small"
                    />
                  ),
                }}
                optionList={options}
                disabled
                initValue={defaultOptionsValue}
                style={{ width: '100%' }}
                placeholder={I18n.t(
                  'bot_dev_privacy_setting_developer_collect4',
                )}
                rules={[
                  {
                    required: true,
                    message: I18n.t(
                      'bot_dev_privacy_setting_developer_collect4',
                    ),
                  },
                ]}
              />

              <Form.Input
                field="contact_information"
                label={I18n.t('bot_dev_privacy_setting_developer_collect2')}
                style={{ width: '100%' }}
                trigger="blur"
                maxLength={50}
                placeholder={I18n.t(
                  'bot_dev_privacy_setting_developer_collect5',
                )}
                rules={[
                  {
                    required: true,
                    message: I18n.t(
                      'bot_dev_privacy_setting_developer_collect5',
                    ),
                  },
                ]}
              />
            </Form>
          </div>
          <div className="flex justify-end mt-[12px]">
            <Button
              loading={loading}
              onClick={onClickGenerate}
              disabled={isFailToValid}
            >
              {I18n.t(
                loading
                  ? 'bot_dev_privacy_setting_generate_link2'
                  : 'bot_dev_privacy_setting_generate_link1',
              )}
            </Button>
          </div>
        </div>
      }
    >
      <IconButton
        icon={<IconCozTamplate />}
        iconPosition="left"
        color="secondary"
        size="small"
        onClick={onOpen}
      >
        {I18n.t('bot_dev_privacy_setting_privacy_template')}
      </IconButton>
    </Popover>
  );
};
