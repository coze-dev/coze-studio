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

import { useRef, useState } from 'react';

import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { extractTemplateActionCommonParams } from '@coze-arch/bot-tea/utils';
import {
  EVENT_NAMES,
  type ParamsTypeDefine,
  sendTeaEvent,
} from '@coze-arch/bot-tea';
import {
  ProductEntityType,
  type ProductInfo,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';
import {
  type BaseFormProps,
  Form,
  FormInput,
  Modal,
  type ModalProps,
  type FormApi,
} from '@coze-arch/coze-design';

import { SpaceFormSelect } from '../space-form-select';
import { appendCopySuffix } from './utils';

export interface ProjectTemplateCopyValue {
  productId: string;
  name: string;
  spaceId?: string;
}

const filedKeyMap: Record<
  keyof ProjectTemplateCopyValue,
  keyof ProjectTemplateCopyValue
> = {
  name: 'name',
  spaceId: 'spaceId',
  productId: 'productId',
} as const;

interface ProjectTemplateCopyModalProps
  extends Omit<ModalProps, 'size' | 'okText' | 'cancelText'> {
  isSelectSpace: boolean;
  formProps: BaseFormProps<ProjectTemplateCopyValue>;
}

export const ProjectTemplateCopyModal: React.FC<
  ProjectTemplateCopyModalProps
> = ({ isSelectSpace, formProps, ...modalProps }) => (
  <Modal
    size="default"
    okText={I18n.t('Confirm')}
    cancelText={I18n.t('Cancel')}
    {...modalProps}
  >
    <Form<ProjectTemplateCopyValue> {...formProps}>
      <FormInput
        label={I18n.t('creat_project_project_name')}
        rules={[{ required: true }]}
        field={filedKeyMap.name}
        maxLength={botInputLengthService.getInputLengthLimit('projectName')}
        getValueLength={botInputLengthService.getValueLength}
        noErrorMessage
      />
      {isSelectSpace ? <SpaceFormSelect field={filedKeyMap.spaceId} /> : null}
    </Form>
  </Modal>
);

export type ProjectTemplateCopySuccessCallback = (param: {
  originProductId: string;
  newEntityId: string;
  spaceId: string;
}) => void;

export const useProjectTemplateCopyModal = (props: {
  modalTitle: string;
  /** Do you need to choose space? */
  isSelectSpace: boolean;
  onSuccess?: ProjectTemplateCopySuccessCallback;
  /** Event tracking parameters - current page/source */
  source: NonNullable<
    ParamsTypeDefine[EVENT_NAMES.template_action_front]['source']
  >;
}) => {
  const [visible, setVisible] = useState(false);
  const [initValues, setInitValues] = useState<ProjectTemplateCopyValue>();
  const [sourceProduct, setSourceProduct] = useState<ProductInfo>();
  const [isFormValid, setIsFormValid] = useState(true);
  const formApi = useRef<FormApi<ProjectTemplateCopyValue>>();

  const onModalClose = () => {
    setVisible(false);
    setInitValues(undefined);
    formApi.current = undefined;
    setIsFormValid(true);
  };

  const { run, loading } = useRequest(
    async (copyRequestParam: ProjectTemplateCopyValue | undefined) => {
      if (!copyRequestParam) {
        throw new Error('duplicate project template values not provided');
      }
      const { productId, spaceId, name } = copyRequestParam;
      return ProductApi.PublicDuplicateProduct({
        product_id: productId,
        space_id: spaceId,
        name,
        entity_type: ProductEntityType.ProjectTemplate,
      });
    },
    {
      manual: true,
      onSuccess: (data, [inputParam]) => {
        onModalClose();
        sendTeaEvent(EVENT_NAMES.template_action_front, {
          action: 'duplicate',
          after_id: data.data?.new_entity_id,
          source: props.source,
          ...extractTemplateActionCommonParams(sourceProduct),
        });
        props?.onSuccess?.({
          originProductId: inputParam?.productId ?? '',
          newEntityId: data.data?.new_entity_id ?? '',
          spaceId: inputParam?.spaceId ?? '',
        });
      },
    },
  );

  return {
    modalContextHolder: (
      <ProjectTemplateCopyModal
        title={props.modalTitle}
        isSelectSpace={props.isSelectSpace}
        visible={visible}
        okButtonProps={{
          disabled: !isFormValid,
          loading,
        }}
        onOk={async () => {
          const val = await formApi.current?.validate();
          if (val) {
            run(val);
          }
        }}
        onCancel={onModalClose}
        formProps={{
          initValues,
          onValueChange: val => {
            // When the user removes all characters in input, val.name field disappears instead of empty string
            setIsFormValid(!!val.name?.trim());
          },
          getFormApi: api => {
            formApi.current = api;
          },
        }}
      />
    ),
    copyProject: ({
      initValue,
      sourceProduct: inputSourceProduct,
    }: {
      initValue: ProjectTemplateCopyValue;
      /** Used to extract event tracking parameters */
      sourceProduct: ProductInfo;
    }) => {
      setInitValues({
        ...initValue,
        name: botInputLengthService.sliceStringByMaxLength({
          value: appendCopySuffix(initValue.name),
          field: 'projectName',
        }),
      });
      setSourceProduct(inputSourceProduct);
      setVisible(true);
      setIsFormValid(!!initValue?.name?.trim());
    },
  };
};

export { appendCopySuffix };
