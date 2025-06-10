import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze/coze-design/icons';
import {
  RadioGroup,
  Typography,
  Radio,
  AIButton,
  Popover,
} from '@coze/coze-design';

import css from './generate-mode-select.module.less';

export enum GenerateMode {
  Complete,
  Cover,
}

interface GenerateModeSelectProps {
  value: GenerateMode;
  disabled?: boolean;
  className?: string;
  onChange: (v: GenerateMode) => void;
}

export const GenerateModeSelect: React.FC<GenerateModeSelectProps> = ({
  value,
  onChange,
  ...props
}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleChange = (v: GenerateMode) => {
    onChange(v);
    handleClose();
  };
  const handleToggle = (v: boolean) => {
    v ? handleOpen() : handleClose();
  };
  const handleOpen = () => {
    setPopoverVisible(true);
  };
  const handleClose = () => {
    setPopoverVisible(false);
  };

  return (
    <Popover
      content={
        <div className={css['popover-content']}>
          <Typography.Text strong fontSize="14px">
            {I18n.t('wf_testrun_ai_button_popover')}
          </Typography.Text>
          <RadioGroup
            direction="vertical"
            className={css['radio-group']}
            value={value}
            mode="advanced"
            type="pureCard"
            onChange={e => handleChange(e.target.value)}
          >
            <Radio
              value={GenerateMode.Complete}
              extra={I18n.t('wf_testrun_ai_button_popover_complete_extra')}
            >
              {I18n.t('wf_testrun_ai_button_popover_complete')}
            </Radio>
            <Radio
              value={GenerateMode.Cover}
              extra={I18n.t('wf_testrun_ai_button_popover_cover_extra')}
            >
              {I18n.t('wf_testrun_ai_button_popover_cover')}
            </Radio>
          </RadioGroup>
        </div>
      }
      trigger="custom"
      visible={popoverVisible}
      onVisibleChange={handleToggle}
      onClickOutSide={handleClose}
    >
      <AIButton
        onlyIcon
        color="aihglt"
        size="small"
        icon={
          <IconCozArrowDown
            className={popoverVisible ? css.opened : undefined}
          />
        }
        onClick={handleOpen}
        {...props}
      />
    </Popover>
  );
};
