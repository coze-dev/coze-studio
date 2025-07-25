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
 
// copy from @byted/uploader
type TUploaderRegion =
  | 'cn-north-1'
  | 'us-east-1'
  | 'ap-singapore-1'
  | 'us-east-red'
  | 'boe'
  | 'boei18n'
  | 'US-TTP'
  | 'gcp';

interface Window {
  gfdatav1?: {
    // 部署区域
    region?: string;
    // SCM 版本
    ver?: number | string;
    // 当前环境, 取值为 boe 或 prod
    env?: 'boe' | 'prod';
    // 环境标识，如 prod 或 ppe_*
    envName?: string;
    // 当前的小流量频道 ID，0 表示全流量
    canary?: 0;
    extra?: {
      /**
       * @description goofy 团队不建议依赖该字段，能不用则不用
       * 1 表示小流量
       * 3 表示灰度
       * null 表示全流量
       */
      canaryType?: 1 | 3 | null;
    };
  };
}
