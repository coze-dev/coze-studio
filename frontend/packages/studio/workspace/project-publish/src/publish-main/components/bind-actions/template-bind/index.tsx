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

// @File open source version does not support template channel binding for future expansion
import { useParams } from 'react-router-dom';
import { type MouseEventHandler, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { ProductEntityType, type UserInfo } from '@coze-arch/idl/product_api';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { ProductApi } from '@coze-arch/bot-api';
import { Button, Modal } from '@coze-arch/coze-design';

import { useProjectPublishStore } from '@/store';

import {
  entityInfoToTemplateForm,
  type TemplateForm,
  templateFormToBindInfo,
} from './types';
import {
  TemplateConfigForm,
  type TemplateConfigFormRef,
} from './template-config-form';

interface TemplateBindProps {
  record: PublishConnectorInfo;
  onClick: MouseEventHandler;
}

export function TemplateBind({
  record,
  onClick: inputOnClick,
}: TemplateBindProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const templateConfigForm = useRef<TemplateConfigFormRef>(null);
  const [savedValues, setSavedValues] = useState<Partial<TemplateForm>>();

  const { connectors, setProjectPublishInfo } = useProjectPublishStore(
    useShallow(state => ({
      connectors: state.connectors,
      setProjectPublishInfo: state.setProjectPublishInfo,
    })),
  );

  const { project_id = '' } = useParams<DynamicParams>();

  // Backfill template configuration
  const fillTemplateFrom = async () => {
    const productInfo = await ProductApi.PublicGetProductEntityInfo({
      entity_id: project_id,
      entity_type: ProductEntityType.ProjectTemplate,
    });
    if (productInfo.data.meta_info?.name) {
      const formValues = entityInfoToTemplateForm(
        productInfo.data,
        record.UIOptions?.find(item => item.available),
      );
      setSavedValues(formValues);
      setProjectPublishInfo({
        templateConfigured: formValues.agreement === true,
        connectors: {
          ...connectors,
          // @ts-expect-error can accept Partial
          [record.id]: templateFormToBindInfo(formValues),
        },
      });
    }
    if (productInfo.data.meta_info?.user_info) {
      setUserInfo(productInfo.data.meta_info.user_info);
    }
  };

  useEffect(() => {
    fillTemplateFrom();
  }, []);

  const showModal = () => {
    templateConfigForm.current?.fillInitialValues(savedValues ?? {});
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    const formValues = await templateConfigForm.current?.validate();
    if (!formValues) {
      return;
    }
    setSavedValues(formValues);
    setProjectPublishInfo({
      templateConfigured: true,
      connectors: {
        ...connectors,
        [record.id]: templateFormToBindInfo(formValues),
      },
    });
    closeModal();
  };

  return (
    <div
      className={classNames('h-full flex items-end', {
        hidden: !record.allow_publish,
      })}
      onClick={inputOnClick}
    >
      <Button size="small" color="primary" onClick={showModal}>
        {I18n.t('project_release_template_info')}
      </Button>
      <Modal
        title={I18n.t('project_release_template_info')}
        width={800}
        visible={modalVisible}
        closable
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={I18n.t('prompt_submit')}
        lazyRender={false}
        keepDOM={true}
      >
        <TemplateConfigForm
          ref={templateConfigForm}
          record={record}
          userInfo={userInfo}
        />
      </Modal>
    </div>
  );
}
