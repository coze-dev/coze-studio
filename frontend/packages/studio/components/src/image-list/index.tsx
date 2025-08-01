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

import { type CSSProperties } from 'react';

import classNames from 'classnames';
import {
  IconCozCheckMarkFill,
  IconCozMinusCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import { type PicTask } from '@coze-arch/bot-api/playground_api';

import s from './index.module.less';

export type ImageItem = PicTask;

export interface ImageListProps {
  selectedKey?: string; // Selected key
  data: ImageItem[]; // list data
  className?: string;
  imageItemClassName?: string;
  showDeleteIcon?: boolean;
  showSelectedIcon?: boolean;
  style?: CSSProperties;
  onRemove?: (params: {
    index?: number;
    item?: ImageItem;
    data: ImageItem[];
  }) => void; // Delete the picture, data is the data after this deletion.
  onSelect?: (params: {
    index?: number;
    item: ImageItem;
    data: ImageItem[];
    selected: boolean;
  }) => void; // Select the picture, where item and data are the data before this selection. Selected indicates whether the picture was selected before this selection
  onClick?: (params: {
    index: number;
    item: ImageItem;
    data: ImageItem[];
  }) => void; // Click on the picture.
}

export const ImageList: React.FC<ImageListProps> = ({
  data,
  showDeleteIcon = true,
  showSelectedIcon = true,
  className,
  imageItemClassName,
  style,
  onSelect,
  onRemove,
  onClick,
  selectedKey,
}) => {
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <div className={classNames(className, s.ctn)} style={style}>
      {data.map((item, index) => {
        const { img_info } = item;
        const { tar_uri, tar_url } = img_info ?? {};
        return (
          <div
            key={tar_uri}
            className={classNames(s['image-item'], imageItemClassName)}
          >
            <img
              src={tar_url}
              alt="图片"
              className={classNames({
                [s.selected]: showSelectedIcon && selectedKey === tar_uri,
              })}
              onClick={() => {
                onClick?.({ index, item, data });
                onSelect?.({
                  index,
                  item,
                  data,
                  selected: selectedKey === tar_uri,
                });
              }}
            />
            {showDeleteIcon ? (
              <IconCozMinusCircleFillPalette
                className={s['delete-icon']}
                onClick={() => {
                  onRemove?.({
                    index,
                    item,
                    data: data.filter(i => i !== item),
                  });
                }}
              />
            ) : null}
            {showSelectedIcon && selectedKey === tar_uri ? (
              <div className={s['check-icon']}>
                <IconCozCheckMarkFill />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
