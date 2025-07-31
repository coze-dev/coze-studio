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

import { SpanStatus, SpanCategory } from '@coze-arch/bot-api/ob_query_api';

import { type LabelStyle, type RectStyle } from '../flamethread';
import { type TraceFlamethreadProps } from './typing';

type DefaultProps = Pick<
  TraceFlamethreadProps,
  'rectStyle' | 'labelStyle' | 'rowHeight' | 'globalStyle' | 'datazoomDecimals'
>;

export const defaultProps: DefaultProps = {
  labelStyle: {
    position: 'inside-left',
    fontSize: 12,
    fill: '#1D1C23CC',
  },
  rowHeight: 50,
  globalStyle: {},
  datazoomDecimals: 1,
};

interface SpanCategoryConfig {
  [spanCategory: number]:
    | {
        rectStyle?: RectStyle;
        labelStyle?: LabelStyle;
        name?: string;
      }
    | undefined;
}

export const spanCategoryConfig: SpanCategoryConfig = {
  [SpanCategory.Unknown]: {
    rectStyle: {
      normal: {
        fill: '#F7F7FA',
      },
      hover: {
        fill: '#F0F0F5',
      },
      select: {
        fill: '#C6C6CD',
      },
    },
  },
  [SpanCategory.Start]: {
    rectStyle: {
      normal: {
        fill: '#F1F2FD',
      },
      hover: {
        fill: '#D9DCFA',
      },
      select: {
        fill: '#B4BAF6',
      },
    },
    labelStyle: {},
    name: 'start',
  },
  [SpanCategory.Agent]: {
    rectStyle: {
      normal: {
        fill: '#F6EFFC',
      },
      hover: {
        fill: '#E9D6F9',
      },
      select: {
        fill: '#D1AEF4',
      },
    },
    name: 'invoke agent',
  },
  [SpanCategory.LLMCall]: {
    rectStyle: {
      normal: {
        fill: '#F7F7FA',
      },
      hover: {
        fill: '#F0F0F5',
      },
      select: {
        fill: '#C6C6CD',
      },
    },
    name: 'invoke llm',
  },
  [SpanCategory.Workflow]: {
    rectStyle: {
      normal: {
        fill: '#EDF9EE',
      },
      hover: {
        fill: '#D2F3D5',
      },
      select: {
        fill: '#CFECAC',
      },
    },
    name: 'invoke workflow',
  },

  [SpanCategory.WorkflowStart]: {
    rectStyle: {
      normal: {
        fill: '#EDF9EE',
      },
      hover: {
        fill: '#D2F3D5',
      },
      select: {
        fill: '#CFECAC',
      },
    },
  },
  [SpanCategory.WorkflowEnd]: {
    rectStyle: {
      normal: {
        fill: '#EDF9EE',
      },
      hover: {
        fill: '#D2F3D5',
      },
      select: {
        fill: '#CFECAC',
      },
    },
  },

  [SpanCategory.Plugin]: {
    rectStyle: {
      normal: {
        fill: '#F1F2FD',
      },
      hover: {
        fill: '#D9DCFA',
      },
      select: {
        fill: '#B4BAF6',
      },
    },
    name: 'invoke plugin',
  },
  [SpanCategory.Knowledge]: {
    rectStyle: {
      normal: {
        fill: '#FFEEEF',
      },
      hover: {
        fill: '#FFD2D7',
      },
      select: {
        fill: '#FFA5B2',
      },
    },
    name: 'invoke knowledage',
  },

  [SpanCategory.Code]: {
    rectStyle: {
      normal: {
        fill: '#E5F8F7',
      },
      hover: {
        fill: '#C1F2EF',
      },
      select: {
        fill: '#89E5E0',
      },
    },
    name: 'execute code',
  },
  [SpanCategory.Condition]: {
    rectStyle: {
      normal: {
        fill: '#FFFAEB',
      },
      hover: {
        fill: '#FFF1CC',
      },
      select: {
        fill: '#FFDF99',
      },
    },
    name: 'if condition',
  },
  [SpanCategory.Card]: {
    rectStyle: {
      normal: {
        fill: '#FFFAEB',
      },
      hover: {
        fill: '#FFF1CC',
      },
      select: {
        fill: '#FFDF99',
      },
    },
    name: 'card',
  },
  [SpanCategory.Message]: {
    rectStyle: {
      normal: {
        fill: '#FFFAEB',
      },
      hover: {
        fill: '#FFF1CC',
      },
      select: {
        fill: '#FFDF99',
      },
    },
    name: 'message',
  },
};

interface SpanStatusConfig {
  [spanStatus: string]: {
    tooltip?: {
      fill?: string;
    };
    rectStyle?: RectStyle;
  };
}

export const spanStatusConfig: SpanStatusConfig = {
  [SpanStatus.Success]: {
    tooltip: {
      fill: '#3EC254',
    },
    rectStyle: {
      normal: {
        stroke: '#1D1C2314',
      },
      hover: {},
      select: {},
    },
  },
  [SpanStatus.Error]: {
    tooltip: {
      fill: '#FF441E',
    },
    rectStyle: {
      normal: {
        stroke: '#1D1C2314',
        fill: '#FFF3EE',
      },
      hover: {
        fill: '#FFE0D2',
      },
      select: {
        fill: '#FFBDA5',
      },
    },
  },
  [SpanStatus.Broken]: {
    tooltip: {
      fill: '#FF9600',
    },
  },
  [SpanStatus.Unknown]: {
    tooltip: {
      fill: '#6B6B75',
    },
  },
};

export const tooltipStyle = {
  fill: '#212629',
  shape: {
    symbolType: 'square',
    fill: '#212629',
    size: 5,
  },
};
