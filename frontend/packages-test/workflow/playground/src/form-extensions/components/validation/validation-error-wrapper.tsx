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
