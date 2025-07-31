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

/* eslint-disable max-lines */
import {
  type TraceFlamethreadProps,
  type NodePresetConfig,
  type TraceTreeStyleDefaultProps,
} from '../typings/graph';
import { type LineStyle } from '../common/tree';
import { type RectStyle } from '../common/flamethread';
import { ReactComponent as WorkflowIcon } from '../assets/graph/span-type/icon-workflow.svg';
import { ReactComponent as WorkflowStartIcon } from '../assets/graph/span-type/icon-workflow-start.svg';
import { ReactComponent as WorkflowEndIcon } from '../assets/graph/span-type/icon-workflow-end.svg';
import { ReactComponent as PluginToolIcon } from '../assets/graph/span-type/icon-plugin-tool.svg';
import { ReactComponent as MessageIcon } from '../assets/graph/span-type/icon-message.svg';
import { ReactComponent as LlmCallIcon } from '../assets/graph/span-type/icon-llm-call.svg';
import { ReactComponent as KnowledgeIcon } from '../assets/graph/span-type/icon-knowledge.svg';
import { ReactComponent as ConditionIcon } from '../assets/graph/span-type/icon-condition.svg';
import { ReactComponent as CodeIcon } from '../assets/graph/span-type/icon-code.svg';
import { ReactComponent as CardIcon } from '../assets/graph/span-type/icon-card.svg';
import { ReactComponent as BotIcon } from '../assets/graph/span-type/icon-bot.svg';
import { ReactComponent as AgentIcon } from '../assets/graph/span-type/icon-agent.svg';
import { StatusCode } from './basic';

export const TRACE_TREE_STYLE_DEFAULT_PROPS: TraceTreeStyleDefaultProps = {
  lineStyle: {
    normal: {
      stroke: '#C6C6CD',
      strokeWidth: 1,
    },
    hover: {
      stroke: '#B4BAF6',
      strokeWidth: 2,
    },
    select: {
      stroke: '#B4BAF6',
      strokeWidth: 2,
    },
  },
  globalStyle: {
    nodeBoxHeight: 20,
    verticalInterval: 12,
    offsetX: 10,
  },
};

export const SPAN_STATUS_CONFIG: Record<
  StatusCode,
  {
    lineStyle?: LineStyle;
  }
> = {
  [StatusCode.SUCCESS]: {},
  [StatusCode.ERROR]: {
    lineStyle: {
      normal: {
        stroke: '#FF441E',
      },
      hover: {
        stroke: '#FF441E',
      },
      select: {
        stroke: '#FF441E',
      },
    },
  },
};

export enum PresetSpanType {
  UserInput = 'UserInput',
  ThirdParty = 'ThirdParty',
  ScheduledTasks = 'ScheduledTasks',
  OpenDialog = 'OpenDialog',
  InvokeAgent = 'InvokeAgent',
  RestartAgent = 'RestartAgent',
  SwitchAgent = 'SwitchAgent',
  LLMCall = 'LLMCall',
  LLMBatchCall = 'LLMBatchCall',
  Workflow = 'Workflow',
  WorkflowStart = 'WorkflowStart',
  WorkflowEnd = 'WorkflowEnd',
  PluginTool = 'PluginTool',
  PluginToolBatch = 'PluginToolBatch',
  Knowledge = 'Knowledge',
  Code = 'Code',
  CodeBatch = 'CodeBatch',
  Condition = 'Condition',
  Chain = 'Chain',
  Card = 'Card',
  WorkflowMessage = 'WorkflowMessage',
  WorkflowLLMCall = 'WorkflowLLMCall',
  WorkflowLLMBatchCall = 'WorkflowLLMBatchCall',
  WorkflowCode = 'WorkflowCode',
  WorkflowCodeBatch = 'WorkflowCodeBatch',
  WorkflowCondition = 'WorkflowCondition',
  WorkflowPluginTool = 'WorkflowPluginTool',
  WorkflowPluginToolBatch = 'WorkflowPluginToolBatch',
  WorkflowKnowledge = 'WorkflowKnowledge',
}

export const NODE_PRESET_CONFIG_MAP: Record<PresetSpanType, NodePresetConfig> =
  {
    [PresetSpanType.UserInput]: {
      icon: <BotIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(254, 242, 237)',
          },
          hover: {
            fill: 'rgb(254, 221, 210)',
          },
          select: {
            fill: 'rgb(253, 183, 165)',
          },
        },
      },
    },
    [PresetSpanType.ThirdParty]: {
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(253, 236, 239)',
          },
          hover: {
            fill: 'rgb(251, 207, 216)',
          },
          select: {
            fill: 'rgb(246, 160, 181)',
          },
        },
      },
    },
    [PresetSpanType.ScheduledTasks]: {
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(247, 233, 247)',
          },
          hover: {
            fill: 'rgb(239, 202, 240)',
          },
          select: {
            fill: 'rgb(221, 155, 224)',
          },
        },
      },
    },
    [PresetSpanType.OpenDialog]: {
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(243, 237, 249)',
          },
          hover: {
            fill: 'rgb(226, 209, 244)',
          },
          select: {
            fill: 'rgb(196, 167, 233)',
          },
        },
      },
    },
    [PresetSpanType.InvokeAgent]: {
      icon: <AgentIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(236, 239, 248)',
          },
          hover: {
            fill: 'rgb(209, 216, 240)',
          },
          select: {
            fill: 'rgb(167, 179, 225)',
          },
        },
      },
    },
    [PresetSpanType.RestartAgent]: {
      icon: <AgentIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(234, 245, 255)',
          },
          hover: {
            fill: 'rgb(203, 231, 254)',
          },
          select: {
            fill: 'rgb(152, 205, 253)',
          },
        },
      },
    },
    [PresetSpanType.SwitchAgent]: {
      icon: <AgentIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(233, 247, 253)',
          },
          hover: {
            fill: 'rgb(201, 236, 252)',
          },
          select: {
            fill: 'rgb(149, 216, 248)',
          },
        },
      },
    },

    [PresetSpanType.LLMCall]: {
      icon: <LlmCallIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(229, 247, 248)',
          },
          hover: {
            fill: 'rgb(194, 239, 240)',
          },
          select: {
            fill: 'rgb(138, 221, 226)',
          },
        },
      },
    },

    [PresetSpanType.LLMBatchCall]: {
      icon: <LlmCallIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(228, 247, 244)',
          },
          hover: {
            fill: 'rgb(192, 240, 232)',
          },
          select: {
            fill: 'rgb(135, 224, 211)',
          },
        },
      },
    },

    [PresetSpanType.Workflow]: {
      icon: <WorkflowIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(236, 247, 236)',
          },
          hover: {
            fill: 'rgb(208, 240, 209)',
          },
          select: {
            fill: 'rgb(164, 224, 167)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowStart]: {
      icon: <WorkflowStartIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(243, 248, 236)',
          },
          hover: {
            fill: 'rgb(227, 240, 208)',
          },
          select: {
            fill: 'rgb(200, 226, 165)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowEnd]: {
      icon: <WorkflowEndIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(242, 250, 230)',
          },
          hover: {
            fill: 'rgb(227, 246, 197)',
          },
          select: {
            fill: 'rgb(203, 237, 142)',
          },
        },
      },
    },
    [PresetSpanType.PluginTool]: {
      icon: <PluginToolIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(255, 253, 234)',
          },
          hover: {
            fill: 'rgb(254, 251, 203)',
          },
          select: {
            fill: 'rgb(253, 243, 152)',
          },
        },
      },
    },
    [PresetSpanType.PluginToolBatch]: {
      icon: <PluginToolIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(254, 251, 235)',
          },
          hover: {
            fill: 'rgb(252, 245, 206)',
          },
          select: {
            fill: 'rgb(249, 232, 158)',
          },
        },
      },
    },
    [PresetSpanType.Knowledge]: {
      icon: <KnowledgeIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(255, 248, 234)',
          },
          hover: {
            fill: 'rgb(254, 238, 204)',
          },
          select: {
            fill: 'rgb(254, 217, 152)',
          },
        },
      },
    },
    // from
    [PresetSpanType.Code]: {
      icon: <CodeIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(254, 242, 237)',
          },
          hover: {
            fill: 'rgb(254, 221, 210)',
          },
          select: {
            fill: 'rgb(253, 183, 165)',
          },
        },
      },
    },

    [PresetSpanType.CodeBatch]: {
      icon: <CodeIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(253, 236, 239)',
          },
          hover: {
            fill: 'rgb(251, 207, 216)',
          },
          select: {
            fill: 'rgb(246, 160, 181)',
          },
        },
      },
    },

    [PresetSpanType.Condition]: {
      icon: <ConditionIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(247, 233, 247)',
          },
          hover: {
            fill: 'rgb(239, 202, 240)',
          },
          select: {
            fill: 'rgb(221, 155, 224)',
          },
        },
      },
    },
    [PresetSpanType.Chain]: {
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(243, 237, 249)',
          },
          hover: {
            fill: 'rgb(226, 209, 244)',
          },
          select: {
            fill: 'rgb(196, 167, 233)',
          },
        },
      },
    },
    [PresetSpanType.Card]: {
      icon: <CardIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(236, 239, 248)',
          },
          hover: {
            fill: 'rgb(209, 216, 240)',
          },
          select: {
            fill: 'rgb(167, 179, 225)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowMessage]: {
      icon: <MessageIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(234, 245, 255)',
          },
          hover: {
            fill: 'rgb(203, 231, 254)',
          },
          select: {
            fill: 'rgb(152, 205, 253)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowLLMCall]: {
      icon: <LlmCallIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(233, 247, 253)',
          },
          hover: {
            fill: 'rgb(201, 236, 252)',
          },
          select: {
            fill: 'rgb(149, 216, 248)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowLLMBatchCall]: {
      icon: <LlmCallIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(229, 247, 248)',
          },
          hover: {
            fill: 'rgb(194, 239, 240)',
          },
          select: {
            fill: 'rgb(138, 221, 226)',
          },
        },
      },
    },

    [PresetSpanType.WorkflowCode]: {
      icon: <CodeIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(228, 247, 244)',
          },
          hover: {
            fill: 'rgb(192, 240, 232)',
          },
          select: {
            fill: 'rgb(135, 224, 211)',
          },
        },
      },
    },

    [PresetSpanType.WorkflowCodeBatch]: {
      icon: <CodeIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(236, 247, 236)',
          },
          hover: {
            fill: 'rgb(208, 240, 209)',
          },
          select: {
            fill: 'rgb(164, 224, 167)',
          },
        },
      },
    },

    [PresetSpanType.WorkflowCondition]: {
      icon: <ConditionIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(243, 248, 236)',
          },
          hover: {
            fill: 'rgb(227, 240, 208)',
          },
          select: {
            fill: 'rgb(200, 226, 165)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowPluginTool]: {
      icon: <PluginToolIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(242, 250, 230)',
          },
          hover: {
            fill: 'rgb(227, 246, 197)',
          },
          select: {
            fill: 'rgb(203, 237, 142)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowPluginToolBatch]: {
      icon: <PluginToolIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(255, 253, 234)',
          },
          hover: {
            fill: 'rgb(254, 251, 203)',
          },
          select: {
            fill: 'rgb(253, 243, 152)',
          },
        },
      },
    },
    [PresetSpanType.WorkflowKnowledge]: {
      icon: <KnowledgeIcon />,
      flamethread: {
        rectStyle: {
          normal: {
            fill: 'rgb(254, 251, 235)',
          },
          hover: {
            fill: 'rgb(252, 245, 206)',
          },
          select: {
            fill: 'rgb(249, 232, 158)',
          },
        },
      },
    },
  };

export const FLAME_THREAD_DEFAULT_CONFIG: Pick<
  TraceFlamethreadProps,
  'rectStyle' | 'labelStyle' | 'rowHeight' | 'globalStyle' | 'datazoomDecimals'
> = {
  labelStyle: {
    position: 'inside-left',
    fontSize: 12,
    fill: '#1D1C23CC',
  },
  rowHeight: 50,
  globalStyle: {},
  datazoomDecimals: 1,
};

export const FLAME_THREAD_DEFAULT_RECT_STYLE: RectStyle = {
  normal: {
    fill: '#F7F7FA',
  },
  hover: {
    fill: '#F0F0F5',
  },
  select: {
    fill: '#C6C6CD',
  },
};

export const FLAME_THREAD_DEFAULT_TOOLTIP_STYLE = {
  fill: '#212629',
  shape: {
    symbolType: 'square',
    fill: '#212629',
    size: 5,
  },
};
