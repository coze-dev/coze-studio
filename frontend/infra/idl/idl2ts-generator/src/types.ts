import { type IPlugin } from '@coze-arch/idl2ts-plugin';
import { type IParseResultItem } from '@coze-arch/idl2ts-helper';

export interface Options {
  entries: string[];
  idlRoot: string;
  parsedResult?: IParseResultItem[];
  plugins?: IPlugin[];
  allowNullForOptional?: boolean;
  mapEnumKeyAsNumber?: boolean;
  outputDir: string;
  genSchema: boolean;
  genMock: boolean;
  genClient: boolean;
  entryName?: string;
  // createAPI 所在文件路径
  commonCodePath?: string;
  // decode encode 会丢失类型，这里提供一种方式，业务手动补充上对应的类型
  patchTypesOutput?: string;
  // patchTypesOutput 的别名，patch type 需要使用额外的 pkg 组织时需要提供
  patchTypesAliasOutput?: string;
}

export interface IGenOptions extends Options {
  idlRoot: string;
  outputDir: string;
  formatter?: (file: string, code: string) => string;
}
