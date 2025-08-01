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

export enum ElementPropsType {
  SLOT = 'slot',
  WORKSPACE_SLOT = 'workspaceSlot',
  EXPRESSION = 'expression',
  ACTION = 'action',
}

export interface Expression {
  type?: string;
  value?: string;
}

export interface ElementProps extends Expression {
  type?: ElementPropsType;
  children?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- linter-disable-autofix
  config?: Record<string, any>;
}

export enum ElementDirectiveType {
  EXPRESSION = 'expression',
}

export interface ElementDirective extends Expression {
  type?: ElementDirectiveType;
  value?: string;
}

export interface Element {
  id: string;
  name: string;
  type: string;
  props?: Record<string, ElementProps | ElementProps[]>;
  events?: Record<string, string>;
  directives?: {
    condition?: unknown;
    repeat?: unknown;
  };
  children?: string[];
}

export interface Data {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- linter-disable-autofix
  defaultValue: Record<string, any> | any[];
}

export type ActionsData = ElementDirective;

export interface Actions {
  id: string;
  type: 'submit' | 'updateVar';
  data?: ActionsData;
  target?: string;
}

export interface DSL {
  elements: {
    [key: string]: Element;
  };
  rootID: string;
  variables?: Record<string, Data>;
  actions?: Record<string, Actions>;
  status?: {
    disabled?: boolean;
  };
}
