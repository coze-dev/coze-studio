import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozEdit, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Typography, CozAvatar, IconButton } from '@coze-arch/coze-design';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/workflow_api';

import { BackgroundModal } from './background-upload';

import css from './role-background.module.less';

interface RoleBackgroundProps {
  value?: BackgroundImageInfo;
  disabled?: boolean;
  onChange: (v: BackgroundImageInfo) => void;
}

export const RoleBackground: React.FC<RoleBackgroundProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);
  const url = value?.web_background_image?.origin_image_url;

  return (
    <div>
      <Typography.Text size="small" type="secondary">
        {I18n.t('bgi_desc')}
      </Typography.Text>

      {url ? (
        <div className={css['bg-block']}>
          <CozAvatar src={url} type="platform" />
          <div className={css['op-btns']}>
            <IconButton
              icon={<IconCozEdit />}
              color="secondary"
              size="small"
              disabled={disabled}
              onClick={() => setVisible(true)}
            />
            <IconButton
              icon={<IconCozTrashCan />}
              color="secondary"
              size="small"
              disabled={disabled}
              onClick={() => onChange({})}
            />
          </div>
          <BackgroundModal
            visible={visible}
            value={value}
            onCancel={() => setVisible(false)}
            onChange={onChange}
          />
        </div>
      ) : null}
    </div>
  );
};
