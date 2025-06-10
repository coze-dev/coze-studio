import { DataSourceType } from '@coze-arch/bot-api/memory';
import { DocumentSource } from '@coze-arch/bot-api/knowledge';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';

export const isFeishuOrLarkDocumentSource = (
  source: DocumentSource | undefined,
) => source === DocumentSource.FeishuWeb || source === DocumentSource.LarkWeb;

export const isFeishuOrLarkDataSourceType = (
  source: DataSourceType | undefined,
) => source === DataSourceType.FeishuWeb || source === DataSourceType.LarkWeb;

export const isFeishuOrLarkTextUnit = (unitType: UnitType | undefined) =>
  unitType === UnitType.TEXT_FEISHU || unitType === UnitType.TEXT_LARK;

export const isFeishuOrLarkTableUnit = (unitType: UnitType | undefined) =>
  unitType === UnitType.TABLE_FEISHU || unitType === UnitType.TABLE_LARK;
