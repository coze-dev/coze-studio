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

import { type FC } from 'react';

import cls from 'classnames';
import { type explore } from '@coze-studio/api-schema';
import { I18n } from '@coze-arch/i18n';
import { Avatar, Space, Tag, Toast, Tooltip } from '@coze-arch/coze-design';

import { PluginAuthMode, type AuthMode } from '../type';
import { CardInfo } from '../components/info';
import { CardContainer, CardSkeletonContainer } from '../components/container';
import { CardButton } from '../components/button';

import styles from './index.module.less';

interface ProductInfo extends explore.ProductInfo {
  plugin_extra: explore.ProductInfo['plugin_extra'] & AuthMode;
}

export type PluginCardProps = ProductInfo & {
  isInstalled?: boolean;
  isShowInstallButton?: boolean;
  className?: string;
};

export const PluginCard: FC<PluginCardProps> = props => (
  <CardContainer
    className={cls(styles.plugin, props.className)}
    shadowMode="default"
    onClick={() => {
      const url = props?.plugin_extra?.jump_saas_url;

      if (url) {
        window.open(url, '_blank');
      }
    }}
  >
    <div className={styles['plugin-wrapper']}>
      <PluginCardBody {...props} />
      <Space
        className={cls(styles['btn-container'], {
          [styles['one-column-grid']]:
            props.isInstalled || !props.isShowInstallButton,
        })}
      >
        {!props.isInstalled && props.isShowInstallButton ? (
          <CardButton
            onClick={() => {
              Toast.success(I18n.t('plugin_install_success'));
            }}
          >
            {I18n.t('plugin_store_install')}
          </CardButton>
        ) : null}
      </Space>
    </div>
  </CardContainer>
);

export const PluginCardSkeleton = () => (
  <CardSkeletonContainer className={cls('h-[186px]', styles.plugin)} />
);

const PluginCardBody: FC<PluginCardProps> = props => {
  const renderCardTag = () => {
    if (
      props.plugin_extra.auth_mode === PluginAuthMode.Required ||
      props.plugin_extra.auth_mode === PluginAuthMode.Supported
    ) {
      return (
        <Tag
          color={'yellow'}
          className="h-[20px] !px-[4px] !py-[2px] coz-fg-primary font-medium shrink-0"
        >
          <span className="ml-[2px]">
            {I18n.t('plugin_store_unauthorized')}
          </span>
        </Tag>
      );
    } else if (props.plugin_extra.auth_mode === PluginAuthMode.Configured) {
      return (
        <Tooltip content={I18n.t('plugin_store_contact_deployer')}>
          <Tag
            color={'brand'}
            className="h-[20px] !px-[4px] !py-[2px] coz-fg-primary font-medium shrink-0"
          >
            <span className="ml-[2px]">
              {I18n.t('plugin_store_authorized')}
            </span>
          </Tag>
        </Tooltip>
      );
    }
    return null;
  };
  return (
    <div>
      <Avatar
        className={styles['card-avatar']}
        src={props.meta_info?.icon_url}
        shape="square"
      />
      <CardInfo
        {...{
          title: props.meta_info?.name,
          description: props.meta_info?.description,
          userInfo: props.meta_info?.user_info,
          authMode: props.plugin_extra.auth_mode,
          renderCardTag,
        }}
      />
    </div>
  );
};
