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

import { useRef, useState, Suspense, lazy } from 'react';

import { SpaceFormSelect } from '@coze-studio/components';
import { type AuditData } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type RenderAutoGenerateParams } from '@coze-common/biz-components/picture-upload';
import { type FormApi, Modal, type ModalProps } from '@coze-arch/coze-design';

import {
  filedKeyMap,
  ProjectForm,
  type ProjectFormProps,
  type ProjectFormValues,
  ProjectInfoFieldFragment,
} from '../project-form';
import { useFormSubmitState } from '../../hooks/use-project-form-submit-state';

const LazyReactMarkdown = lazy(() => import('react-markdown'));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactMarkdown = (props: any) => (
  <Suspense fallback={null}>
    <LazyReactMarkdown {...props} />
  </Suspense>
);
interface ProjectFormModalProps
  extends Omit<
    ModalProps,
    'size' | 'okText' | 'cancelText' | 'okButtonProps' | 'onOk'
  > {
  /** @default false */
  showMonetizeConfig?: boolean;
  selectSpace?: boolean;
  formProps?: Omit<ProjectFormProps, 'getFormApi' | 'onValueChange'>;
  request: (param: ProjectFormValues) => Promise<AuditData>;
  isFormValid: (values: ProjectFormValues) => boolean;
}

export type BizProjectFormModalProps = ProjectFormModalProps & {
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
};

export const ProjectFormModal: React.FC<BizProjectFormModalProps> = ({
  selectSpace,
  formProps = {},
  isFormValid,
  request,
  showMonetizeConfig,
  renderAutoGenerate,
  ...restModalProps
}) => {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditData>({
    check_not_pass: false,
  });
  const {
    bizCallback: { onAfterUpload, onBeforeUpload, onValuesChange },
    isSubmitDisabled,
  } = useFormSubmitState<ProjectFormValues>({
    initialValues: formProps.initValues,
    getIsFormValid: isFormValid,
  });
  const formApi = useRef<FormApi<ProjectFormValues>>();

  const onFormSubmit: ModalProps['onOk'] = async () => {
    if (!formApi.current) {
      return;
    }
    try {
      setLoading(true);
      const auditData = await request(formApi.current.getValues());
      setAuditResult(auditData);

      // Do not close the pop-up window without passing the verification
      if (auditData.check_not_pass) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      size="default"
      okText={I18n.t('Confirm')}
      cancelText={I18n.t('Cancel')}
      okButtonProps={{
        disabled: isSubmitDisabled,
        loading,
      }}
      onOk={onFormSubmit}
      {...restModalProps}
    >
      <ProjectForm
        {...formProps}
        getFormApi={api => {
          formApi.current = api;
        }}
        onValueChange={onValuesChange}
      >
        {selectSpace ? <SpaceFormSelect field={filedKeyMap.space_id} /> : null}
        <ProjectInfoFieldFragment
          showMonetizeConfig={showMonetizeConfig}
          onBeforeUpload={onBeforeUpload}
          onAfterUpload={onAfterUpload}
          renderAutoGenerate={renderAutoGenerate}
        />
      </ProjectForm>
      {auditResult.check_not_pass ? (
        <div className="coz-fg-hglt-red mt-[-8px]">
          <ReactMarkdown skipHtml={true} linkTarget="_blank">
            {/* Note that using | | msg undefined or empty string goes to the bottom */}
            {auditResult.check_not_pass_msg || I18n.t('publish_audit_pop7')}
          </ReactMarkdown>
        </div>
      ) : null}
    </Modal>
  );
};
