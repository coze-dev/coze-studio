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

import { type FC, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { CollapsibleIconButton } from '@coze-studio/components/collapsible-icon-button';
import { updateQueryCollect } from '@coze-studio/bot-detail-store/save-manager';
import { useQueryCollectStore } from '@coze-studio/bot-detail-store/query-collect';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import {
  useGenerateLink,
  useGetUserQueryCollectOption,
} from '@coze-agent-ide/space-bot/hook';
import { IconCozEye } from '@coze-arch/coze-design/icons';
import { Modal, Switch, Form, type FormApi } from '@coze-arch/coze-design';

import { getUrlValue, isValidUrl } from './utils';
import { Tips } from './tips';
import { GenerateByTemplate } from './generate-by-template';

import s from './index.module.less';

const itemKey = Symbol.for('QueryCollect');

// eslint-disable-next-line @coze-arch/max-line-per-function
export const QueryCollect: FC = () => {
  const { privatePolicy, isCollect, setQueryCollect } = useQueryCollectStore(
    useShallow($store => ({
      isCollect: $store.is_collected,
      privatePolicy: $store.private_policy,
      setQueryCollect: $store.setQueryCollect,
    })),
  );
  const { queryCollectOption, supportText } = useGetUserQueryCollectOption();
  const isReadonly = useBotDetailIsReadonly();
  const { link, loading, runGenerate } = useGenerateLink();
  const formApi = useRef<FormApi<{ policyLink: string }>>();

  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [privacyUrl, setPrivacyUrl] = useState(privatePolicy);
  const privacyErrMsg = useRef('');

  const onClose = () => {
    setVisible(false);
  };
  const onOk = async () => {
    const policyLink = formApi.current?.getValue('policyLink');
    const queryCollectConf = {
      is_collected: checked,
      // cp-disable-next-line
      private_policy: checked ? `https://${policyLink}` : '',
    };
    const {
      data: { check_not_pass_msg, check_not_pass },
    } = await updateQueryCollect(queryCollectConf);
    privacyErrMsg.current = check_not_pass ? check_not_pass_msg ?? '' : '';
    await formApi.current?.validate();
    setQueryCollect(queryCollectConf);
    setVisible(false);
  };
  const openModal = () => {
    setVisible(true);
  };

  useEffect(() => {
    if (link) {
      formApi.current?.setValue('policyLink', getUrlValue(link));
      formApi.current?.validate();
    }
  }, [link]);

  useEffect(() => {
    setChecked(isCollect);
    formApi.current?.setValue('policyLink', getUrlValue(privatePolicy ?? ''));
  }, [visible, privatePolicy, isCollect]);

  useEffect(() => {
    privacyErrMsg.current = '';
  }, [privacyUrl]);

  return (
    <>
      <CollapsibleIconButton
        itemKey={itemKey}
        text={I18n.t('bot_dev_privacy_title')}
        icon={<IconCozEye className="text-[16px]" />}
        onClick={openModal}
      />

      <Modal
        width={480}
        visible={visible}
        onCancel={onClose}
        maskClosable={false}
        title={
          <span className="text-[20px]">{I18n.t('bot_dev_privacy_title')}</span>
        }
        cancelText={I18n.t('cancel')}
        okText={I18n.t('confirm')}
        className={s['query-collect-modal']}
        onOk={onOk}
        okButtonProps={{
          disabled: loading || isReadonly,
          style: { marginLeft: '8px' },
        }}
      >
        <div className="py-[16px]">
          <div className="flex items-center justify-between py-[16px] pl-[12px] pr-[24px] rounded-[8px] border border-solid border-[var(--coz-stroke-plus)]">
            <div className="flex items-center justify-center gap-[3px] ">
              <span className="coz-fg-plus text-[14px] font-normal leading-[20px] ">
                {I18n.t('bot_dev_privacy_setting_title')}
              </span>
              <Tips
                content={
                  I18n.t('bot_dev_privacy_setting_channel') + supportText
                }
                size="medium"
              />
            </div>
            <Switch
              checked={checked}
              size="small"
              onChange={v => setChecked(v)}
              disabled={loading || isReadonly}
            />
          </div>
          <div className="coz-fg-secondary text-[12px] font-normal leading-[16px] px-[8px] pt-[2px] pb-[18px]">
            {I18n.t('bot_dev_privacy_setting_desc')}
          </div>
          <div style={{ display: checked ? 'block' : 'none' }}>
            <Form<{ policyLink: string }>
              getFormApi={api => (formApi.current = api)}
              labelPosition="top"
              showValidateIcon={false}
              className={s['form-wrap']}
              autoComplete="off"
              disabled={loading || isReadonly}
            >
              <Form.Input
                field="policyLink"
                label={I18n.t('bot_dev_privacy_setting_link1')}
                style={{ width: '100%' }}
                trigger="blur"
                // cp-disable-next-line
                prefix="https://"
                stopValidateWithError
                maxLength={50}
                disabled={loading || isReadonly}
                placeholder={I18n.t('privacy_link_placeholder')}
                onChange={setPrivacyUrl}
                suffix={
                  IS_OVERSEA || isReadonly ? null : (
                    <GenerateByTemplate
                      handleGenerate={runGenerate}
                      loading={loading}
                      templateLink={
                        queryCollectOption?.private_policy_template || ''
                      }
                      link={link}
                    />
                  )
                }
                rules={[
                  {
                    validator: (_, value) => !checked || isValidUrl(value),
                    message: I18n.t('bot_dev_privacy_setting_invalid_link'),
                  },
                  {
                    validator: () => !checked || !privacyErrMsg.current,
                    message: () => privacyErrMsg.current,
                  },
                ]}
                helpText={
                  <div className="coz-fg-secondary text-[12px] font-normal leading-[16px] px-[8px] pt-[2px]">
                    {I18n.t('bot_dev_privacy_setting_link2')}
                  </div>
                }
              />
            </Form>
          </div>
        </div>
      </Modal>
    </>
  );
};
