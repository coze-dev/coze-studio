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

import ReactMarkdown from 'react-markdown';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  memo,
  type FC,
} from 'react';

import { nanoid } from 'nanoid';
import { cloneDeep, omit } from 'lodash-es';
import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross, IconCozLongArrowUp } from '@coze-arch/coze-design/icons';
import {
  Button,
  IconButton,
  Modal,
  Spin,
  Tag,
  Toast,
} from '@coze-arch/coze-design';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type PublishConnectorInfo } from '@coze-arch/bot-api/developer_api';
import {
  type FeishuBaseConfig,
  type InputComponent,
  type InputConfig,
  type OutputSubComponent,
  type OutputSubComponentItem,
} from '@coze-arch/bot-api/connector_api';
import { connectorApi, DeveloperApi } from '@coze-arch/bot-api';

import { OUTPUT_TYPE_TEXT } from '../validate/utils';
import { useSubscribeAndUpdateConfig } from '../validate/field-interaction';
import { validateFullConfig } from '../validate';
import {
  type FeishuBaseConfigFe,
  type InputComponentFe,
  type InputConfigFe,
  type OutputSubComponentFe,
  type SaveConfigPayload,
} from '../types';
import { type ConfigStore, createConfigStore } from '../store';
import { LoadFailedDisplay } from '../expection-display';
import { StoreContext, useConfigAsserted } from '../context/store-context';
import { StepIndicator } from './step-indicator';
import { FormSubtitle, FormTitle } from './form-title';
import {
  FieldsRequireCenterWrapper,
  useRequireVerifyCenter,
} from './field-line/require-verify-center';
import { BaseOutputFieldsTable } from './base-output-fields-table';
import { BaseInputFieldsTable } from './base-input-fields-table';
export const JumpButton: FC<{
  url: string;
  completed: boolean;
}> = ({ url, completed }) => (
  <Button
    color="secondary"
    onClick={() => {
      window.open(url);
    }}
    icon={<IconCozLongArrowUp className="rotate-45" />}
    iconPosition="right"
    size="small"
    className={!completed ? '!coz-fg-hglt' : ''}
  >
    {!completed
      ? I18n.t('publish_base_configFields_complete_Information_fill_out')
      : I18n.t('publish_base_configFields_complete_Information_edit')}
  </Button>
);
export const FeishuBaseModal = memo(
  forwardRef<
    {
      openModal: () => void;
    },
    {
      botId: string;
      record: PublishConnectorInfo;
      onSaved: (id: string) => void;
    }
  >(({ botId, record, onSaved }, ref) => {
    const [showModal, setShowModal] = useState(false);
    useImperativeHandle(ref, () => ({
      openModal: () => {
        setShowModal(true);
        run();
      },
    }));
    const storeRef = useRef<ConfigStore | null>(null);

    const formRef = useRef<{
      configFormSubmit: () => void;
    } | null>(null);

    if (!storeRef.current) {
      storeRef.current = createConfigStore();
    }
    useSubscribeAndUpdateConfig(storeRef.current);

    const { data, loading, run, mutate, cancel, error } = useRequest(
      async () => {
        const { config } = await connectorApi.GetFeishuBaseConfig({
          bot_id: botId,
        });
        if (!config) {
          return undefined;
        }

        return convertBaseConfig(config);
      },
      {
        manual: true,
        onSuccess: res => {
          if (!res) {
            return;
          }
          storeRef.current?.getState().setConfig(res);
        },
      },
    );

    const hideModalAndClearData = () => {
      setShowModal(false);
      cancel();
      mutate();
    };

    return (
      <Modal
        visible={showModal}
        onCancel={hideModalAndClearData}
        closeOnEsc={false}
        maskClosable={false}
        footer={
          <Button
            color="hgltplus"
            size="default"
            onClick={() => {
              formRef.current?.configFormSubmit();
            }}
          >
            {I18n.t('Confirm')}
          </Button>
        }
        size="large"
        linearGradientMask
        header={
          <div className="flex items-center justify-between h-[40px]">
            <span className="text-[20px] font-medium leading-[28px] coz-fg-primary">
              {I18n.t('publish_base_config_configFeishuBase')}
            </span>
            <IconButton
              onClick={hideModalAndClearData}
              icon={<IconCozCross className="text-[18px]" />}
              className="w-[40px] !h-[40px] -pr-2"
              color="secondary"
            />
          </div>
        }
      >
        <Spin spinning={loading}>
          {data?.description ? (
            <ReactMarkdown
              linkTarget="_blank"
              className="coz-fg-secondary text-[14px] leading-[20px]"
            >
              {data.description}
            </ReactMarkdown>
          ) : null}
          {data ? (
            <StoreContext.Provider value={{ store: storeRef.current }}>
              <FieldsRequireCenterWrapper>
                <ConfigForm
                  ref={formRef}
                  record={record}
                  botId={botId}
                  onSaved={() => {
                    onSaved(record.id);
                    setShowModal(false);
                  }}
                />
              </FieldsRequireCenterWrapper>
            </StoreContext.Provider>
          ) : (
            <div className="h-[60px]" />
          )}
          {!data && error ? <LoadFailedDisplay /> : null}
        </Spin>
      </Modal>
    );
  }),
);

const ConfigForm = forwardRef<
  { configFormSubmit: () => void },
  {
    botId: string;
    record: PublishConnectorInfo;
    onSaved: () => void;
  }
>(({ botId, record, onSaved }, ref) => {
  const config = useConfigAsserted();
  const { input_desc, output_desc, to_complete_info } = config;
  const { url = '', completed = false } = to_complete_info ?? {};
  const couldSubmit = validateFullConfig(config);
  const { triggerAllVerify } = useRequireVerifyCenter();

  useImperativeHandle(ref, () => ({
    configFormSubmit: () => {
      triggerAllVerify();
      if (!couldSubmit) {
        Toast.error({
          content: I18n.t('publish_base_configFields_ unfinished_toast'),
        });
        return;
      }
      submitConfig();
    },
  }));

  const { run: submitConfig } = useRequest(
    () => {
      const spaceId = useSpaceStore.getState().getSpaceId();
      return DeveloperApi.BindConnector({
        space_id: spaceId,
        bot_id: botId,
        connector_id: record.id,
        connector_info: {
          config: JSON.stringify(getSubmitPayload(config)),
        },
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success({
          content: I18n.t('Save_success'),
        });
        onSaved();
      },
    },
  );

  return (
    <div className="mt-[28px] pb-[32px]">
      <div>
        <div className="flex items-center gap-2">
          <StepIndicator number={1} />
          <FormTitle title={I18n.t('publish_base_config_configBaseInfo')} />
        </div>

        <FormSubtitle
          required
          title={I18n.t('publish_base_config_configOutputType')}
          tooltip={output_desc}
          style={{
            marginTop: 9,
          }}
        />
      </div>
      <BaseOutputFieldsTable config={config} />
      <div className="mt-[32px]">
        <div className="flex items-center gap-2">
          <StepIndicator number={2} />
          <FormTitle
            title={I18n.t('publish_base_configFields')}
            tooltip={input_desc}
          />
        </div>
      </div>
      <BaseInputFieldsTable />

      {to_complete_info ? (
        <>
          <div className="flex items-center gap-2 mt-6">
            <StepIndicator number={3} />
            <FormTitle
              title={I18n.t(
                'publish_base_configFields_complete_Information_title',
              )}
              required
            />
            {completed ? (
              <>
                <Tag color="green">
                  {I18n.t('publish_base_configFields_status_completed')}
                </Tag>
                <JumpButton completed={completed} url={url} />
              </>
            ) : null}
          </div>
          {!completed ? (
            <div className="mt-[6px] flex items-center">
              {I18n.t(
                'publish_base_configFields_complete_Information_describe',
              )}
              <JumpButton completed={completed} url={url} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
});

const getSubmitPayload = (config: FeishuBaseConfigFe): SaveConfigPayload => {
  const res: SaveConfigPayload = cloneDeep({
    output_type: config.output_type,
    input_config: config.input_config.map(cfg => {
      const inputConfig: InputConfig = {
        ...cfg,
        input_component: reverseInputComponent(cfg.input_component),
      };
      return omit(inputConfig, '_id');
    }),
    output_sub_component: reverseOutputSubComponent(
      config.output_sub_component,
    ),
  });
  res.output_sub_component.item_list = (
    res.output_sub_component.item_list || []
  ).map(cfg => omit(cfg, '_id'));
  return res;
};

const reverseOutputSubComponent = (
  output: OutputSubComponentFe,
): OutputSubComponent => ({
  ...output,
  item_list: (output.item_list || []).map(item => {
    const res: OutputSubComponentItem = {
      ...omit(item, '_id'),
      output_type: item.output_type ?? OUTPUT_TYPE_TEXT,
    };
    return res;
  }),
});

const convertInputComponent = (cfg: InputComponent): InputComponentFe => {
  const { choice } = cfg;
  const res: InputComponentFe = {
    ...cfg,
    choice: (choice || []).map(c => ({
      name: c,
      id: nanoid(),
    })),
  };
  return res;
};

const reverseInputComponent = (cfg: InputComponentFe): InputComponent => {
  const { choice } = cfg;
  const res: InputComponent = {
    ...cfg,
    choice: choice.map(c => c.name),
  };
  return res;
};

const convertBaseConfig = (config: FeishuBaseConfig): FeishuBaseConfigFe => {
  const configFe: FeishuBaseConfigFe = {
    ...config,
    output_sub_component: {
      ...config.output_sub_component,
      item_list: (config.output_sub_component.item_list || []).map(item => ({
        ...item,
        _id: nanoid(),
      })),
    },
    input_config: config.input_config?.map(cfg => {
      const res: InputConfigFe = {
        ...cfg,
        input_component: convertInputComponent(cfg.input_component),
        _id: nanoid(),
      };
      return res;
    }),
  };
  return configFe;
};
