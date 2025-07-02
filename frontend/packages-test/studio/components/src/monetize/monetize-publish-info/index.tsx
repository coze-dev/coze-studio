import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Avatar, Tooltip } from '@coze-arch/coze-design';
import { type PublishConnectorInfo } from '@coze-arch/bot-api/developer_api';
import { type BotMonetizationConfigData } from '@coze-arch/bot-api/benefit';

export function MonetizePublishInfo({
  className,
  monetizeConfig,
  supportPlatforms,
}: {
  className?: string;
  monetizeConfig: BotMonetizationConfigData;
  supportPlatforms: Array<Pick<PublishConnectorInfo, 'id' | 'name' | 'icon'>>;
}) {
  const supportPlatformsText = supportPlatforms.map(p => p.name).join(', ');

  return (
    <div className={cls('flex justify-end items-center gap-[12px]', className)}>
      <div className="flex items-center gap-[4px]">
        <span className="font-medium coz-fg-plus">
          {`${I18n.t('monetization')}: ${
            monetizeConfig.is_enable
              ? I18n.t('monetization_publish_on')
              : I18n.t('monetization_publish_off')
          }`}
        </span>
        <Tooltip
          content={
            <div className="flex flex-col">
              <div>
                {monetizeConfig.is_enable
                  ? I18n.t('monetization_on_des')
                  : I18n.t('monetization_off_des')}
              </div>
              {monetizeConfig.is_enable ? (
                <div className="mt-[8px] pt-[8px] border-0 border-t border-solid coz-stroke-primary">
                  {`${I18n.t('free_chat_allowance')} : ${
                    monetizeConfig.free_chat_allowance_count
                  }`}
                </div>
              ) : null}
            </div>
          }
        >
          <IconCozInfoCircle className="w-[16px] h-[16px] coz-fg-secondary" />
        </Tooltip>
      </div>

      <div className="flex items-center gap-[4px]">
        <span className="font-normal coz-fg-tertiary">
          {I18n.t('monetization_support')}:
        </span>
        <span className="flex items-center gap-[4px]">
          {supportPlatforms.map(p => (
            <Avatar
              key={p.id}
              className="h-[16px] w-[16px] rounded-[4px]"
              size="extra-extra-small"
              shape="square"
              src={p.icon}
            />
          ))}
        </span>
        <Tooltip
          content={`${I18n.t(
            'monetization_support_tips',
          )}: ${supportPlatformsText}`}
        >
          <IconCozInfoCircle className="w-[16px] h-[16px] coz-fg-secondary" />
        </Tooltip>
      </div>
    </div>
  );
}
