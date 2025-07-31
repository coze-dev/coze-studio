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

import { type shortcut_command } from '@coze-arch/bot-api/playground_api';

import { type DSL } from '../../types';
import { type DSLFormFieldCommonProps } from '../../components/short-cut-panel/widgets/types';
import {
  getDSLTemplate,
  getFormItemDSLMap,
  getFormItemPlaceholderDSL,
  getLayoutDSL,
} from './templates';

// Generating a complete DSL with Components
export const getDSLFromComponents = (
  params: shortcut_command.Components[],
): DSL => {
  const formItemsDSL = params.map(getFormElementFromComponent);
  const layoutDSL = getElementsLayout(formItemsDSL);
  const template = getDSLTemplate();
  template.elements.form?.children?.unshift(...layoutDSL.map(item => item.id));
  [...formItemsDSL, ...layoutDSL].forEach(
    item => (template.elements[item.id] = item),
  );
  // @ts-expect-error supports direct delivery of props
  template.elements.submitButton.props.formFields = formItemsDSL.map(
    item => item.id,
  );
  return template;
};

type DSLElement = DSL['elements'][string];

// Create the corresponding form element Element in the DSL through Components
export const getFormElementFromComponent = (
  param: shortcut_command.Components,
): DSLElement => {
  if (param.input_type !== undefined) {
    return getFormItemDSLMap[param.input_type](param);
  }
  return getFormItemPlaceholderDSL();
};

// Container elements for generating two-column layouts in DSL syntax
const ITEMS_PER_LINE = 2;
export const getElementsLayout = (elements: DSLElement[]): DSLElement[] => {
  const res: DSLElement[] = [];
  const elementsCopy = [...elements];
  // If an odd number appears, the last line is full
  while (elementsCopy.length) {
    res.push(getLayoutDSL(elementsCopy.splice(0, ITEMS_PER_LINE)));
  }
  return res;
};

export enum ElementType {
  Input = '@flowpd/cici-components/Input',
}

export const findInputElementsWithDefault = (dsl: DSL) => {
  if (!dsl?.elements) {
    return [];
  }

  return Object.values(dsl.elements)
    .map(c => {
      const defaultValue = c?.props
        ?.defaultValue as DSLFormFieldCommonProps['defaultValue'];

      return {
        defaultValue: defaultValue?.value,
        type: c.type,
        id: c.id,
      };
    })
    .filter(e => e.type === ElementType.Input && !!e.defaultValue);
};

export const findInputElementById = (dsl: DSL, id: string) => {
  if (!dsl?.elements) {
    return null;
  }

  return (
    Object.values(dsl.elements)
      .filter(e => e.type === ElementType.Input)
      .find(e => e.id === id) ?? null
  );
};
