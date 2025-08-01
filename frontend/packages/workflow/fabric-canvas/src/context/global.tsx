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

import { createContext, useContext } from 'react';

import { type FabricObject } from 'fabric';
import { type InputVariable } from '@coze-workflow/base';

import { type IRefPosition, type VariableRef } from '../typings';

export const GlobalContext = createContext<{
  variables?: InputVariable[];
  customVariableRefs?: VariableRef[];
  allObjectsPositionInScreen?: IRefPosition[];
  activeObjects?: FabricObject[];
  addRefObjectByVariable?: (variable: InputVariable) => void;
  updateRefByObjectId?: (data: {
    objectId: string;
    variable?: InputVariable;
  }) => void;
}>({});

export const useGlobalContext = () => useContext(GlobalContext);
