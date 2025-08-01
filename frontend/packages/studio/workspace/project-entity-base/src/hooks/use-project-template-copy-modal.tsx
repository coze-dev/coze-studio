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
import {
  appendCopySuffix,
  ProjectTemplateCopyModal,
  type ProjectTemplateCopyValue,
} from '@coze-studio/components';
import { ProductEntityType } from '@coze-arch/idl/product_api';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  type ParamsTypeDefine,
  sendTeaEvent,
} from '@coze-arch/bot-tea';
import { type ProductInfo } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';
import { type FormApi } from '@coze-arch/coze-design';

import { commonProjectFormValid } from '../utils/common-project-form-valid';
import { useFormSubmitState } from './use-project-form-submit-state';

export type ProjectTemplateCopySuccessCallback = (param: {
  originProductId: string;
  newEntityId: string;
  toSpaceId: string;
}) => void;

export type BeforeProjectTemplateCopyCallback = (params: {
  toSpaceId: string;
}) => void;

export const useProjectTemplateCopyModal = (props: {
  onBefore?: BeforeProjectTemplateCopyCallback;
  onError?: () => void;
  onSuccess?: ProjectTemplateCopySuccessCallback;
  /** Event tracking parameters - current page/source */
  source: NonNullable<
    ParamsTypeDefine[EVENT_NAMES.template_action_front]['source']
  >;
}) => {
  const [isSelectSpace, setSelectSpace] = useState(false);
  const [visible, setVisible] = useState(false);
  const [initValues, setInitValues] = useState<ProjectTemplateCopyValue>();
  const [sourceProduct, setSourceProduct] = useState<ProductInfo>();
  const formApi = useRef<FormApi<ProjectTemplateCopyValue>>();
  const {
    bizCallback: { onValuesChange },
    isSubmitDisabled,
    checkFormValid,
  } = useFormSubmitState<ProjectTemplateCopyValue>({
    getIsFormValid: values =>
      commonProjectFormValid(values) && Boolean(values.spaceId),
  });

  const onModalClose = () => {
    setVisible(false);
    setInitValues(undefined);
    formApi.current = undefined;
    setSelectSpace(false);
  };

  const { run, loading } = useRequest(
    async (copyRequestParam: ProjectTemplateCopyValue) => {
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
      onBefore: ([inputParam]) => {
        props.onBefore?.({ toSpaceId: inputParam.spaceId ?? '' });
      },
      onError: props.onError,
      onSuccess: (data, [inputParam]) => {
        onModalClose();
        sendTeaEvent(EVENT_NAMES.template_action_front, {
          template_id: sourceProduct?.meta_info.id || '',
          template_name: sourceProduct?.meta_info?.name || '',
          template_type: 'project',
          entity_id: sourceProduct?.meta_info.entity_id || '',
          entity_copy_id:
            sourceProduct?.project_extra?.template_project_id || '',
          template_tag_professional: sourceProduct?.meta_info.is_professional
            ? 'professional'
            : 'basic',
          action: 'duplicate',
          after_id: data.data?.new_entity_id,
          source: props.source,
          ...(sourceProduct?.meta_info?.is_free
            ? ({
                template_tag_prize: 'free',
              } as const)
            : ({
                template_tag_prize: 'paid',
                template_prize_detail:
                  Number(sourceProduct?.meta_info?.price?.amount) || 0,
              } as const)),
        });
        props?.onSuccess?.({
          originProductId: inputParam?.productId ?? '',
          newEntityId: data.data?.new_entity_id ?? '',
          toSpaceId: inputParam?.spaceId ?? '',
        });
      },
    },
  );

  return {
    modalContextHolder: (
      <ProjectTemplateCopyModal
        title={I18n.t('creat_project_use_template')}
        isSelectSpace={isSelectSpace}
        visible={visible}
        okButtonProps={{
          disabled: isSubmitDisabled,
          loading,
        }}
        maskClosable={false}
        onOk={() => {
          const requestValues = formApi.current?.getValues();
          if (!requestValues) {
            throw new Error('duplicate project template values not provided');
          }
          run(requestValues);
        }}
        onCancel={onModalClose}
        formProps={{
          initValues,
          onValueChange: onValuesChange,
          getFormApi: api => {
            formApi.current = api;
          },
        }}
      />
    ),
    copyProject: ({
      isSelectSpace: inputIsSelectSpace,
      sourceProduct: inputSourceProduct,
      ...rest
    }: ProjectTemplateCopyValue & {
      isSelectSpace: boolean;
      /** Used to extract event tracking parameters */
      sourceProduct: ProductInfo;
    }) => {
      setSelectSpace(inputIsSelectSpace);
      const fixedInitValues = {
        ...rest,
        name: botInputLengthService.sliceStringByMaxLength({
          value: appendCopySuffix(rest.name),
          field: 'projectName',
        }),
      };
      setInitValues(fixedInitValues);
      checkFormValid(fixedInitValues);
      setSourceProduct(inputSourceProduct);
      setVisible(true);
    },
  };
};
