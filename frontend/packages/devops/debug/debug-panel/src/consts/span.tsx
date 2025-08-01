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
  spanCategoryConfigMap,
  spanTypeConfigMap,
  botEnvConfigMap,
} from '@coze-devops/common-modules/query-trace';
import { IconSuccess, IconError, IconWarningInfo } from '@coze-arch/bot-icons';
import { SpanStatus } from '@coze-arch/bot-api/ob_query_api';

import { type SpanStatusConfig } from '../typings';

export const SPAN_TYPE_CONFIG_MAP = spanTypeConfigMap;

export const SPAN_STATUS_CONFIG_MAP: Record<SpanStatus, SpanStatusConfig> = {
  [SpanStatus.Success]: {
    icon: <IconSuccess />,
    className: 'query-execute-status_success',
    label: 'query_status_success',
  },
  [SpanStatus.Broken]: {
    icon: <IconWarningInfo />,
    className: 'query-execute-status_broken',
    label: 'query_status_broken',
  },
  [SpanStatus.Error]: {
    icon: <IconError />,
    className: 'query-execute-status_error',
    label: 'query_status_error',
  },
  [SpanStatus.Unknown]: {
    icon: <IconSuccess />,
    className: 'query-execute-status_unknown',
    label: 'query_status_unknown',
  },
};
export const SPAN_CATEGORY_CONFIG_MAP = spanCategoryConfigMap;

export const BOT_ENV_CONFIG_MAP = botEnvConfigMap;
