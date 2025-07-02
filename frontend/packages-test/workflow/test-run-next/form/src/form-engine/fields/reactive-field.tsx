import React from 'react';

import { useCurrentField, useCurrentFieldState } from '@flowgram-adapter/free-layout-editor';

import { type FormSchemaUIState } from '../types';
import {
  useFieldUIState,
  useFieldSchema,
  useComponents,
  useFormUIState,
} from '../hooks';

interface ReactiveFieldProps {
  parentUIState?: FormSchemaUIState;
}

/**
 * 接入响应式的 Field
 */
const ReactiveField: React.FC<ReactiveFieldProps> = ({ parentUIState }) => {
  const components = useComponents();
  const schema = useFieldSchema();
  const field = useCurrentField();
  const uiState = useFieldUIState();
  const formUIState = useFormUIState();
  const fieldState = useCurrentFieldState();
  /**
   * 自生的 disabled 态由父亲和自身一起控制
   */
  const disabled =
    parentUIState?.disabled || uiState.disabled || formUIState.disabled;
  const validateStatus = fieldState.errors?.length ? 'error' : undefined;

  const renderComponent = () => {
    if (!schema.componentType || !components[schema.componentType]) {
      return null;
    }
    return React.createElement(components[schema.componentType], {
      disabled,
      validateStatus,
      value: field.value,
      onChange: field.onChange,
      onFocus: field.onFocus,
      onBlur: field.onBlur,
      ['data-testid']: ['workflow', 'testrun', 'form', 'component']
        .concat(schema.path)
        .join('.'),
      ...schema.componentProps,
    });
  };

  const renderDecorator = (children: React.ReactNode) => {
    if (!schema.decoratorType || !components[schema.decoratorType]) {
      return <>{children}</>;
    }
    return React.createElement(
      components[schema.decoratorType],
      {
        ...schema.decoratorProps,
        ['data-testid']: ['workflow', 'testrun', 'form', 'decorator']
          .concat(schema.path)
          .join('.'),
      },
      children,
    );
  };

  return renderDecorator(renderComponent());
};

export { ReactiveField, ReactiveFieldProps };
