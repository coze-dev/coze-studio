import { variableUtils } from '@coze-workflow/variable';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ACCEPT_MAP } from './constants';

export const getAccept = (
  inputType: ViewVariableType,
  availableFileTypes?: ViewVariableType[],
) => {
  let accept: string;
  const itemType = ViewVariableType.isArrayType(inputType)
    ? ViewVariableType.getArraySubType(inputType)
    : inputType;

  if (itemType === ViewVariableType.File) {
    if (availableFileTypes?.length) {
      accept = availableFileTypes
        .map(type => ACCEPT_MAP[type]?.join(','))
        .join(',');
    } else {
      accept = Object.values(ACCEPT_MAP)
        .map(items => items.join(','))
        .join(',');
    }
  } else {
    accept = (ACCEPT_MAP[itemType] || []).join(',');
  }

  return accept;
};

const translateCommonField = (
  temp: any,
  viewVariableType: ViewVariableType,
) => ({
  title: temp.name,
  type: 'string',
  'x-decorator-props': {
    tag: ViewVariableType.LabelMap[viewVariableType],
    description: temp.description,
  },
  'x-decorator': 'FormItem',
  required: temp.required,
  'x-validator': temp.required
    ? {
        required: true,
        message: I18n.t('workflow_testset_required_tip', {
          param_name: temp.name,
        }),
      }
    : undefined,
});

const translateFileField = (temp: any, viewVariableType: ViewVariableType) => ({
  ...translateCommonField(temp, viewVariableType),
  type: 'string',
  'x-component': 'FileUpload',
  'x-component-props': {
    multiple: ViewVariableType.isArrayType(viewVariableType),
    accept: getAccept(viewVariableType),
    fileType: [ViewVariableType.Image, ViewVariableType.ArrayImage].includes(
      viewVariableType,
    )
      ? 'image'
      : 'object',
  },
});

const translateVoiceField = (
  temp: any,
  viewVariableType: ViewVariableType,
) => ({
  ...translateCommonField(temp, viewVariableType),
  type: 'string',
  'x-component': 'VoiceSelect',
  'x-component-props': {},
});

const translateBooleanField = (
  temp: any,
  viewVariableType: ViewVariableType,
) => ({
  ...translateCommonField(temp, viewVariableType),
  type: 'boolean',
  'x-component': 'Switch',
  default: true,
});

const translateNumberField = (
  temp: any,
  viewVariableType: ViewVariableType,
) => ({
  ...translateCommonField(temp, viewVariableType),
  type: 'number',
  'x-component':
    viewVariableType === ViewVariableType.Integer
      ? 'InputInteger'
      : 'InputNumber',
});

const translateField = (temp: any) => {
  if (!temp || !temp.type) {
    return null;
  }
  const viewVariableType = variableUtils.DTOTypeToViewType(temp.type, {
    assistType: temp.assistType || temp.schema?.assistType,
    arrayItemType: temp.schema?.type,
  });
  if (ViewVariableType.isVoiceType(viewVariableType)) {
    return translateVoiceField(temp, viewVariableType);
  }
  if (ViewVariableType.isFileType(viewVariableType)) {
    return translateFileField(temp, viewVariableType);
  }
  if (viewVariableType === ViewVariableType.Boolean) {
    return translateBooleanField(temp, viewVariableType);
  }
  if (
    viewVariableType === ViewVariableType.Number ||
    viewVariableType === ViewVariableType.Integer
  ) {
    return translateNumberField(temp, viewVariableType);
  }
  if (viewVariableType === ViewVariableType.Time) {
    return translateTimeField(temp, viewVariableType);
  }

  return {
    title: temp.name,
    // 一期固定为 string
    type: 'string',
    'x-decorator-props': {
      tag: temp.type,
      description: temp.description,
    },
    'x-component': 'Input',
    'x-decorator': 'FormItem',
    required: temp.required,
    'x-validator': {
      required: true,
      message: I18n.t('workflow_testset_required_tip', {
        param_name: temp.name,
      }),
    },
  };
};

export const translateSchema = (temp: any[]) => {
  const root = {
    type: 'object',
    properties: temp.reduce((prev, cur) => {
      const computed = translateField(cur);
      if (cur) {
        prev[cur.name] = computed;
      }
      return prev;
    }, {}),
  };

  return root;
};

const translateTimeField = (temp: any, viewVariableType: ViewVariableType) => ({
  ...translateCommonField(temp, viewVariableType),
  type: 'string',
  'x-component': 'InputTime',
});
