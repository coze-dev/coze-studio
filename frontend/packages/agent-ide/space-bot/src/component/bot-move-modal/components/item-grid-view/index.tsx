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

import { size } from 'lodash-es';
import classNames from 'classnames';
import {
  IconCozCheckMarkCircleFill,
  IconCozInfoCircleFill,
} from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/bot-semi';
import { type TransferResourceInfo } from '@coze-arch/bot-api/playground_api';

interface IResource extends TransferResourceInfo {
  spaceID: string;
}
interface IItemGridView {
  title: string;
  resources: Array<IResource>;
  onResourceClick?: (id: string, spaceID: string) => void;
  showStatus?: boolean;
}

export function ItemGridView(props: IItemGridView) {
  const { title, resources, showStatus = false, onResourceClick } = props;
  // HACK: Since the boundary line under the grid layout is the transparent background color, one needs to be filled when the number of resources is singular
  const isEven = size(resources) % 2 === 0;
  const finalResources = isEven
    ? resources
    : [...resources, { name: '', id: '', icon: '', spaceID: '' }];
  return (
    <>
      <p className="text-[12px] leading-[16px] font-[500] coz-fg-secondary text-left align-top w-full mb-[6px]">
        {title}
      </p>
      <div className="mb-[12px]">
        <div className="grid grid-cols-2 rounded-[6px] overflow-hidden border border-solid coz-stroke-primary gap-[1px] bg-[var(--coz-stroke-primary)] rounded-[4px]">
          {finalResources.map(item => (
            <div
              key={item.id}
              className={classNames(
                'flex justify-center items-center gap-x-[4px] p-[8px] w-full coz-bg-plus',
                item.id ? 'hover:cursor-pointer' : '',
              )}
              onClick={() => {
                if (item.id) {
                  onResourceClick?.(item.id, item.spaceID);
                }
              }}
            >
              <img
                src={item.icon}
                className="w-[16px] h-[16px] rounded-[2px]"
              />
              <Typography.Text
                ellipsis={{ showTooltip: true }}
                className="text-[12px] leading-[16px] font-[500] coz-fg-primary text-left align-top grow"
              >
                {item.name}
              </Typography.Text>
              {showStatus && item.status === 1 ? (
                <div className="coz-fg-hglt-green flex justify-center items-center">
                  <IconCozCheckMarkCircleFill />
                </div>
              ) : null}
              {showStatus && item.status === 0 ? (
                <div className="coz-fg-hglt-red flex justify-center items-center">
                  <IconCozInfoCircleFill />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
