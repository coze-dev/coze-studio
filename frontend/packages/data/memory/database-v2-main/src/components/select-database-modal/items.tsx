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

import { type FC } from 'react';

import cn from 'classnames';
import { useBoolean } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { type ButtonProps } from '@coze-arch/bot-semi/Button';
import { Button, Typography } from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface IProps {
  icon: string | undefined;
  title: string | undefined;
  description: string | undefined;
  isAdd: boolean;
  onClick: () => void;
  onAdd: () => void;
  onRemove?: () => void;
}

const AddedButton = (buttonProps: ButtonProps) => {
  const [isMouseIn, { setFalse, setTrue }] = useBoolean(false);

  const onMouseEnter = () => {
    setTrue();
  };
  const onMouseLeave = () => {
    setFalse();
  };

  return (
    <Button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...buttonProps}
      className={cn(styles['database-added'], {
        [styles['added-mousein']]: isMouseIn,
      })}
    >
      {isMouseIn ? I18n.t('Remove') : I18n.t('Added')}
    </Button>
  );
};

export const DatabaseListItem: FC<IProps> = props => {
  const { icon, title, description, isAdd, onClick, onAdd, onRemove } = props;

  const operateDatabase = () => {
    if (isAdd) {
      onRemove?.();
      return;
    } else {
      onAdd?.();
      return;
    }
  };
  return (
    <div
      onClick={onClick}
      className="flex flex-row items-center p-[16px] border-t-0 border-l-0 border-r-0 border-b-[1px] border-solid coz-stroke-primary last:border-b-0 cursor-pointer"
    >
      <img src={icon} className="w-[36px] h-[36px] rounded-[8px]" />
      <div className="flex flex-col ml-[12px] min-w-0 flex-grow">
        <p className="text-[14px] font-medium leading-[20px] coz-fg-primary mb-[4px]">
          {title}
        </p>
        <Typography.Text
          ellipsis={{
            showTooltip: {
              opts: { content: description },
            },
          }}
          className="text-[12px] leading-[16px] coz-fg-secondary truncate !max-w-[680px]"
        >
          {description}
        </Typography.Text>
      </div>
      <div className="ml-[16px]">
        {isAdd ? (
          <AddedButton
            onClick={e => {
              e.stopPropagation();
              operateDatabase();
            }}
          />
        ) : (
          <Button
            data-testid="bot.database.add.modal.add.button"
            className={cn(
              'w-[53px] flex justify-center items-center',
              styles['database-add'],
            )}
            onClick={e => {
              e.stopPropagation();
              operateDatabase();
            }}
          >
            {I18n.t('Add_2')}
          </Button>
        )}
      </div>
    </div>
  );
};
