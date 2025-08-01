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

import React, {
  type ReactElement,
  type CSSProperties,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { WorkflowValidationService } from '@/services';

import { FormItemFeedback } from '../form-item-feedback';
import { useError, useOnTestRunValidate } from './hooks';

interface ValidationErrorWrapperProps {
  path: string;
  children: (options: {
    showError: boolean;
    onBlur: () => void;
    onChange: () => void;
    onFocus: () => void;
  }) => React.ReactNode | ReactElement;
  style?: CSSProperties;
  className?: string;
  errorCompClassName?: string;
}

export const ValidationErrorWrapper: React.FC<ValidationErrorWrapperProps> = ({
  path,
  children,
  style,
  className,
  errorCompClassName,
}) => {
  const validationService = useService<WorkflowValidationService>(
    WorkflowValidationService,
  );
  const node = useCurrentEntity();

  const [isFocused, setFocused] = useState(false);

  const [silence, setSilence] = useState(
    validationService.validatedNodeMap[node.id] ? false : true,
  );
  const error = useError(path);

  const onTestRunValidate = useOnTestRunValidate();
  const showError = Boolean(error) && !silence && !isFocused;

  const onFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setSilence(false);
    setFocused(false);
  }, []);

  const onChange = useCallback(() => {
    setSilence(true);
  }, []);

  useEffect(() => {
    const dispose = onTestRunValidate(() => {
      setSilence(false);
    });

    return () => {
      dispose();
    };
  }, []);

  return (
    <div className={className} style={style}>
      {typeof children === 'function'
        ? children({ showError, onBlur, onChange, onFocus })
        : children}
      {showError ? (
        <FormItemFeedback feedbackText={error} className={errorCompClassName} />
      ) : null}
    </div>
  );
};
