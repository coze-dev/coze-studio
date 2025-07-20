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
 
import {
  type UpdateType,
  type DocumentStatus,
  type Int64,
  type WebStatus,
  type DocumentProgress,
} from '@coze-arch/bot-api/knowledge';

import type { FileNodeType, EntityStatus, UploadStatus } from '../constants';

interface CommonUnitItem {
  key?: string;
  percent: number | undefined;
  status: UploadStatus | WebStatus | EntityStatus;
  type: string; // unit类型，url、doc、pdf等
  uri: string; // 文件在tos上的的相对路径url｜web_url
  url: string; // 文件的绝对url
  name: string; // unit name｜webpage title
  validateMessage?: string;
  // 外部传入的动态 errorMessage
  dynamicErrorMessage?: string;
}

interface DocUnitItem {
  size?: string; // 文件大小
  docId?: string; // 文档ID，update content时用到
  fileInstance?: File | undefined;
  uid?: string;
}
interface URLUnitItem {
  updateInterval?: number; // URL使用，更新频率
  subpagesCount?: number;
  updateType?: UpdateType;
  webID?: string;
  statusDescript?: string;
  manualCrawlingConfig?: {
    response: {
      title: string;
      url: string;
      recordType: 'text' | 'list';
      result: {
        key: string;
        name: string;
        data: string | string[];
        xPath: string;
        type: 'text' | 'image' | 'link';

        /**
         * FIXME: 为了兼容性无法修改 data 结构，所以深度采集时会带上以下三个参数
         */
        parentKey?: string;
        titles?: string[];
        urls?: string[];
      }[];
    };
    /**
     * 如果是深度采集得到的文档，则存在值，对应父文档 column 的key
     */
    fromParentUnitColumnKey?: string;
  };
  manualCrawlingTableContent?: Record<string, string>[];
}

/**
 * 三方数据连接器任务
 */
interface EntityUnitItem {
  file_name?: string;
  file_id?: string;
  entity_id?: string;
  tos_url?: string;
  error_msg?: string;
  file_node_type?: FileNodeType;
  has_children_nodes?: boolean;
  error_code?: Int64;
  file_size?: string;
  instance_id?: string;
  tos_key?: string;
}

// TODO 这个 UnitItem 实现有问题，待优化
/** 除了 UnitItem，其他外部都没有用到，暂不导出*/
export type UnitItem = CommonUnitItem &
  DocUnitItem &
  URLUnitItem &
  EntityUnitItem;

export interface ProgressItem extends DocumentProgress {
  documentId: string | undefined;
  progress: number;
  uri: string;
  name: string;
  status: DocumentStatus;
  statusDesc: string;
  remainingTime: number;
}
