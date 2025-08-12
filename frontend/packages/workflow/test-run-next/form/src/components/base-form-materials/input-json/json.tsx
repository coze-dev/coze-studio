/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
