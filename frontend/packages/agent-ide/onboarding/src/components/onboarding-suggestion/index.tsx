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

import { type ComponentProps, forwardRef } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { TextArea, Tooltip, UIIconButton } from '@coze-arch/bot-semi';
import { IconNo } from '@coze-arch/bot-icons';

import styles from './index.module.less';

export interface OnboardingSuggestionProps
  extends Omit<
    ComponentProps<typeof TextArea>,
    'autosize' | 'rows' | 'placeholder' | 'onChange'
  > {
  id: string;
  onDelete?: (id: string) => void;
  onChange?: (id: string, value: string) => void;
}

export const OnboardingSuggestion = forwardRef<
  HTMLTextAreaElement,
  OnboardingSuggestionProps
>(({ value, onChange, id, onDelete, className, ...restProps }, ref) => (
  <div className={styles['suggestion-message-item']}>
    <TextArea
      autosize
      rows={1}
      ref={ref}
      className={className}
      placeholder={I18n.t('opening_question_placeholder')}
      value={value}
      onChange={v => {
        onChange?.(id, v);
      }}
      {...restProps}
    />
    <Tooltip content={I18n.t('bot_edit_plugin_delete_tooltip')}>
      <UIIconButton
        wrapperClass={classNames(styles['icon-button-16'], styles['no-icon'])}
        iconSize="small"
        icon={
          <IconNo
            className={classNames(!value && styles['icon-no-disabled'])}
          />
        }
        onClick={() => {
          if (!value) {
            return;
          }
          onDelete?.(id);
        }}
      />
    </Tooltip>
  </div>
));
