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

import { type FC, useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircle } from '@coze-arch/coze-design/icons';
import { Skeleton } from '@coze-arch/bot-semi';
import { type FileInfo } from '@coze-arch/bot-api/playground_api';

import { Icon } from './icon';

const SINGLE_LINE_LOADING_COUNT = 10;

export interface IconListProps {
  list: FileInfo[];
  initValue?: FileInfo;
  onSelect: (item: FileInfo) => void;
  onClear: (item: FileInfo) => void;
}
export const IconList: FC<IconListProps> = props => {
  const { list, onSelect, onClear, initValue } = props;
  const [selectIcon, setSelectIcon] = useState<FileInfo | undefined>(initValue);
  const onIconClick = (item: FileInfo) => {
    const { url } = item;
    if (!url) {
      return;
    }
    if (url === selectIcon?.url) {
      setSelectIcon(undefined);
      onClear(item);
      return;
    }
    setSelectIcon(item);
    onSelect(item);
  };

  return (
    <div className="flex flex-wrap gap-1 p-4">
      {list.map((item, index) => (
        <div onClick={() => onIconClick?.(item)}>
          <Icon
            key={index}
            icon={item}
            className={cls({
              'coz-mg-secondary-pressed': item.uri === selectIcon?.uri,
            })}
          />
        </div>
      ))}
    </div>
  );
};

export const AnimateLoading = () => (
  <>
    <SingleLoading />
    <SingleLoading />
    <SingleLoading />
  </>
);

const SingleLoading = () => (
  <div>
    <Skeleton
      active
      loading
      placeholder={
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 8,
          }}
        >
          {Array.from({ length: SINGLE_LINE_LOADING_COUNT }).map((_, index) => (
            <Skeleton.Image
              key={index}
              style={{
                height: 28,
                width: 28,
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      }
    />
  </div>
);

export const IconListField = () => (
  <div className="flex justify-center items-center flex-col w-[420px] h-[148px]">
    <IconCozWarningCircle className="mb-4 w-8 h-8 coz-fg-hglt-red" />
    <div className="coz-fg-secondary text-xs">
      {/* @ts-expect-error -- replace*/}
      {I18n.t('Connection failed')}
    </div>
  </div>
);
