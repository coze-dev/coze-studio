import { type FC } from 'react';

import cls from 'classnames';
import { type explore } from '@coze-studio/api-schema';
import { I18n } from '@coze-arch/i18n';
import { Avatar, Space, Tag, Toast } from '@coze-arch/coze-design';

import { cozeBaseUrl } from '@/const/url';

import { CardInfo } from '../components/info';
import { CardContainer, CardSkeletonContainer } from '../components/container';
import { CardButton } from '../components/button';

import styles from './index.module.less';

type ProductInfo = explore.ProductInfo;

export type PluginCardProps = ProductInfo & {
  isInstalled?: boolean;
  isShowInstallButton?: boolean;
};
export const PluginCard: FC<PluginCardProps> = props => (
  <CardContainer
    className={styles.plugin}
    shadowMode="default"
    onClick={() => {
      console.log('CardContainer...');
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
        <CardButton
          onClick={() => {
            window.open(
              `${cozeBaseUrl}/store/plugin/${props.meta_info?.id}?from=plugin_card`,
            );
          }}
        >
          {I18n.t('plugin_store_view_details')}
        </CardButton>
      </Space>
    </div>
  </CardContainer>
);

export const PluginCardSkeleton = () => (
  <CardSkeletonContainer className={cls('h-[186px]', styles.plugin)} />
);

const PluginCardBody: FC<PluginCardProps> = props => (
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
        renderCardTag: () =>
          props.isInstalled && props.isShowInstallButton ? (
            <Tag
              color={'brand'}
              className="h-[20px] !px-[4px] !py-[2px] coz-fg-primary font-medium shrink-0"
            >
              <span className="ml-[2px]">
                {I18n.t('plugin_store_installed')}
              </span>
            </Tag>
          ) : null,
        descClassName: styles.description,
      }}
    />
  </div>
);
