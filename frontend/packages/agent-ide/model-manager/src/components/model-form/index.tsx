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

import { useEffect } from 'react';

import { useCreation } from 'ahooks';
import { type ISchema } from '@formily/react';
import { type Form } from '@formily/core';
import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze-arch/coze-design/icons';
import { Loading } from '@coze-arch/coze-design';

import { primitiveExhaustiveCheck } from '../../utils/exhaustive-check';
import {
  type FormilyReactType,
  type FormilyCoreType,
} from '../../context/formily-context/type';
import { useFormily } from '../../context/formily-context';
import { modelFormComponentMap } from './type';
import { ModelSelect } from './model-select';

import styles from './index.module.less';

export interface ModelFormProps {
  currentModelId: string | undefined;
  onModelChange: (value: string) => void;
  onFormInit: (form: Form, formilyCore: FormilyCoreType) => void;
  onFormUnmount: () => void;
  schema: ISchema | undefined;
}

interface ModelFormImplProps extends ModelFormProps {
  formilyCore: FormilyCoreType;
  formilyReact: FormilyReactType;
}

const ModelFormImpl: React.FC<ModelFormImplProps> = ({
  formilyCore,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- this rule does not apply to this case
  formilyReact: { createSchemaField, FormProvider },
  currentModelId,
  onModelChange,
  onFormInit,
  onFormUnmount,
  schema,
}) => {
  const { createForm } = formilyCore;

  const form = useCreation(() => createForm(), [currentModelId]);

  const SchemaField = useCreation(
    () => createSchemaField({ components: modelFormComponentMap }),
    [],
  );

  useEffect(() => {
    // Execute a callback in a promise executor where an error causes a promise rejection asynchronously instead of a white screen
    new Promise(() => onFormInit(form, formilyCore));

    return onFormUnmount;
  }, [form]);

  return (
    <FormProvider form={form}>
      <div>
        <div className={styles['model-select-wrapper']}>
          <span>{I18n.t('model_config_model')}</span>
          <ModelSelect value={currentModelId} onChange={onModelChange} />
        </div>
        <SchemaField schema={schema} />
      </div>
    </FormProvider>
  );
};

export const ModelForm: React.FC<ModelFormProps> = ({
  currentModelId,
  onModelChange,
  onFormInit,
  schema,
  onFormUnmount,
}) => {
  const { formilyModule, retryImportFormily } = useFormily();

  if (formilyModule.status === 'loading' || formilyModule.status === 'unInit') {
    return <Loading loading />;
  }

  if (formilyModule.status === 'error') {
    return (
      <div className={styles['error-state']}>
        <IconCozWarningCircleFill className={styles['fail-page-icon']} />
        <div className={styles['fail-page-text']}>
          <span>{I18n.t('model_form_fail_text')}</span>
          <span
            className={styles['fail-page-retry']}
            onClick={retryImportFormily}
          >
            {I18n.t('model_form_fail_retry')}
          </span>
        </div>
      </div>
    );
  }

  if (formilyModule.status === 'ready') {
    const { formilyCore, formilyReact } = formilyModule;
    return (
      <ModelFormImpl
        schema={schema}
        formilyCore={formilyCore}
        formilyReact={formilyReact}
        currentModelId={currentModelId}
        onModelChange={onModelChange}
        onFormInit={onFormInit}
        onFormUnmount={onFormUnmount}
      />
    );
  }

  primitiveExhaustiveCheck(formilyModule.status);
  return null;
};
