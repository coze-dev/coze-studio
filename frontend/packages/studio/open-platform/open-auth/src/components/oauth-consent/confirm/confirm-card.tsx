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

// start_aigc
import { useEffect, useState } from 'react';

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozWarningCircleFillPalette } from '@coze-arch/coze-design/icons';
import { Image, Spin, Button, Typography } from '@coze-arch/coze-design';
import { type PluginOauthInfo } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

interface IConfirmCardProps {
  confirmCode: string;
}

const PluginOauthInfoContent = ({
  pluginOauthInfo,
  confirmCode,
}: {
  pluginOauthInfo: PluginOauthInfo;
  confirmCode: string;
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const getPluginUrl = () => {
    if (!pluginOauthInfo?.plugin_url) {
      return '';
    }
    if (pluginOauthInfo?.plugin_url?.startsWith('http')) {
      return pluginOauthInfo?.plugin_url;
    }
    return `https://${pluginOauthInfo?.plugin_url}`;
  };

  const handleCancel = () => {
    window.close();
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    const pluginOauthConfirm = await DeveloperApi.PluginOauthConfirm({
      confirm_code: confirmCode,
    });
    setConfirmLoading(false);
    if (pluginOauthConfirm.code === 0) {
      window.location.replace('/information/auth/success');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex flex-col items-center gap-[32px]">
        <Image
          src={pluginOauthInfo?.plugin_icon}
          width={56}
          height={56}
          className="border border-solid coz-stroke-plus"
        />
        <div className="w-full flex flex-col items-center gap-[20px]">
          <Typography.Text
            className="w-full text-[20px] leading-[28px] !font-medium text-center !coz-fg-primary"
            ellipsis={{
              showTooltip: true,
              rows: 1,
            }}
          >
            {I18n.t(
              'plugin_oauth_info_confirm_page_title' as I18nKeysNoOptionsType,
              {
                plugin_name: pluginOauthInfo?.plugin_name,
              },
            )}
          </Typography.Text>
          <div className="w-full flex flex-col gap-[8px] items-center">
            <div className="w-full flex items-center justify-center">
              <Typography.Text className="flex-shrink-0 text-[14px] leading-[20px] text-center font-normal coz-fg-secondary">
                {I18n.t(
                  'plugin_oauth_info_confirm_page_plugin_url' as I18nKeysNoOptionsType,
                )}
              </Typography.Text>
              <Typography.Text
                className="text-[14px] leading-[20px] text-center font-normal coz-fg-secondary "
                ellipsis={{
                  showTooltip: true,
                  rows: 1,
                }}
                link={{
                  target: '_blank',
                  href: getPluginUrl(),
                  className: '!coz-fg-secondary !underline',
                }}
                underline={true}
              >
                {pluginOauthInfo?.plugin_url}
              </Typography.Text>
            </div>
            <Typography.Text
              className="text-[14px] leading-[20px] text-center font-normal coz-fg-secondary"
              ellipsis={{
                showTooltip: true,
                rows: 1,
              }}
            >
              {I18n.t(
                'plugin_oauth_info_confirm_page_to_acct' as I18nKeysNoOptionsType,
              )}
              {pluginOauthInfo?.username}
            </Typography.Text>
            <Typography.Text
              className="text-[14px] leading-[20px] text-center font-normal coz-fg-secondary"
              ellipsis={{
                showTooltip: true,
                rows: 1,
              }}
            >
              {I18n.t(
                'plugin_oauth_info_confirm_page_channel' as I18nKeysNoOptionsType,
              )}
              {pluginOauthInfo?.connector_name}
            </Typography.Text>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-[32px]">
        <p className="w-full flex items-center justify-center gap-[4px]">
          <IconCozWarningCircleFillPalette
            width="16"
            height="16"
            color="var(--coz-fg-hglt-yellow)"
          />
          <span className="text-[14px] leading-[20px] text-center coz-fg-secondary">
            {I18n.t(
              'plugin_oauth_info_confirm_page_tips' as I18nKeysNoOptionsType,
            )}
          </span>
        </p>
        <div className="flex justify-between items-center">
          <Button
            color="primary"
            size="large"
            className="w-[200px]"
            onClick={handleCancel}
          >
            {I18n.t(
              'plugin_oauth_info_confirm_page_cancel' as I18nKeysNoOptionsType,
            )}
          </Button>
          <Button
            color="hgltplus"
            size="large"
            className="w-[200px]"
            onClick={handleConfirm}
            loading={confirmLoading}
          >
            {I18n.t(
              'plugin_oauth_info_confirm_page_confirm' as I18nKeysNoOptionsType,
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmCard = ({ confirmCode }: IConfirmCardProps) => {
  const [pluginOauthInfo, setPluginOauthInfo] = useState<PluginOauthInfo>();

  useEffect(() => {
    if (!confirmCode) {
      return;
    }

    const getPluginOauthInfo = async (code: string) => {
      const pluginOauthInfoResp = await DeveloperApi.PluginOauthInfo({
        confirm_code: code,
      });
      if (pluginOauthInfoResp.data) {
        setPluginOauthInfo(pluginOauthInfoResp.data);
      }
    };

    getPluginOauthInfo(confirmCode);

    return () => {
      setPluginOauthInfo(undefined);
    };
  }, [confirmCode]);

  const renderContent = () => {
    if (!pluginOauthInfo) {
      return (
        <div className="flex justify-center items-center w-full h-full">
          <Spin />
        </div>
      );
    }

    return (
      <PluginOauthInfoContent
        pluginOauthInfo={pluginOauthInfo}
        confirmCode={confirmCode}
      />
    );
  };

  return (
    <div className="flex flex-col w-[492px] h-[547px] px-[40px] pt-[100px] pb-[60px] border border-solid coz-stroke-primary rounded-xl">
      {renderContent()}
    </div>
  );
};
// end_aigc
