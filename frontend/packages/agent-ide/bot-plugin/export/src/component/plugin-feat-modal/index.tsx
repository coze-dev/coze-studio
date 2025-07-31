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

import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { debounce } from 'lodash-es';
import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { SortType, ProductEntityType } from '@coze-arch/bot-api/product_api';
import { FeedbackType } from '@coze-arch/bot-api/plugin_develop';
import { ProductApi, PluginDevelopApi } from '@coze-arch/bot-api';
import {
  Modal,
  Form,
  type FormApi,
  Button as CozeButton,
  type SelectProps,
  type CommonFieldProps,
  type ButtonProps,
  Toast,
  Tooltip,
  Avatar,
} from '@coze-arch/coze-design';

const { Select, TextArea } = Form;

interface FormType {
  feedback_type: FeedbackType;
  plugin_id?: string;
  feedback: string;
}

const options = [
  {
    value: FeedbackType.NotFoundPlugin,
    label: I18n.t(
      'plugin_feedback_modal_request_type_official_plugins_not_found',
    ),
  },
  {
    value: FeedbackType.OfficialPlugin,
    label: I18n.t(
      'plugin_feedback_modal_request_type_feedback_to_existing_plugin',
    ),
  },
];

const PluginSelect: FC<SelectProps & CommonFieldProps> = props => {
  const [inputValue, setInputValue] = useState('');

  const { data, loading } = useRequest(
    async () => {
      const res = await ProductApi.PublicGetProductList({
        keyword: inputValue,
        page_num: 1,
        page_size: 50,
        sort_type: SortType.Heat,
        entity_type: ProductEntityType.Plugin,
        is_official: true,
        need_extra: false,
      });
      const products = res?.data?.products;

      return products?.length ? products : [];
    },
    {
      refreshDeps: [inputValue],
    },
  );

  const pluginOptions = data
    ?.filter(p => p.meta_info)
    .map(plugin => {
      const meta = plugin.meta_info;
      return {
        value: meta.entity_id,
        label: (
          <>
            {meta.icon_url ? (
              <Avatar
                size="extra-extra-small"
                src={meta.icon_url}
                shape="square"
                className="mr-[5px]"
              />
            ) : null}
            {meta.name}
          </>
        ),
      };
    });

  return (
    <Select
      onSearch={debounce((val, event) => {
        if (event.type === 'change') {
          setInputValue(val);
        }
      }, 800)}
      loading={loading}
      optionList={pluginOptions}
      filter
      remote
      {...props}
    />
  );
};

export const usePluginFeatModal = () => {
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formApi = useRef<FormApi<FormType>>();

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const vals = await formApi.current?.validate();

      const res = await PluginDevelopApi.CreatePluginFeedback(vals);

      if (res?.code !== 0) {
        return;
      }

      Toast.success(I18n.t('plugin_feedback_modal_tip_submission_success'));
      setVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    formApi.current?.setValues({
      feedback_type: FeedbackType.NotFoundPlugin,
      plugin_id: undefined,
      feedback: '',
    });
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    reset();
  }, [visible]);

  const modal = (
    <Modal
      title={I18n.t('plugin_feedback_modal_title')}
      visible={visible}
      onCancel={() => setVisible(false)}
      width={562}
      footer={
        <>
          <CozeButton
            color="secondary"
            onClick={() => setVisible(false)}
            className="mr-[12px]"
          >
            {I18n.t('coze_home_delete_modal_btn_cancel')}
          </CozeButton>
          <CozeButton onClick={onSubmit} loading={submitting}>
            {I18n.t('feedback_submit')}
          </CozeButton>
        </>
      }
    >
      <Form<FormType>
        getFormApi={api => (formApi.current = api)}
        render={({ formState, values }) => (
          <>
            <Select
              field="feedback_type"
              rules={[
                {
                  required: true,
                },
              ]}
              label={I18n.t('plugin_feedback_modal_request_type')}
              optionList={options}
              className="w-full"
            />
            {values?.feedback_type === FeedbackType.OfficialPlugin && (
              <PluginSelect
                field="plugin_id"
                rules={[
                  {
                    required: true,
                    message: I18n.t(
                      'plugin_feedback_error_tip_no_official_plugin_choosen',
                    ),
                  },
                ]}
                label={I18n.t('plugin_feedback_modal_choose_official_plugin')}
                className="w-full"
              />
            )}
            <TextArea
              field="feedback"
              rules={[
                {
                  required: true,
                  message: I18n.t('plugin_feedback_error_tip_empty_content'),
                },
              ]}
              label={I18n.t('plugin_feedback_modal_feedback_content')}
              placeholder={I18n.t(
                'plugin_feedback_modal_feedback_content_placeholder',
              )}
              maxCount={2000}
              maxLength={2000}
            />
          </>
        )}
      />
    </Modal>
  );
  const open = () => setVisible(true);

  const EntryButton = useCallback<FC<ButtonProps>>(
    props => (
      <Tooltip content={I18n.t('plugin_feedback_entry_tip')}>
        <CozeButton onClick={open} size="large" color="primary" {...props}>
          {I18n.t('plugin_feedback_entry_button')}
        </CozeButton>
      </Tooltip>
    ),
    [],
  );

  return {
    open,
    EntryButton,
    modal,
  };
};
