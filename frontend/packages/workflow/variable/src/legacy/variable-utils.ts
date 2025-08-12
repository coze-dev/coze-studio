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

/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBoolean, isInteger, isNil, isNumber } from 'lodash-es';
import { nanoid } from '@flowgram-adapter/free-layout-editor';
import type {
  InputTypeValueDTO,
  ObjectRefExpression,
} from '@coze-workflow/base/src/types';
import {
  BatchMode,
  type InputValueDTO,
  type InputValueVO,
  type RefExpression,
  ValueExpression,
  type ValueExpressionDTO,
  ValueExpressionType,
  type VariableMetaDTO,
  VariableTypeDTO,
  AssistTypeDTO,
  type ViewVariableMeta,
  ViewVariableType,
  type LiteralExpression,
  type InputTypeValueVO,
  reporter,
} from '@coze-workflow/base';

import { type GetKeyPathCtx } from '../core/types';
import { type WorkflowVariableService } from './workflow-variable-service';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace variableUtils {
  export const ASSIST_TYPE_TO_VIEW_TYPE: Record<
    AssistTypeDTO,
    ViewVariableType
  > = {
    [AssistTypeDTO.file]: ViewVariableType.File,
    [AssistTypeDTO.image]: ViewVariableType.Image,
    [AssistTypeDTO.doc]: ViewVariableType.Doc,
    [AssistTypeDTO.code]: ViewVariableType.Code,
    [AssistTypeDTO.ppt]: ViewVariableType.Ppt,
    [AssistTypeDTO.txt]: ViewVariableType.Txt,
    [AssistTypeDTO.excel]: ViewVariableType.Excel,
    [AssistTypeDTO.audio]: ViewVariableType.Audio,
    [AssistTypeDTO.zip]: ViewVariableType.Zip,
    [AssistTypeDTO.video]: ViewVariableType.Video,
    [AssistTypeDTO.svg]: ViewVariableType.Svg,
    [AssistTypeDTO.voice]: ViewVariableType.Voice,
    [AssistTypeDTO.time]: ViewVariableType.Time,
  };

  export const VIEW_TYPE_TO_ASSIST_TYPE: Partial<
    Record<ViewVariableType, AssistTypeDTO>
  > = Object.entries(ASSIST_TYPE_TO_VIEW_TYPE).reduce((acc, [key, value]) => {
    acc[value] = Number(key);
    return acc;
  }, {});

  /**
   * Types other than the conversion list
   * @param type·
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export function DTOTypeToViewType(
    type: VariableTypeDTO,
    {
      arrayItemType,
      assistType,
    }: {
      arrayItemType?: VariableTypeDTO;
      assistType?: AssistTypeDTO;
    } = {},
  ): ViewVariableType {
    switch (type) {
      case VariableTypeDTO.boolean:
        return ViewVariableType.Boolean;
      case VariableTypeDTO.float:
        return ViewVariableType.Number;
      case VariableTypeDTO.integer:
        return ViewVariableType.Integer;
      case VariableTypeDTO.string:
        if (assistType) {
          const targetType = ASSIST_TYPE_TO_VIEW_TYPE[assistType];
          if (targetType) {
            return targetType;
          }
        }
        return ViewVariableType.String;

      case VariableTypeDTO.object:
        return ViewVariableType.Object;
      // Original backend type: image compatible
      case VariableTypeDTO.image:
        return ViewVariableType.Image;
      case VariableTypeDTO.list:
        if (!arrayItemType) {
          throw new Error(
            `Unkown variable DTO list need sub type but get ${arrayItemType}`,
          );
        }

        switch (arrayItemType) {
          case VariableTypeDTO.boolean:
            return ViewVariableType.ArrayBoolean;
          case VariableTypeDTO.float:
            return ViewVariableType.ArrayNumber;
          case VariableTypeDTO.integer:
            return ViewVariableType.ArrayInteger;
          case VariableTypeDTO.string:
            if (assistType) {
              const targetType = ASSIST_TYPE_TO_VIEW_TYPE[assistType];
              if (targetType) {
                return ViewVariableType.wrapToArrayType(targetType);
              }
            }
            return ViewVariableType.ArrayString;
          case VariableTypeDTO.object:
            return ViewVariableType.ArrayObject;
          case VariableTypeDTO.image:
            return ViewVariableType.ArrayImage;
          default:
            throw new Error(
              `Unknown variable DTO Type: ${type}:${arrayItemType}`,
            );
        }

      default:
        throw new Error(`Unknown variable DTO Type: ${type}:${arrayItemType}`);
    }
  }
  export function viewTypeToDTOType(type: ViewVariableType): {
    type: VariableTypeDTO;
    subType?: VariableTypeDTO;
    assistType?: AssistTypeDTO;
    subAssistType?: AssistTypeDTO;
  } {
    // If it is a variable of array type
    if (ViewVariableType.isArrayType(type)) {
      const subViewType = ViewVariableType.getArraySubType(type);
      const { type: subType, assistType: subAssistType } =
        viewTypeToDTOType(subViewType);

      return {
        type: VariableTypeDTO.list,
        subType,
        subAssistType,
      };
    }

    // AssistType Mapping
    const assistType = VIEW_TYPE_TO_ASSIST_TYPE[type];
    if (assistType) {
      return {
        type: VariableTypeDTO.string,
        assistType: Number(assistType) as AssistTypeDTO,
      };
    }

    // Normal type mapping
    switch (type) {
      case ViewVariableType.String:
        return { type: VariableTypeDTO.string };
      case ViewVariableType.Integer:
        return { type: VariableTypeDTO.integer };
      case ViewVariableType.Number:
        return { type: VariableTypeDTO.float };
      case ViewVariableType.Boolean:
        return { type: VariableTypeDTO.boolean };
      case ViewVariableType.Object:
        return { type: VariableTypeDTO.object };
      // case ViewVariableType.Image:
      //   // return { type: VariableTypeDTO.image };

      default:
        throw new Error(`Unkonwn variable view type: ${type}`);
    }
  }

  export const DEFAULT_OUTPUT_NAME = {
    [BatchMode.Batch]: 'outputList',
    [BatchMode.Single]: 'output',
  };

  export const ARRAY_TYPES = ViewVariableType.ArrayTypes;

  /**
   * Check the legitimacy of Meta, and report an error if it is not legal.
   * @param meta
   */
  function checkDtoMetaValid(meta: VariableMetaDTO) {
    if (!meta?.type) {
      return;
    }

    // Non-object and list types, schema scenarios with values are reported, such as {type: 'string', schema: []}
    if (
      ![VariableTypeDTO.list, VariableTypeDTO.object].includes(meta.type) &&
      meta.schema
    ) {
      reporter.event({
        eventName: 'workflow_invalid_variable_meta',
        meta: {
          name: meta.name,
        },
      });
    }
  }

  /**
   * Back-end variable to front-end variable, and fill in the key
   * @param meta
   */
  export function dtoMetaToViewMeta(meta: VariableMetaDTO): ViewVariableMeta {
    checkDtoMetaValid(meta);
    switch (meta.type) {
      case VariableTypeDTO.list:
        return {
          key: nanoid(),
          type: DTOTypeToViewType(meta.type, {
            arrayItemType: meta.schema?.type,
            assistType: meta.schema?.assistType,
          }),
          name: meta.name,
          // The array needs to be drilled down one more layer.
          children: meta.schema?.schema?.map(subMeta =>
            dtoMetaToViewMeta(subMeta),
          ),
          required: meta.required,
          description: meta.description,
          readonly: meta.readonly,
          defaultValue: meta.defaultValue,
        };
      default:
        return {
          key: nanoid(),
          type: DTOTypeToViewType(meta.type, {
            assistType: meta.assistType,
          }),
          name: meta.name,
          children: meta.schema?.map(subMeta => dtoMetaToViewMeta(subMeta)),
          required: meta.required,
          description: meta.description,
          readonly: meta.readonly,
          defaultValue: meta.defaultValue,
        };
      // default:
      //   throw new Error(`Unknown variable type: ${meta.type}`);
    }
  }
  export function viewMetaToDTOMeta(meta: ViewVariableMeta): VariableMetaDTO {
    const { type, subType, assistType, subAssistType } = viewTypeToDTOType(
      meta.type,
    );
    let schema: any = meta.children?.map(child => viewMetaToDTOMeta(child));
    if (subType) {
      if (!schema || schema.length === 0) {
        // Empty objects need to add empty arrays
        if (subType === VariableTypeDTO.object) {
          schema = [];
        } else {
          schema = undefined;
        }
      }
      schema = {
        type: subType,
        assistType: subAssistType,
        schema,
      };
    } else if (type === VariableTypeDTO.object && !schema) {
      // Empty object needs to add empty array
      schema = [];
    }
    return {
      type,
      assistType,
      name: meta.name,
      schema,
      readonly: meta.readonly,
      required: meta.required,
      description: meta.description,
      defaultValue: meta.defaultValue,
    };
  }

  /**
   * @deprecated using viewTypeToDTOType
   * @param type
   * @returns
   */
  function getAssistTypeByViewType(
    type?: ViewVariableType,
  ): AssistTypeDTO | undefined {
    if (isNil(type)) {
      return undefined;
    }
    return VIEW_TYPE_TO_ASSIST_TYPE[
      ViewVariableType.isArrayType(type)
        ? ViewVariableType.getArraySubType(type)
        : type
    ];
  }

  /**
   * Front-end expression to back-end data
   * @param value
   */
  export function valueExpressionToDTO(
    value: ValueExpression | undefined,
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): ValueExpressionDTO {
    if (value?.rawMeta?.type) {
      const viewType = value?.rawMeta?.type as ViewVariableType;
      const {
        type: dtoType,
        assistType,
        subType,
        subAssistType,
      } = viewTypeToDTOType(viewType);
      if (value.type === ValueExpressionType.LITERAL) {
        let schema: any = undefined;
        // A schema of type Array < T > specifies the generic type of an array
        if (dtoType === VariableTypeDTO.list) {
          schema = {
            type: subType,
            assistType: subAssistType,
          };
          if (subType === VariableTypeDTO.object) {
            schema.schema = [];
          }
          // The schema of the object type is specified as an empty array, and the literal has no drill-down field information
        } else if (dtoType === VariableTypeDTO.object) {
          schema = [];
        }
        // Other base types (string, int, number, boolean), as well as image types with an auxType amount, do not pass schema.
        const res: ValueExpressionDTO = {
          type: dtoType,
          assistType,
          value: {
            type: 'literal',
            content: value.content ?? '',
            rawMeta: value.rawMeta,
          },
        };
        if (schema) {
          res.schema = schema;
        }
        return res;
      } else {
        const refExpression = service.refExpressionToDTO(
          value as RefExpression,
          ctx,
        );

        let schema = subType
          ? {
              ...refExpression.schema,
              type: subType,
              assistType: subAssistType,
            }
          : refExpression.schema;

        // Variable select complex type, and then manually change the type to simple type, there will be schema residue
        // Only object and list types require schemas.
        if (![VariableTypeDTO.object, VariableTypeDTO.list].includes(dtoType)) {
          schema = undefined;
        }

        // When there is a type in rawMeta, using the type in rawMeta, the backend will perform type conversion on the reference variable
        return {
          type: dtoType,
          assistType,
          schema,
          value: {
            ...refExpression.value,
            rawMeta: value.rawMeta,
          },
        };
      }
    }
    // When rawMeta does not exist, fallback logic is required
    if (value && value.type === ValueExpressionType.LITERAL) {
      const assistType = getAssistTypeByViewType(value?.rawMeta?.type);

      // TODO can't get the variable type here, so it can only be handled this way first, and it needs to be refactored.
      if (Array.isArray(value.content)) {
        const listRes: ValueExpressionDTO = {
          type: 'list',
          schema: {
            type: 'string',
          },
          value: {
            type: 'literal',
            content: value.content ?? '',
            rawMeta: value.rawMeta,
          },
        };

        if (!isNil(assistType)) {
          listRes.schema.assistType = assistType;
        }

        return listRes;
      }

      const res: ValueExpressionDTO = {
        type: getLiteralExpressionValueDTOType(value.content),
        value: {
          type: 'literal',
          content: !isNil(value.content) ? String(value.content) : '',
          rawMeta: value.rawMeta,
        },
      };

      if (!isNil(assistType)) {
        res.assistType = assistType;
      }

      return res;
    }

    return service.refExpressionToDTO(value as RefExpression, ctx);
  }

  export function getValueExpressionViewType(
    value: ValueExpression,
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): ViewVariableType | undefined {
    if (ValueExpression.isEmpty(value)) {
      return undefined;
    }
    const rawMetaType = value.rawMeta?.type;
    if (rawMetaType) {
      return rawMetaType;
    }
    if (ValueExpression.isRef(value)) {
      return service.getWorkflowVariableByKeyPath(value.content?.keyPath, ctx)
        ?.viewType;
    }
    if (ValueExpression.isLiteral(value)) {
      const dtoType = getLiteralExpressionValueDTOType(value.content);
      return dtoType ? DTOTypeToViewType(dtoType) : undefined;
    }
  }

  export function getValueExpressionDTOMeta(
    value: ValueExpression,
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): VariableMetaDTO | undefined {
    if (ValueExpression.isEmpty(value)) {
      return undefined;
    }
    const rawMetaType = value.rawMeta?.type;

    if (ValueExpression.isRef(value)) {
      const workflowVariable = service.getWorkflowVariableByKeyPath(
        value.content?.keyPath,
        ctx,
      );
      const refVariableType = workflowVariable?.viewType;

      // If rawMetaType does not exist or rawMetaType is the same as refVariableType, return workflowVariable? .dtoMeta directly
      if (!rawMetaType || refVariableType === rawMetaType) {
        return workflowVariable?.dtoMeta;
      }
    }
    if (!rawMetaType) {
      return undefined;
    }
    // If rawMetaType exists but is different from refVariableType, a type conversion has occurred and needs to be converted to VariableMetaDTO according to rawMetaType
    return viewMetaToDTOMeta({
      key: nanoid(),
      name: String(value.content ?? ''),
      type: rawMetaType,
    });
  }

  /**
   * Priority is given to using the literalExpression rawMeta.type field to obtain the literal type, refer to variableUtils.valueExpressionToDTO
   * @param content
   * @returns
   */
  export function getLiteralExpressionValueDTOType(
    content: LiteralExpression['content'],
  ) {
    if (isNil(content)) {
      return VariableTypeDTO.string;
    }
    if (isInteger(content)) {
      return VariableTypeDTO.integer;
    } else if (isNumber(content)) {
      return VariableTypeDTO.float;
    } else if (isBoolean(content)) {
      return VariableTypeDTO.boolean;
    } else {
      return VariableTypeDTO.string;
    }
  }
  export function getLiteralValueWithType(
    type: VariableTypeDTO,
    content?: any,
  ) {
    if (type === VariableTypeDTO.float || type === VariableTypeDTO.integer) {
      return isNumber(Number(content)) ? Number(content) : content;
    } else if (type === VariableTypeDTO.boolean) {
      return ![false, 'false'].includes(content);
    } else {
      return content;
    }
  }

  /**
   * Back-end expression to front-end data
   * @param value
   */
  export function valueExpressionToVO(
    value: ValueExpressionDTO,
    service: WorkflowVariableService,
  ): ValueExpression {
    // empty data bottom line
    if (!value?.value?.type) {
      return {} as any;
    }
    if (value.value.type === 'literal') {
      return {
        type: ValueExpressionType.LITERAL,
        content: getLiteralValueWithType(
          value.type as VariableTypeDTO,
          value.value.content as string,
        ),
        rawMeta: value.value.rawMeta,
      };
    }
    const refExpression = service.refExpressionToVO(value);
    refExpression.rawMeta = value.value.rawMeta;
    return refExpression;
  }

  export function inputObjectRefToDTO(
    value: InputValueVO,
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): InputValueDTO | undefined {
    const schema = value.children
      ?.map(child => inputValueToDTO(child, service, ctx))
      .filter(Boolean) as InputValueDTO[] | undefined;
    const dto: InputValueDTO = {
      name: value.name,
      input: {
        value: {
          type: 'object_ref',
        },
        type: 'object',
        schema,
      },
    };

    return dto;
  }

  export function inputValueToDTO(
    value: InputValueVO,
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): InputValueDTO | undefined {
    if (ValueExpression.isObjectRef(value.input)) {
      return inputObjectRefToDTO(value, service, ctx);
    }

    if (ValueExpression.isEmpty(value.input)) {
      return undefined;
    }

    const dto: InputValueDTO = {
      name: value.name,
      input: valueExpressionToDTO(value.input, service, ctx),
    };

    return dto;
  }

  export function inputObjectRefToVO(
    value: InputValueDTO,
    service: WorkflowVariableService,
  ): InputValueVO {
    const input: ObjectRefExpression = {
      type: ValueExpressionType.OBJECT_REF,
      rawMeta: { type: ViewVariableType.Object },
    };

    const vo: InputValueVO = {
      name: value.name,
      key: nanoid(),
      input,
      children: (value.input?.schema || [])
        .map(child => inputValueToVO(child, service))
        .filter(Boolean),
    };

    return vo;
  }

  export function inputValueToVO(
    value: InputValueDTO,
    service: WorkflowVariableService,
  ): InputValueVO {
    if (value.input?.value?.type === 'object_ref') {
      return inputObjectRefToVO(value, service);
    }

    const vo: InputValueVO = {
      name: value.name,
      input: valueExpressionToVO(value.input, service) as any,
    };

    return vo;
  }

  /**
   * input-type-value front-end format to back-end format
   */
  export function inputTypeValueVOToDTO(
    value: InputTypeValueVO[],
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): InputTypeValueDTO[] {
    return value.map(param => {
      const transType = variableUtils.viewTypeToDTOType(param.type);
      return {
        name: param.name,
        input: variableUtils.valueExpressionToDTO(param.input, service, ctx),
        type: transType.type,
      };
    });
  }

  /**
   * input-type-value backend format to frontend format
   */
  export function inputTypeValueDTOToVO(
    value: InputTypeValueDTO[],
    service: WorkflowVariableService,
    ctx: GetKeyPathCtx,
  ): InputTypeValueVO[] {
    return value.map(param => ({
      name: param.name,
      input: variableUtils.valueExpressionToVO(param.input, service),
      type: variableUtils.DTOTypeToViewType(param.type),
    }));
  }
}
