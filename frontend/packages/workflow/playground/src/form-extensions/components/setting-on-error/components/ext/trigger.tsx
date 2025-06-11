import { type FC } from 'react';

import classNames from 'classnames';
import { type Model } from '@coze-arch/bot-api/developer_api';
import { ModelOptionThumb } from '@coze-agent-ide/model-manager/model-select-v2';
import { IconCozArrowDown, IconCozCross } from '@coze/coze-design/icons';

import styles from './index.module.less';

interface Props {
  readonly?: boolean;
  model?: Model;
  popoverVisible?: boolean;
  placeholder?: string;
  showClear?: boolean;
  onClear?: () => void;
}

export const Trigger: FC<Props> = ({
  model,
  popoverVisible,
  placeholder,
  onClear,
  showClear,
}) => (
  <div
    className={classNames(
      'w-full p-[4px] flex items-center justify-between rounded-[8px]',
      'overflow-hidden cursor-pointer border border-solid',
      'hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
      styles.trigger,
      popoverVisible ? 'coz-stroke-hglt' : 'coz-stroke-primary',
    )}
  >
    {model ? (
      <ModelOptionThumb model={model} />
    ) : (
      <div className="text-xs coz-fg-dim">{placeholder}</div>
    )}
    <IconCozArrowDown
      className={classNames(
        'coz-fg-secondary text-base',
        styles['model-select-down-icon'],
      )}
    />
    {showClear ? (
      <span
        className={classNames(
          styles['model-select-clear-icon'],
          'coze-select-clear-icon absolute right-[30px] cursor-pointer text-xs coz-fg-secondary hover:coz-mg-secondary-hovered flex items-center justify-center p-2',
        )}
        onClick={e => {
          e.stopPropagation();
          onClear?.();
        }}
      >
        <IconCozCross />
      </span>
    ) : null}
  </div>
);
