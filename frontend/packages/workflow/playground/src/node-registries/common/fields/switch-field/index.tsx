import { useNodeTestId } from '@coze-workflow/base';
import { IconInfo } from '@coze-arch/bot-icons';
import { Switch } from '@coze/coze-design';

import AutoSizeTooltip from '@/ui-components/auto-size-tooltip';
import { withField, useField } from '@/form';

import styles from './index.module.less';
export interface SwitchFieldProps {
  customLabel?: string;
  customTooltip?: string;
  testId?: string;
  customStyles?: React.CSSProperties;
  labelStyles?: React.CSSProperties;
  switchCustomStyles?: React.CSSProperties;
}
export const SwitchField = withField<SwitchFieldProps, boolean>(
  ({
    testId,
    customLabel,
    customTooltip,
    customStyles,
    labelStyles,
    switchCustomStyles,
  }) => {
    const { getNodeSetterId } = useNodeTestId();
    const { value, onChange, readonly } = useField<boolean>();
    return (
      <div className={styles.switchContainer} style={customStyles}>
        {customLabel ? (
          <div className={styles.label} style={labelStyles}>
            {customLabel}
          </div>
        ) : null}
        {customTooltip ? (
          <AutoSizeTooltip
            showArrow
            position="top"
            className={styles.popover}
            content={customTooltip}
          >
            <IconInfo className={styles.icon} />
          </AutoSizeTooltip>
        ) : null}
        <Switch
          data-testid={getNodeSetterId(testId ?? '')}
          disabled={readonly}
          size="mini"
          checked={value}
          onChange={onChange}
          style={switchCustomStyles}
        />
      </div>
    );
  },
);
