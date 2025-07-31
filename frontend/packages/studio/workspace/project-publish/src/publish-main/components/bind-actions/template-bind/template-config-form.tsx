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

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  Suspense,
} from 'react';

import classNames from 'classnames';
import { ProductEntityType, type UserInfo } from '@coze-arch/idl/product_api';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { useFlags } from '@coze-arch/bot-flags';
import {
  LazyEditorFullInput,
  DeltaSet,
  type DeltaSetOptions,
  type Editor,
  EditorEventType,
  normalizeSchema,
} from '@coze-common/md-editor-adapter';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import {
  type FileItem,
  Form,
  FormInput,
  FormSelect,
  Typography,
  type optionRenderProps,
} from '@coze-arch/coze-design';

import {
  uploadCustomRequest,
  uploadCustomRequestImageX,
} from '@/utils/upload-custom-request';
import { toDisplayScreenOption } from '@/publish-main/utils/display-screen-option';
import { useProductCategoryOptions } from '@/publish-main/hooks/use-product-category-options';

import { OptionWithTooltip } from '../../option-with-tooltip';
import { type TemplateForm } from './types';
import { TemplatePreviewCard } from './template-preview-card';

import s from './index.module.less';

function getRequiredRules(type: I18nKeysNoOptionsType) {
  return [
    {
      required: true,
      message: I18n.t('project_release_template_info_not', {
        template_info_type: I18n.t(type),
      }),
    },
  ];
}

export interface TemplateConfigFormRef {
  fillInitialValues: (values: Partial<TemplateForm>) => void;
  validate: () => Promise<TemplateForm> | undefined;
}

export interface TemplateConfigFormProps {
  record: PublishConnectorInfo;
  userInfo?: UserInfo;
}

export const TemplateConfigForm = forwardRef<
  TemplateConfigFormRef,
  TemplateConfigFormProps
  // eslint-disable-next-line @coze-arch/max-line-per-function
>(({ record, userInfo }, ref) => {
  const [FLAGS] = useFlags();
  // Support soon, so stay tuned.
  const customRequest = FLAGS['bot.studio.project_publish_imagex']
    ? uploadCustomRequestImageX
    : uploadCustomRequest;
  const uiChannelOptions = record.UIOptions?.map(toDisplayScreenOption) ?? [];
  const formRef = useRef<Form<TemplateForm>>(null);
  const [formValues, setFormValues] = useState<Partial<TemplateForm>>({});
  const editorRef = useRef<Editor>();
  const onEditorInit = (editor: Editor) => {
    editorRef.current = editor;
    // EditorFullInput's form value is plain text, but here you need to submit editor-kit rich text content
    editor.on(EditorEventType.CONTENT_CHANGE, _ => {
      formRef.current?.formApi?.setValue(
        'readme',
        JSON.stringify(editor.getContent().deltas),
      );
    });
  };
  const { categoryOptions } = useProductCategoryOptions(
    ProductEntityType.TemplateCommon,
  );

  useImperativeHandle(ref, () => ({
    fillInitialValues: values => {
      const formApi = formRef.current?.formApi;
      if (!formApi) {
        return;
      }
      formApi.setValues(values, { isOverride: true });
      const readme = typeSafeJSONParse(values.readme);
      if (readme) {
        editorRef.current?.setContent(
          new DeltaSet(normalizeSchema(readme as DeltaSetOptions)),
        );
      }
      // @ts-expect-error -- values is the TemplateForm type
      Object.keys(values).forEach(key => formApi.setError(key, null));
    },
    validate: () => formRef.current?.formApi?.validate(),
  }));

  const isZh = I18n.language.startsWith('zh');

  return (
    <Form<TemplateForm>
      ref={formRef}
      className={classNames('flex gap-[24px]', s['template-form'])}
      onValueChange={values => setFormValues({ ...values })}
    >
      <div className="w-[320px] absolute flex flex-col h-full justify-center">
        <TemplatePreviewCard
          userInfo={userInfo}
          cover={formValues?.covers?.[0]?.url}
          name={formValues?.name}
          description={formValues?.description}
        />
        <Form.Checkbox
          field="agreement"
          noLabel
          className="mt-[16px]"
          rules={[
            {
              // The consent agreement must be checked to pass the verification.
              validator: (_rule: unknown, value: unknown) =>
                (value as boolean) === true,
              message: I18n.t('template_buy_paid_agreement_toast'),
            },
          ]}
        >
          <Typography.Text>
            {I18n.t('template_buy_paid_agreement_action')}
            <Typography.Text
              className="ml-[4px]"
              link={{
                href: '/docs/guides/terms_of_template',
                target: '_blank',
              }}
            >
              {I18n.t('template_buy_paid_agreement_detail')}
            </Typography.Text>
          </Typography.Text>
        </Form.Checkbox>
      </div>
      <div className="w-[320px] shrink-0"></div>
      <div className="grow">
        <FormInput
          field="name"
          label={I18n.t('project_release_template_info_name')}
          maxLength={isZh ? 10 : 30}
          rules={getRequiredRules('project_release_template_info_name')}
        />
        <Form.Upload
          field="covers"
          label={I18n.t('project_release_template_info_poster')}
          listType="picture"
          accept=".jpeg,.jpg,.png,.webp"
          limit={1}
          maxSize={5 * 1024}
          action=""
          customRequest={customRequest}
          picWidth={80}
          picHeight={80}
          rules={[
            ...getRequiredRules('project_release_template_info_poster'),
            {
              validator: (_rule: unknown, value: unknown) =>
                (value as FileItem[] | undefined)?.every(
                  item => !item._sizeInvalid && item.status === 'success',
                ) === true,
              message: '', // Verify whether the file size meets the limit & & whether the upload was successful, the Upload component will display an error message
            },
          ]}
        >
          <IconCozPlus className="w-[24px] h-[24px] coz-fg-primary" />
        </Form.Upload>
        <FormInput
          field="description"
          label={I18n.t('project_release_template_info_desc')}
          maxLength={isZh ? 100 : 300}
          rules={getRequiredRules('project_release_template_info_desc')}
        />
        <Suspense fallback={null}>
          <LazyEditorFullInput
            field="readme_text"
            label={I18n.t('project_release_template_info_info')}
            className={classNames('h-[132px]', s['editor-container'])}
            maxCount={isZh ? 1000 : 3000}
            getEditor={onEditorInit}
            rules={getRequiredRules('project_release_template_info_info')}
          />
        </Suspense>
        <FormSelect
          field="preview_type"
          label={I18n.t('project_release_template_info_display')}
          optionList={uiChannelOptions}
          renderOptionItem={(option: optionRenderProps) => (
            <OptionWithTooltip option={option} tooltip={option.tooltip} />
          )}
          fieldClassName="w-full"
          className="w-full"
          rules={getRequiredRules('project_release_template_info_display')}
        />
        <FormSelect
          field="category"
          label={I18n.t('project_release_template_info_category')}
          optionList={categoryOptions}
          fieldClassName="w-full"
          className="w-full"
          rules={getRequiredRules('project_release_template_info_category')}
        />
      </div>
    </Form>
  );
});
