import { type FormDataTypeName } from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableType } from '@coze-workflow/base';

export interface OutputType {
  name: string;
  required: boolean;
  // TODO @heyuan 类型转换兼容，
  // hack: 目前后端保存后会回显成 ParamTypeAlias 类型，
  // 前端使用的是 FormDataTypeName 字符串类型。
  type: FormDataTypeName | ViewVariableType;
  key: string;
}
