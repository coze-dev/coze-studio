import classNames from 'classnames';
import { DotStatus } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFillPalette,
  IconCozLoading,
  IconCozWarningCircleFillPalette,
} from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

import s from './index.module.less';

export interface AvatarBackgroundNoticeDotProps {
  status: DotStatus;
}

export const AvatarBackgroundNoticeDot: React.FC<
  AvatarBackgroundNoticeDotProps
> = ({ status }) => {
  if (status === DotStatus.None || status === DotStatus.Cancel) {
    return null;
  }
  const dot = {
    [DotStatus.Generating]: (
      <Tooltip content={I18n.t('profilepicture_hover_generating')}>
        <IconCozLoading
          className={classNames(s.icon, s['icon-generating'])}
          spin={true}
        />
      </Tooltip>
    ),
    [DotStatus.Success]: (
      <Tooltip content={I18n.t('profilepicture_hover_generated')}>
        <IconCozCheckMarkCircleFillPalette
          className={classNames(s.icon, s['icon-success'])}
        />
      </Tooltip>
    ),
    [DotStatus.Fail]: (
      <Tooltip content={I18n.t('profilepicture_hover_failed')}>
        <IconCozWarningCircleFillPalette
          className={classNames(s.icon, s['icon-fail'])}
        />
      </Tooltip>
    ),
  };
  return (
    <div
      className={classNames(
        s.ctn,
        status === DotStatus.Generating ? s.loading : undefined,
      )}
    >
      {dot[status]}
    </div>
  );
};
