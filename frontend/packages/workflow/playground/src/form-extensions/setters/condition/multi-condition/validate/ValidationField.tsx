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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React, { useState, useEffect } from 'react';

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { WorkflowValidationService } from '@/services';

import { useConditionContext } from '../context';
import {
  FormItemFeedback,
  type FormItemErrorProps,
} from '../../../../components/form-item-feedback';

export const withValidationField =
  <C extends React.ElementType>(
    // eslint-disable-next-line @typescript-eslint/naming-convention -- react comp
    Comp: C,
  ) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: any) => {
    const { value, disabled, onChange, onBlur, validateResult, ...others } =
      props;
    const { flowNodeEntity } = useConditionContext();
    const node = useCurrentEntity();

    const validationService = useService<WorkflowValidationService>(
      WorkflowValidationService,
    );

    const [isShowValidate, setIsShowValidate] = useState(
      validationService.validatedNodeMap[node.id] ? true : false,
    );

    // When listening for a canvas form submission, an error message is displayed
    useEffect(() => {
      if (flowNodeEntity) {
        const disposable =
          /* eslint-disable @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-explicit-any
          -- disable-next-line conflicts with the automatic repair of the unused-comment rule
          */
          (
            flowNodeEntity.getData<FlowNodeFormData>(FlowNodeFormData)!
              .formModel! as any
          ).onValidate(() => {
            setIsShowValidate(true);
          });
        return () => {
          disposable.dispose();
        };
      }
    }, [flowNodeEntity]);

    useEffect(() => {
      if (disabled === true) {
        setIsShowValidate(false);
      }
    }, [disabled]);

    const handleOnChange = (innerValue: unknown) => {
      setIsShowValidate(true);
      onChange?.(innerValue);
    };

    const handleOnBlur = () => {
      setIsShowValidate(true);
      onBlur?.();
    };

    return (
      <>
        <Comp
          {...others}
          disabled={disabled}
          value={value}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          validateStatus={
            isShowValidate ? validateResult?.validStatus : undefined
          }
        />
        {isShowValidate && validateResult?.message ? (
          <FormItemFeedback
            feedbackStatus={
              validateResult?.validStatus as FormItemErrorProps['feedbackStatus']
            }
            feedbackText={validateResult?.message ?? ''}
          />
        ) : null}
      </>
    );
  };
