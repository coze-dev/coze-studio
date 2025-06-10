import { useState, useRef } from 'react';

import { useDebounceEffect } from 'ahooks';
import { useService } from '@flowgram-adapter/free-layout-editor';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateValidateError,
} from '../../validate';
import { EncapsulateService } from '../../encapsulate';
import { useVariableChange } from './use-variable-change';
import { useSelectedNodes } from './use-selected-nodes';

const DEBOUNCE_DELAY = 100;

/**
 * 校验
 */
export function useValidate() {
  const { selectedNodes } = useSelectedNodes();
  const encapsulateService = useService<EncapsulateService>(EncapsulateService);

  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<EncapsulateValidateError[]>([]);
  const validationIdRef = useRef(0); // 新增校验ID跟踪

  const handleValidate = async () => {
    if (selectedNodes.length <= 1) {
      return;
    }

    setValidating(true);
    // 生成当前校验ID
    const currentValidationId = ++validationIdRef.current;

    try {
      const validateResult = await encapsulateService.validate();

      // 只处理最后一次校验结果
      if (currentValidationId === validationIdRef.current) {
        setErrors(validateResult.getErrors());
        setValidating(false);
      }
    } catch (error) {
      setErrors([
        {
          code: EncapsulateValidateErrorCode.VALIDATE_ERROR,
          message: (error as Error).message,
        },
      ]);
      setValidating(false);
    }
  };

  const { version: variableVersion } = useVariableChange(selectedNodes);

  useDebounceEffect(
    () => {
      handleValidate();
    },
    [selectedNodes, variableVersion],
    {
      wait: DEBOUNCE_DELAY,
    },
  );

  return {
    validating,
    errors,
  };
}
