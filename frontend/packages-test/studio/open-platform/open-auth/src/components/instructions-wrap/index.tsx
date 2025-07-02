import { type ReactNode, type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Typography, Space } from '@coze-arch/coze-design';

import styles from './index.module.less';
export const LinkDocs: FC<{ text?: string; onClick?: () => void }> = ({
  text,
  onClick,
}) => (
  <Typography.Text
    className="text-[12px] !font-normal"
    link
    onClick={() => {
      onClick?.();
    }}
  >
    {text ? text : I18n.t('coze_api_instru')}
  </Typography.Text>
);

export const PATInstructionWrap: FC<{
  onClick?: () => void;
}> = ({ onClick }) => (
  <div className={styles['message-frame']}>
    <Space spacing={0}>
      <p>{I18n.t('pat_reminder_1')}</p>
      <LinkDocs onClick={onClick} />
    </Space>
    <p>{I18n.t('pat_reminder_2')}</p>
    {IS_OVERSEA ? <p>{I18n.t('api_token_reminder_1')}</p> : null}
  </div>
);

export const Tips: FC<{ tips: string | ReactNode; className?: string }> = ({
  tips,
  className,
}) => (
  <Tooltip theme="dark" trigger="hover" content={tips}>
    <div
      className={classNames(
        'flex items-center justify-center hover:coz-mg-secondary-hovered w-[16px] h-[16px] rounded-[4px] mr-[4px] ml-[2px] text-[12px]',
        className,
      )}
    >
      <IconCozInfoCircle className="coz-fg-secondary" />
    </div>
  </Tooltip>
);
