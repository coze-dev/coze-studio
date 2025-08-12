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

import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { useQueryLatestFCSettings } from './use-query-latest-fc-settings';
import { type BoundPluginItem, type PluginFCSetting } from './types';
import { TooltipAction } from './tooltip-action';
import { PluginSettingFormModal } from './plugin-setting-form-modal';
import { defaultResponseStyleMode } from './constants';

interface PluginSettingProps extends BoundPluginItem {
  setting?: PluginFCSetting;
  onChange?: (setting?: PluginFCSetting) => void;
}

export const PluginSetting: FC<PluginSettingProps> = props => {
  const { setting, onChange } = props;
  const node = useCurrentEntity();
  const mutation = useQueryLatestFCSettings({
    nodeId: node.id,
  });
  const [latestSetting, setLatestSetting] = useState<
    PluginFCSetting | undefined
  >(undefined);
  const [visible, setVisible] = useState(false);

  const handleEdit = () => {
    mutation.mutate(
      {
        pluginFCSetting: setting
          ? {
              plugin_id: props.plugin_id,
              api_id: props.api_id,
              api_name: props.api_name,
              is_draft: props.is_draft,
              plugin_version: props.plugin_version,
              ...setting,
            }
          : {
              plugin_id: props.plugin_id,
              api_id: props.api_id,
              api_name: props.api_name,
              request_params: [],
              response_params: [],
              response_style: {
                mode: defaultResponseStyleMode,
              },
              is_draft: props.is_draft,
              plugin_version: props.plugin_version,
            },
      },
      {
        onSuccess: res => {
          setLatestSetting(res?.plugin_fc_setting);
          setVisible(true);
        },
      },
    );
  };

  const handleSubmit = (newSetting?: PluginFCSetting) => {
    onChange?.(newSetting);
    setVisible(false);
  };

  return (
    <>
      <TooltipAction
        tooltip={I18n.t('plugin_bot_ide_plugin_setting_icon_tip')}
        icon={<IconCozSetting />}
        onClick={handleEdit}
      />
      {visible ? (
        <PluginSettingFormModal
          visible={visible}
          setting={latestSetting}
          onSubmit={handleSubmit}
          onCancel={() => setVisible(false)}
        />
      ) : null}
    </>
  );
};
