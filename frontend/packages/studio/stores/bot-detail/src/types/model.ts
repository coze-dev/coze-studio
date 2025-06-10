import type { Model, ModelInfo } from '@coze-arch/bot-api/developer_api';

/** 模型设置 */
export interface BotDetailModel {
  config: ModelInfo;
  /** 全部可选模型 */
  modelList: Model[];
}
