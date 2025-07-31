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

import { type PropsWithChildren } from 'react';

import { sortBy } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { Popover, Space } from '@coze-arch/bot-semi';
import {
  PluginParamTypeFormat,
  type PluginApi,
  type PluginParameter,
} from '@coze-arch/bot-api/developer_api';

import s from './index.module.less';

interface ParametersPopoverProps extends PopoverProps {
  pluginApi: PluginApi;
  callback?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onVisibleChange?: (visible: boolean) => void;
}

enum AssistType {
  File = 1,
  Image = 2,
  Doc = 3,
  Code = 4,
  Ppt = 5,
  Txt = 6,
  Excel = 7,
  Audio = 8,
  Zip = 9,
  Video = 10,
  Svg = 11,
}

const assistTypeToDisplayMap = {
  [AssistType.File]: 'File',
  [AssistType.Image]: 'Image',
  [AssistType.Doc]: 'Doc',
  [AssistType.Code]: 'Code',
  [AssistType.Ppt]: 'PPT',
  [AssistType.Txt]: 'Txt',
  [AssistType.Excel]: 'Excel',
  [AssistType.Audio]: 'Audio',
  [AssistType.Zip]: 'Zip',
  [AssistType.Video]: 'Video',
  [AssistType.Svg]: 'Svg',
};

const getDisplayType = (parameter: Readonly<PluginParameter>) => {
  const { type, format } = parameter;

  const { assist_type } = parameter as { assist_type: AssistType };

  let displayType = type;
  if (type === 'string' && format === PluginParamTypeFormat.ImageUrl) {
    displayType = 'image';
  } else if (type === 'string' && assist_type) {
    displayType = assistTypeToDisplayMap[assist_type];
  }
  return displayType;
};

const ParameterItem: React.FC<{ parameter: Readonly<PluginParameter> }> = ({
  parameter,
}) => {
  const { name, desc, required } = parameter;

  return (
    <div className={s['parameter-item']}>
      <Space className={s['parameter-text']} wrap>
        <span className={s['parameter-name']}>{name}</span>
        <span className={s['parameter-type']}>{getDisplayType(parameter)}</span>
        {required ? (
          <span className={s['parameter-required']}>
            {I18n.t('tool_para_required')}
          </span>
        ) : null}
      </Space>
      <div className={s['parameter-desc']}>{desc}</div>
    </div>
  );
};

export const ParametersPopover: React.FC<
  PropsWithChildren<ParametersPopoverProps>
> = ({ children, pluginApi, callback, onVisibleChange, ...props }) => (
  <Popover
    trigger={props?.trigger || 'hover'}
    position="right"
    showArrow
    onVisibleChange={onVisibleChange}
    content={
      <div
        className={classNames(
          'max-h-[400px] overflow-x-hidden overflow-y-auto',
          s['popover-content'],
        )}
        onClick={e => {
          callback?.(e);
        }}
      >
        {pluginApi.name ? (
          <div className={s['popover-api-name']}>{pluginApi.name}</div>
        ) : null}
        {pluginApi.desc ? (
          <div className={s['popover-api-desc']}>{pluginApi.desc}</div>
        ) : null}
        {sortBy(pluginApi.parameters || [], item => item.name?.length)?.map(
          p => {
            if (!p) {
              return null;
            }
            return <ParameterItem parameter={p} key={p.name} />;
          },
        )}
      </div>
    }
    {...props}
  >
    <div>{children}</div>
  </Popover>
);
