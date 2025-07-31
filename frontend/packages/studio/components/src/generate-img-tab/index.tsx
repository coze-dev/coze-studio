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

import { useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import {
  Collapsible,
  IconButton,
  SegmentTab,
  Space,
} from '@coze-arch/coze-design';

import { type TabItem } from './type';

import s from './index.module.less';

export interface GenerateImageTabProps {
  // tab list
  tabs: TabItem[];
  // Is it foldable?
  enableCollapsible?: boolean;
  // Currently active tab
  activeKey?: string;
  // Currently active tab change callback
  onTabChange?: (tabKey: string) => void;
  // Whether to show the waiting copy
  showWaitTip?: boolean;
  disabled?: boolean;
}

export enum GenerateType {
  Static = 'static',
  Gif = 'gif',
}

export const GenerateImageTab: React.FC<GenerateImageTabProps> = ({
  tabs = [],
  enableCollapsible = false,
  activeKey,
  onTabChange,
  showWaitTip = true,
  disabled = false,
}) => {
  const [isOpen, setOpen] = useState(true);
  const toggle = () => {
    setOpen(!isOpen);
  };

  // tabPane does not uninstall
  const component = (
    <div>
      {tabs.map(item => (
        <div
          key={item.value}
          className={classNames({
            hidden: activeKey !== item.value,
            'border-0 border-t border-solid mt-2 coz-stroke-primary': isOpen,
          })}
        >
          {item.component}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={classNames(
        'border border-solid coz-stroke-plus coz-bg-max rounded-md w-full coz-fg-plus mt-3 pt-2 pb-4 px-4',
        {
          'coz-bg-primary pointer-events-none': disabled,
        },
      )}
    >
      <div className=" flex items-center gap-2	justify-between ">
        <Space>
          {enableCollapsible ? (
            <IconButton
              className="!bg-transparent hover:!coz-mg-primary-hovered"
              icon={
                <IconCozArrowLeft
                  className={classNames(
                    isOpen ? 'rotate-90' : '-rotate-90',
                    'coz-fg-secondary',
                  )}
                  onClick={toggle}
                />
              }
            />
          ) : null}
          <SegmentTab
            className={s['segment-tab']}
            onChange={e => {
              onTabChange?.(e.target.value);
            }}
            options={tabs.map(item => ({
              label: item.label,
              value: item.value,
            }))}
            defaultValue={activeKey ?? tabs[0]?.value}
          />
        </Space>

        {showWaitTip ? (
          <div className="coz-fg-dim text-xs flex-1	truncate">
            {I18n.t('profilepicture_popup_async')}
          </div>
        ) : null}
      </div>
      {enableCollapsible ? (
        // keepDOM exception fails using collapseHeight does not destroy dom keep state
        <Collapsible isOpen={isOpen} keepDOM collapseHeight={1}>
          <div> {component} </div>
        </Collapsible>
      ) : (
        <div> {component} </div>
      )}
    </div>
  );
};
