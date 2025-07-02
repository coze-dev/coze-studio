import { clsx } from 'clsx';
import {
  JsonEditor,
  safeFormatJsonString,
} from '@coze-workflow/test-run-shared';
import { I18n } from '@coze-arch/i18n';
import { IconCozBroom } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';

import css from './json.module.less';

export interface InputJsonProps {
  value?: string;
  disabled?: boolean;
  extensions?: any;
  jsonSchema?: any;
  height?: string;
  validateStatus?: 'error';
  ['data-testid']?: string;
  onChange?: (v?: string) => void;
  didMount?: (editor: any) => void;
}

export const InputJson: React.FC<InputJsonProps> = ({
  value,
  disabled,
  validateStatus,
  onChange,
  ...props
}) => {
  const handleFormat = () => {
    const next = safeFormatJsonString(value);
    if (next !== value) {
      onChange?.(next);
    }
  };

  return (
    <div
      className={clsx(
        css['input-json-wrap'],
        disabled && css.disabled,
        validateStatus === 'error' && css.error,
      )}
      data-testid={props['data-testid']}
    >
      <div className={css['json-header']}>
        <div className={css['json-label']}>JSON</div>
        <div>
          <Tooltip content={I18n.t('workflow_exception_ignore_format')}>
            <IconButton
              icon={<IconCozBroom />}
              disabled={disabled}
              size="small"
              color="secondary"
              onMouseDown={e => e.preventDefault()}
              onClick={handleFormat}
            />
          </Tooltip>
        </div>
      </div>
      <div className={css['json-editor']}>
        <JsonEditor
          value={value}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />
      </div>
    </div>
  );
};
