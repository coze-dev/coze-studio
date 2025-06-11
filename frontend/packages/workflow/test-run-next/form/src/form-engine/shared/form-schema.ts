import { type ReactNode } from 'react';

import { ReactiveState } from '@flowgram-adapter/common';

import type { IFormSchema, FormSchemaUIState } from '../types';

interface PropertyWithKey {
  key: string;
  schema: IFormSchema;
}

export class FormSchema implements IFormSchema {
  /** IFormSchema 透传属性 */
  type?: string | undefined;
  title?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  properties?: Record<string, IFormSchema>;
  defaultValue?: any;

  /** 模型属性 */
  uiState = new ReactiveState<FormSchemaUIState>({ disabled: false });
  path: string[] = [];

  constructor(json: IFormSchema, path: string[] = []) {
    this.fromJSON(json);
    this.path = path;
  }

  get componentType() {
    return this['x-component'];
  }
  get componentProps() {
    return this['x-component-props'];
  }
  get decoratorType() {
    return this['x-decorator'];
  }
  get decoratorProps() {
    return this['x-decorator-props'];
  }

  fromJSON(json: IFormSchema) {
    Object.entries(json).forEach(([key, value]) => {
      this[key] = value;
    });
    this.uiState.value.disabled = json['x-disabled'] ?? false;
  }

  /**
   * 获得有序的 properties
   */
  static getProperties(schema: FormSchema | IFormSchema) {
    const orderProperties: PropertyWithKey[] = [];
    const unOrderProperties: PropertyWithKey[] = [];
    Object.entries(schema.properties || {}).forEach(([key, item]) => {
      const index = item['x-index'];
      if (index !== undefined && !isNaN(index)) {
        orderProperties[index] = { schema: item, key };
      } else {
        unOrderProperties.push({ schema: item, key });
      }
    });
    return orderProperties.concat(unOrderProperties).filter(item => !!item);
  }
}
