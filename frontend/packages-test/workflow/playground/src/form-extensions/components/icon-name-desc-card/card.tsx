import { type FC, type ReactNode } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Avatar } from '@coze-arch/coze-design';
import { type Position } from '@coze-arch/bot-semi/Tooltip';

import { Text } from '../text';
import { TooltipAction } from './tooltip-action';

interface IconNameDescProps {
  icon?: string | React.ReactNode;
  name?: string;
  description?: string;
  onRemove?: () => void;
  readonly?: boolean;
  onClick?: () => void;
  actions?: ReactNode;
  testID?: string;
  nameSuffix?: ReactNode | string;
  isInvalid?: boolean;
  showDeleteBtn?: boolean;
  alwaysShowActions?: boolean;
  className?: string;
  descriptionTooltipPosition?: Position;
}

export const IconNameDescCard: FC<IconNameDescProps> = props => {
  const {
    name,
    icon,
    description,
    onRemove,
    onClick,
    readonly,
    actions,
    testID,
    nameSuffix,
    isInvalid,
    showDeleteBtn = true,
    alwaysShowActions = false,
    className,
    descriptionTooltipPosition,
  } = props;

  return (
    <div
      className={classnames(
        'group coz-stroke-primary coz-mg-card p-2.5 rounded-lg border border-solid flex items-center gap-2.5 mb-2 last:mb-0 hover:coz-mg-secondary',
        {
          'cursor-pointer hover:cursor-pointer': onClick && !isInvalid,
          'cursor-not-allowed': isInvalid,
        },
        className,
      )}
      onClick={readonly ? undefined : onClick}
      data-testid={testID}
    >
      <div
        className="h-8"
        style={{
          flex: '0 0 32px',
        }}
      >
        {icon ? (
          typeof icon === 'string' ? (
            <Avatar
              src={icon}
              size="small"
              className="coz-stroke-primary rounded-mini overflow-hidden border border-solid"
            />
          ) : (
            icon
          )
        ) : null}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center">
          <Text
            className="!coz-fg-primary !leading-mini !font-medium !text-base"
            text={name}
          />
          {nameSuffix ? (
            <div className="flex items-center ml-[4px]">{nameSuffix}</div>
          ) : null}
        </div>
        <Text
          className="!coz-fg-secondary !leading-mini !font-normal !text-base"
          text={description}
          tooltipPosition={descriptionTooltipPosition}
        />
      </div>
      <div
        className={classnames('flex-0', {
          'hidden group-hover:block': !alwaysShowActions,
        })}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className="flex gap-1.5">
          {readonly ? (
            <></>
          ) : (
            <>
              {actions ?? undefined}
              {showDeleteBtn ? (
                <TooltipAction
                  tooltip={I18n.t('Remove')}
                  icon={<IconCozTrashCan />}
                  onClick={onRemove}
                  testID={`${testID}.remove`}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
