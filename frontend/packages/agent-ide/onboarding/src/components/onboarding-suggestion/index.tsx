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
