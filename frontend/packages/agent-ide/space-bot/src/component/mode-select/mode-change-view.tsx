import { type ReactNode } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography, Popover, Radio } from '@coze-arch/bot-semi';
import { BotMode } from '@coze-arch/bot-api/developer_api';

import { ChangeButton } from './change-button';

import s from './index.module.less';

export interface ModeLabelProps {
  icon: ReactNode;
  isDisabled: boolean;
  isSelected: boolean;
  title: ReactNode;
  desc: ReactNode;
}
export const ModeLabel: React.FC<ModeLabelProps> = ({
  icon,
  isDisabled,
  isSelected,
  title,
  desc,
}) => (
  <div className={classNames('flex items-center gap-[12px]')}>
    <div
      className={
        (classNames('text-[16px]'),
        isDisabled ? 'coz-fg-dim' : 'coz-fg-primary')
      }
    >
      {icon}
    </div>
    <div data-testid={`bot-edit-agent-select-mode-button-${title}`}>
      <div
        className={classNames(
          'text-[16px] leading-[22px]',
          isSelected ? 'font-[500]' : 'font-[400]',
          isDisabled ? 'coz-fg-dim' : 'coz-fg-primary',
        )}
      >
        {/* {Number(key) === BotMode.WorkflowMode ? (
          <div className="flex items-center">
            {value.title}
            <div className="ml-[12px] rounded-[9px] coz-mg-hglt-plus coz-shadow-default px-[4px] h-[16px] text-[12px] font-[500] leading-[16px] coz-fg-white">
              {I18n.t('singleagent_workflow_mode_beta')}
            </div>
          </div>
        ) : (
          value.title
        )} */}
        {title}
      </div>
      <Typography.Text
        className={classNames(
          'mt-[4px]',
          'text-[14px] font-[400] leading-[20px]',
          isDisabled ? 'coz-fg-dim' : 'coz-fg-secondary',
        )}
      >
        {desc}
      </Typography.Text>
    </div>
  </div>
);

export interface ModeOption
  extends Omit<ModeLabelProps, 'isSelected' | 'isDisabled'> {
  value: BotMode;
  showText: boolean;
  getIsDisabled: (params: { currentMode: BotMode }) => boolean;
}

export interface ModeChangeViewProps {
  modeSelectLoading: boolean;
  modeValue: BotMode;
  onModeChange: (value: BotMode) => Promise<void>;
  isReadOnly: boolean;
  optionList: ModeOption[];
  tooltip?: string;
}
export const ModeChangeView = (props: ModeChangeViewProps) => {
  const {
    modeValue = BotMode.SingleMode,
    onModeChange,
    modeSelectLoading,
    isReadOnly,
    tooltip,
    optionList,
  } = props;
  const disabled = isReadOnly || modeSelectLoading;
  const modeInfo = optionList.find(option => option.value === modeValue);
  if (disabled) {
    return (
      <ChangeButton disabled={disabled} tooltip={tooltip} modeInfo={modeInfo} />
    );
  }

  return (
    <Popover
      className={s['mode-change-popover']}
      data-testid="bot-detail.mode-chage-view.popover"
      trigger="click"
      position="bottomLeft"
      autoAdjustOverflow={false}
      content={
        <div className={s['mode-change-popover-content']}>
          <div className="coz-fg-plus text-[14px] font-[500] leading-[20px] mb-[12px]">
            {I18n.t('chatflow_switch_mode_title')}
          </div>
          <Radio.Group
            type="pureCard"
            direction="vertical"
            value={modeValue}
            defaultValue={modeValue}
            disabled={disabled}
            options={optionList.map(option => {
              const isSelected = modeValue === option.value;
              const isDisabled = option.getIsDisabled({
                currentMode: modeValue,
              });
              return {
                value: option.value,
                disabled: isDisabled,
                label: (
                  <ModeLabel
                    {...option}
                    key={option.value}
                    isDisabled={isDisabled}
                    isSelected={isSelected}
                  />
                ),
              };
            })}
            onChange={e => onModeChange(e.target.value)}
          />
        </div>
      }
    >
      <div>
        <ChangeButton disabled={false} modeInfo={modeInfo} />
      </div>
    </Popover>
  );
};
