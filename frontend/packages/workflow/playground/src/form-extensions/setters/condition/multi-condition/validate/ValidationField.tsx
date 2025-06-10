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

    // TODO： 这里耦合了外部的状态，实际上应该由表单统一管理一才对
    // 监听画布表单提交时，显示错误信息
    useEffect(() => {
      if (flowNodeEntity) {
        const disposable =
          /* eslint-disable @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-explicit-any
          -- disable-next-line 与 unused-comment规则自动修复有冲突
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
