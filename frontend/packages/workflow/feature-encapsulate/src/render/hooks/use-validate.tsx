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
 * validation
 */
export function useValidate() {
  const { selectedNodes } = useSelectedNodes();
  const encapsulateService = useService<EncapsulateService>(EncapsulateService);

  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<EncapsulateValidateError[]>([]);
  const validationIdRef = useRef(0); // Added Verification ID Tracking

  const handleValidate = async () => {
    if (selectedNodes.length <= 1) {
      return;
    }

    setValidating(true);
    // Generate the current verification ID
    const currentValidationId = ++validationIdRef.current;

    try {
      const validateResult = await encapsulateService.validate();

      // Only process the last verification result
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
