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
} from '@coze/coze-design';

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
  /** 是否需要选择 space */
  isSelectSpace: boolean;
  onSuccess?: ProjectTemplateCopySuccessCallback;
  /** 埋点参数 - 当前页面/来源 */
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
      // todo onError 上报
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
            // 当用户删除 input 中所有字符时，val.name 字段会消失，而不是空字符串，神秘
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
      /** 用于提取埋点参数 */
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
