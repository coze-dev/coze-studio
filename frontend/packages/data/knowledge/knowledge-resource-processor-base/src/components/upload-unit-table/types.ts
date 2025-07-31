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

import { type ReactNode } from 'react';

import {
  type UnitType,
  type UnitItem,
} from '@coze-data/knowledge-resource-processor-core';
import { type UIActionItemProps } from '@coze-arch/bot-semi';
import { type FormatType } from '@coze-arch/bot-api/memory';

export interface UploadStateProps {
  record: UnitItem;
  onRetry?: (record: UnitItem, index: number) => void;
  index: number;
  needLoading?: boolean;
  overlayClassName?: string;
  disableRetry?: boolean;
  // Do not show retry copy
  noRetry?: boolean;
}

export interface UnitNameProps {
  canValidator?: boolean;
  edit?: boolean;
  disabled?: boolean;
  inModal?: boolean;
  formatType: FormatType;
  onChange: (value: string) => void;
  record: UnitItem;
}

export interface ActionProps {
  showEdit?: boolean;
  onDelete: () => void;
  deleteProps?: UIActionItemProps;
  editProps?: UIActionItemProps;
  record?: UnitItem;
}

export enum ActionType {
  Edit = 'edit',
  Delete = 'delete',
}

export type HandleChange = (
  unitList: UnitItem[],
  action?: {
    type: ActionType;
    index: number;
  },
) => void;

export interface ColumnInfo {
  subText?: ReactNode;
  actions?: ReactNode[];
  formatType?: FormatType;
}

export interface UploadUnitTableProps {
  type: UnitType;
  unitList: UnitItem[];
  onChange: HandleChange;
  edit: boolean;
  canValidator?: boolean;
  onRetry?: (record: UnitItem, index: number) => void;
  disableRetry?: boolean;
  onDelete?: (record: UnitItem, index: number) => void;
  showEdit?: boolean;
  inModal?: boolean;
  getColumns?: (record: UnitItem, index: number) => ColumnInfo;
}
export interface GetColumnsParams extends UploadUnitTableProps {
  formatType: FormatType;
}

export interface RenderColumnsProps {
  params: UploadUnitTableProps;
  record: UnitItem;
  index: number;
}
