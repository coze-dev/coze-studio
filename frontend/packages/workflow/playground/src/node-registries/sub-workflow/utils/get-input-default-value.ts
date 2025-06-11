import { variableUtils } from '@coze-workflow/variable';
import {
  type DTODefine,
  ValueExpressionType,
  VariableTypeDTO,
  type ValueExpression,
  type LiteralExpression,
} from '@coze-workflow/base';

const parseUploadURLFileName = (url: string) => {
  try {
    return new URL(url)?.searchParams?.get('x-wf-file_name') ?? 'unknown';
  } catch (e) {
    console.error(e);
    return '';
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFileDefaultValue = (input: any): LiteralExpression => {
  const { defaultValue, assistType, type } = input;
  return {
    type: ValueExpressionType.LITERAL,
    content: defaultValue,
    rawMeta: {
      type: variableUtils.DTOTypeToViewType(type as VariableTypeDTO, {
        assistType,
      }),
      fileName: parseUploadURLFileName(defaultValue),
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFileListDefaultValue = (input: any): LiteralExpression => {
  const { defaultValue, type, schema } = input;
  const fileList = JSON.parse(defaultValue as string) as string[];

  return {
    type: ValueExpressionType.LITERAL,
    content: fileList,
    rawMeta: {
      type: variableUtils.DTOTypeToViewType(type as VariableTypeDTO, {
        arrayItemType: schema?.type,
        assistType: schema?.assistType,
      }),
      fileName: fileList.map(parseUploadURLFileName),
    },
  };
};

/**
 * 获取子 workflow 节点入参的默认值，定义在子 workflow start 节点参数的 defaultValue
 * @param input 子 workflow 参数定义
 * @returns
 */
export const getInputDefaultValue = (
  input: DTODefine.InputVariableDTO,
): ValueExpression => {
  const { defaultValue } = input;
  if (!defaultValue) {
    return {
      type: ValueExpressionType.REF,
    };
  }
  // Array<File>
  if (input.type === VariableTypeDTO.list && input.schema?.assistType) {
    return getFileListDefaultValue(input);
    // File
  } else if (input.type === VariableTypeDTO.string && input.assistType) {
    return getFileDefaultValue(input);
    // FIXME: array、object 类型暂时不支持回显 json 字符串作为默认值 @zhangchaoyang.805
  } else if (
    input.type === VariableTypeDTO.list ||
    input.type === VariableTypeDTO.object
  ) {
    return {
      type: ValueExpressionType.REF,
    };
  } else {
    return {
      type: ValueExpressionType.LITERAL,
      content: variableUtils.getLiteralValueWithType(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input.type as any,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input.defaultValue as any,
      ) as string | number | boolean,
    };
  }
};
