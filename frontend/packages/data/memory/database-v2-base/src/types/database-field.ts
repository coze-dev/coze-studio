import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import {
  type AlterBotTableResponse,
  type InsertBotTableResponse,
} from '@coze-arch/bot-api/memory';

export type OnSave = (params: {
  response: InsertBotTableResponse | AlterBotTableResponse;
}) => Promise<void>;

/* eslint-disable @typescript-eslint/naming-convention -- 历史文件拷贝 */
export enum CreateType {
  custom = 'custom',
  template = 'template',
  excel = 'excel',
  // 推荐建表
  recommend = 'recommend',
  // 输入自然语言建表
  naturalLanguage = 'naturalLanguage',
}
/* eslint-enable @typescript-eslint/naming-convention -- 历史文件拷贝 */

export interface MapperItem {
  label: string;
  key: string;
  validator: {
    type: VerifyType;
    message: string;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 历史文件拷贝
  defaultValue: any;
  require: boolean;
}

export type TableBasicInfo = Pick<
  DatabaseInfo,
  'name' | 'desc' | 'readAndWriteMode'
> & { prompt_disabled: boolean };
export type TableFieldsInfo = DatabaseInfo['tableMemoryList'];

export enum VerifyType {
  Required = 1,
  Unique = 2,
  Naming = 3,
}

export type TriggerType = 'blur' | 'change' | 'save';

export interface NL2DBInfo {
  prompt: string;
}

export type ReadAndWriteModeOptions = 'excel' | 'normal' | 'expert';
