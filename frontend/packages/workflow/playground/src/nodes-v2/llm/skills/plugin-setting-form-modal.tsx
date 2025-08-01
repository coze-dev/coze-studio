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

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  Button,
  Modal,
  Nav,
  NavItem,
  Typography,
} from '@coze-arch/coze-design';

import { type PluginFCSetting } from './types';
import { OutputParamsForm, type ResponseSettings } from './output-params-form';
import { InputParamsForm } from './input-params-form';

import styles from './plugin-setting-form-modal.module.less';

interface PluginSettingFormModalProps {
  visible: boolean;
  setting?: PluginFCSetting;
  onSubmit?: (setting?: PluginFCSetting) => void;
  onCancel: () => void;
}

enum SettingNavKey {
  Input = 'input',
  Output = 'output',
}

export const PluginSettingFormModal: FC<
  PluginSettingFormModalProps
> = props => {
  const { visible, setting: originSetting, onSubmit, onCancel } = props;
  const [activeKey, setActiveKey] = useState(SettingNavKey.Input);
  const [setting, updateSetting] = useState<PluginFCSetting | undefined>(
    originSetting,
  );

  const handleParamsChange =
    (key: keyof PluginFCSetting) =>
    (settingParams: PluginFCSetting[keyof PluginFCSetting]) => {
      updateSetting({
        ...setting,
        [key]: settingParams,
      });
    };

  const handleResponseParamsChange = (responseSettings: ResponseSettings) => {
    updateSetting({
      ...setting,
      ...responseSettings,
    });
  };

  const handleSubmit = () => {
    onSubmit?.(setting);
  };

  return (
    <Modal
      className={styles['plugin-setting-form-modal']}
      size="xl"
      visible={visible}
      onCancel={onCancel}
      bodyStyle={{
        padding: 0,
      }}
      height={700}
      footer={
        <div className="pt-0 flex">
          <div
            className="coz-bg-primary p-4"
            style={{
              flex: '0 0 220px',
            }}
          ></div>
          <div className="flex-1 pb-4 pr-4">
            <Button color="hgltplus" onClick={handleSubmit}>
              {I18n.t('Save')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-full">
        <div
          className="coz-bg-primary p-4"
          style={{
            flex: '0 0 220px',
          }}
        >
          <Typography.Title heading={4} className="!mb-4 px-2">
            {I18n.t('basic_setting')}
          </Typography.Title>
          <Nav
            className={styles['plugin-setting-nav']}
            selectedKeys={[activeKey]}
            onSelect={({ itemKey }) => setActiveKey(itemKey as SettingNavKey)}
          >
            <NavItem
              itemKey={SettingNavKey.Input}
              text={I18n.t('Create_newtool_s2_title')}
            ></NavItem>
            <NavItem
              itemKey={SettingNavKey.Output}
              text={I18n.t('Create_newtool_s3_Outputparameters')}
            ></NavItem>
          </Nav>
        </div>
        <div className="flex-1 px-4 pt-[50px] relative h-full overflow-y-hidden">
          <div
            className={classnames(
              {
                hidden: activeKey !== SettingNavKey.Input,
                block: activeKey === SettingNavKey.Input,
              },
              'h-full',
            )}
          >
            <InputParamsForm
              initValue={setting?.request_params}
              onChange={handleParamsChange('request_params')}
            />
          </div>
          <div
            className={classnames(
              {
                hidden: activeKey !== SettingNavKey.Output,
                block: activeKey === SettingNavKey.Output,
              },
              'h-full',
            )}
          >
            <OutputParamsForm
              initValue={{
                response_params: setting?.response_params,
                response_style: setting?.response_style,
              }}
              onChange={handleResponseParamsChange}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
