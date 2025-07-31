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

import { nanoid } from 'nanoid';
import {
  exhaustiveCheckSimple,
  safeAsyncThrow,
} from '@coze-common/chat-area-utils';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import {
  type project_memory as ProjectMemory,
  VariableChannel,
  VariableType,
} from '@coze-arch/bot-api/memory';

import {
  VariableTypeDTO,
  type VariableSchemaDTO,
  ViewVariableType,
} from '../types';
import { type VariableGroup, type Variable } from '../store';

export const getGroupListByDto = (
  dtoGroups: ProjectMemory.GroupVariableInfo[],
): VariableGroup[] => {
  const groups = dtoGroups?.map(group => {
    const baseGroupInfo = getBaseGroupInfoByDto(group);
    const { groupId } = baseGroupInfo;
    const varInfoList = getGroupVariableListByDto({
      group,
      groupId,
    });
    return {
      ...baseGroupInfo,
      varInfoList,
      subGroupList: getSubGroupListByDto({
        group,
        groupId,
      }),
    };
  });
  return groups || [];
};

const getBaseGroupInfoByDto = (
  group: Partial<ProjectMemory.GroupVariableInfo>,
): Omit<VariableGroup, 'subGroupList' | 'varInfoList'> => {
  const {
    GroupName: groupName = '',
    GroupDesc: groupDesc = '',
    GroupExtDesc: groupExtDesc = '',
    IsReadOnly: isReadOnly = false,
    DefaultChannel: channel = VariableChannel.Custom,
  } = group;
  const groupId = nanoid();
  return {
    groupId,
    groupName,
    groupDesc,
    groupExtDesc,
    channel,
    isReadOnly,
    raw: group,
  };
};

const getGroupVariableListByDto = ({
  group,
  groupId,
}: {
  group: Partial<ProjectMemory.GroupVariableInfo>;
  groupId: string;
}): Variable[] => {
  const { VarInfoList: varInfoList = [] } = group;
  return (
    varInfoList?.map(dtoVariable =>
      getViewVariableByDto(dtoVariable, groupId),
    ) ?? []
  );
};

const getSubGroupListByDto = ({
  group,
  groupId,
}: {
  group: Partial<ProjectMemory.GroupVariableInfo>;
  groupId: string;
}): VariableGroup[] => {
  const { SubGroupList: subGroupList = [] } = group;
  return (
    subGroupList?.map(subGroup => ({
      ...getBaseGroupInfoByDto({
        ...subGroup,
        DefaultChannel: group.DefaultChannel, // The subGroup returned by the server level has no DefaultChannel and needs to be set manually
      }),
      groupId,
      varInfoList: getGroupVariableListByDto({
        group: subGroup,
        groupId,
      }),
      subGroupList: [],
    })) ?? []
  );
};

export function getViewVariableByDto(
  dtoVariable: ProjectMemory.Variable,
  groupId: string,
): Variable {
  const variableSchema = typeSafeJSONParse(
    dtoVariable.Schema || '{}',
  ) as VariableSchemaDTO;

  const { type } = variableSchema;

  const baseVariable = createBaseVariable({
    dtoVariable,
    groupId,
  });

  if (type === VariableTypeDTO.List) {
    return convertListVariable(baseVariable, variableSchema);
  }

  if (type === VariableTypeDTO.Object) {
    return convertObjectVariable(baseVariable, variableSchema);
  }

  return {
    ...baseVariable,
    type: dTOTypeToViewType(variableSchema.type),
    children: [],
  };
}

export function dTOTypeToViewType(
  type: VariableTypeDTO,
  {
    arrayItemType,
  }: {
    arrayItemType?: VariableTypeDTO;
  } = {},
): ViewVariableType {
  switch (type) {
    case VariableTypeDTO.Boolean:
      return ViewVariableType.Boolean;
    case VariableTypeDTO.Integer:
      return ViewVariableType.Integer;
    case VariableTypeDTO.Float:
      return ViewVariableType.Number;
    case VariableTypeDTO.String:
      return ViewVariableType.String;
    case VariableTypeDTO.Object:
      return ViewVariableType.Object;
    case VariableTypeDTO.List:
      if (!arrayItemType) {
        throw new Error(
          `Unkown variable DTO list need sub type but get ${arrayItemType}`,
        );
      }

      switch (arrayItemType) {
        case VariableTypeDTO.Boolean:
          return ViewVariableType.ArrayBoolean;
        case VariableTypeDTO.Integer:
          return ViewVariableType.ArrayInteger;
        case VariableTypeDTO.Float:
          return ViewVariableType.ArrayNumber;
        case VariableTypeDTO.String:
          return ViewVariableType.ArrayString;
        case VariableTypeDTO.Object:
          return ViewVariableType.ArrayObject;
        case VariableTypeDTO.List:
          safeAsyncThrow(
            `List type variable can't have sub list type: ${type}:${arrayItemType}`,
          );
          return ViewVariableType.String;
        default:
          exhaustiveCheckSimple(arrayItemType);
          safeAsyncThrow(`Unknown variable DTO Type: ${type}:${arrayItemType}`);
          return ViewVariableType.String;
      }
    default:
      exhaustiveCheckSimple(type);
      safeAsyncThrow(`Unknown variable DTO Type: ${type}:${arrayItemType}`);
      return ViewVariableType.String;
  }
}

function createBaseVariable({
  dtoVariable,
  groupId,
}: {
  dtoVariable: ProjectMemory.Variable;
  groupId: string;
}): Omit<Variable, 'type' | 'children'> {
  return {
    variableId: nanoid(),
    name: dtoVariable.Keyword ?? '',
    description: dtoVariable.Description ?? '',
    enabled: dtoVariable.Enable ?? true,
    defaultValue: dtoVariable.DefaultValue ?? '',
    channel: dtoVariable.Channel ?? VariableChannel.Custom,
    effectiveChannelList: dtoVariable.EffectiveChannelList ?? [],
    variableType: dtoVariable.VariableType ?? VariableType.KVVariable,
    readonly: dtoVariable.IsReadOnly ?? false,
    groupId,
    parentId: '',
    meta: {
      isHistory: true,
    },
  };
}

function convertListVariable(
  baseVariable: Omit<Variable, 'type' | 'children'>,
  variableSchema: VariableSchemaDTO,
): Variable {
  const subVariableSchema = variableSchema.schema as VariableSchemaDTO;

  const { type: subVariableType } = subVariableSchema;

  if (subVariableType === VariableTypeDTO.Object) {
    return convertListObjectVariable(baseVariable, variableSchema);
  }

  return {
    ...baseVariable,
    type: dTOTypeToViewType(variableSchema.type, {
      arrayItemType: subVariableType,
    }),
    children: [],
  } as unknown as Variable;
}

/**
 *@example schema: array<object>
{
    "type": "list",
    "name": "arr_obj",
    "schema": {
        "type": "object",
        "schema": [{
            "type": "string",
            "name": "name",
            "required": false
        }, {
            "type": "integer",
            "name": "age",
            "required": false
        }]
    },
}
*/
function convertListObjectVariable(
  baseVariable: Omit<Variable, 'type' | 'children'>,
  variableSchema: VariableSchemaDTO,
): Variable {
  const subVariableSchema = variableSchema.schema;

  if (!subVariableSchema) {
    throw new Error('List object variable schema is invalid');
  }

  const { type: subVariableType } = subVariableSchema;

  return {
    ...baseVariable,
    type: dTOTypeToViewType(VariableTypeDTO.List, {
      arrayItemType: subVariableType,
    }),
    children: Array.isArray(subVariableSchema.schema)
      ? subVariableSchema.schema.map(schema =>
          createVariableBySchema(schema, {
            groupId: baseVariable.groupId,
            parentId: baseVariable.variableId,
          }),
        )
      : [],
  };
}

/**
 * @example schema: object
 * object
{
    "type": "object",
    "name": "obj",
    "schema": [{
        "type": "string",
        "name": "name",
        "required": false
    }, {
        "type": "integer",
        "name": "age",
        "required": false
    }],
}
 * @returns
 */
function convertObjectVariable(
  baseVariable: Omit<Variable, 'type' | 'children'>,
  variableSchema: VariableSchemaDTO,
): Variable {
  const schema = variableSchema.schema || [];

  return {
    ...baseVariable,
    type: dTOTypeToViewType(variableSchema.type),
    children: Array.isArray(schema)
      ? schema.map(subMeta =>
          createVariableBySchema(subMeta, {
            groupId: baseVariable.groupId,
            parentId: baseVariable.variableId,
          }),
        )
      : [],
  };
}
function createVariableBySchema(
  subMeta: VariableSchemaDTO,
  {
    groupId,
    parentId,
  }: {
    groupId: string;
    parentId: string;
  },
): Variable {
  return getViewVariableByDto(
    {
      Keyword: subMeta.name,
      Description: subMeta.description,
      Schema: JSON.stringify(subMeta),
      Enable: true,
      IsReadOnly: subMeta.readonly,
    },
    groupId,
  );
}
