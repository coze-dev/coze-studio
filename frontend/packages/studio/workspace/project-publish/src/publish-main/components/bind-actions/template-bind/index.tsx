// @file 社区版暂不支持模版渠道绑定，用于未来拓展
import { useParams } from 'react-router-dom';
import { type MouseEventHandler, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { ProductEntityType, type UserInfo } from '@coze-arch/idl/product_api';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { ProductApi } from '@coze-arch/bot-api';
import { Button, Modal } from '@coze/coze-design';

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

// TODO Template From 表单信息存入 store ，并且作为是否能勾选模板渠道的依据
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

  // 回填模板配置
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
          // @ts-expect-error 可以接受 Partial
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
