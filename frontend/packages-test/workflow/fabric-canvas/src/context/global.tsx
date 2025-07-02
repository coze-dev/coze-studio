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
