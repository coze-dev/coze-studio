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
   * 转换处 list 之外的类型
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
      // 原后端 type: image 兼容
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
    // 如果是数组类型的变量
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

    // AssistType 映射
    const assistType = VIEW_TYPE_TO_ASSIST_TYPE[type];
    if (assistType) {
      return {
        type: VariableTypeDTO.string,
        assistType: Number(assistType) as AssistTypeDTO,
      };
    }

    // 普通类型映射
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
   * 校验下Meta合法性，不合法上报错误
   * @param meta
   */
  function checkDtoMetaValid(meta: VariableMetaDTO) {
    if (!meta?.type) {
      return;
    }

    // 非object和list类型，schema有值的场景上报, 比如 { type: 'string', schema: []}
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
   * 后端变量转前端变量，并补齐 key
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
          // 数组要多下钻一层
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
        // 空的object 需要加上空数组
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
      // 空 object 需要加上空数组
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
   * @deprecated 使用 viewTypeToDTOType
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
   * 前端表达式转后端数据
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
        // Array<T> 类型的 schema 指定 array 的泛型类型
        if (dtoType === VariableTypeDTO.list) {
          schema = {
            type: subType,
            assistType: subAssistType,
          };
          if (subType === VariableTypeDTO.object) {
            schema.schema = [];
          }
          // object 类型的 schema 指定成空数组，字面量没有下钻字段信息
        } else if (dtoType === VariableTypeDTO.object) {
          schema = [];
        }
        // 其他基础类型（string、int、number、boolean）以及 image 等带 assistType 额类型，不传 schema。
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

        // 变量选择复杂类型，再将类型手动改成简单类型，会有schema残留
        // 只有 object 和 list 类型才需要 schema
        if (![VariableTypeDTO.object, VariableTypeDTO.list].includes(dtoType)) {
          schema = undefined;
        }

        // rawMeta 里有类型时，使用 rawMeta 里的类型，后端会对引用变量进行类型转换
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
    // rawMeta 不存在时，需要走兜底逻辑
    if (value && value.type === ValueExpressionType.LITERAL) {
      const assistType = getAssistTypeByViewType(value?.rawMeta?.type);

      // TODO 这里获取不到变量类型，只能简单先这么处理，需要重构解决
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

      // 如果 rawMetaType 不存在或者 rawMetaType 与 refVariableType 相同，则直接返回 workflowVariable?.dtoMeta
      if (!rawMetaType || refVariableType === rawMetaType) {
        return workflowVariable?.dtoMeta;
      }
    }
    if (!rawMetaType) {
      return undefined;
    }
    // 如果 rawMetaType 存在但与 refVariableType 不同，说明发生了类型转换，则需要根据 rawMetaType 转换为 VariableMetaDTO
    return viewMetaToDTOMeta({
      key: nanoid(),
      name: String(value.content ?? ''),
      type: rawMetaType,
    });
  }

  /**
   * 优先使用 literalExpression rawMeta.type 字段获取 literal 类型, 参考 variableUtils.valueExpressionToDTO
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
   * 后端表达式转前端数据
   * @param value
   */
  export function valueExpressionToVO(
    value: ValueExpressionDTO,
    service: WorkflowVariableService,
  ): ValueExpression {
    // 空数据兜底
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
   * input-type-value 前端格式转后端格式
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
   * input-type-value 后端格式转前端格式
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
