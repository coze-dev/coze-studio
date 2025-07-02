import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { type ToolParams } from '@coze-arch/bot-api/playground_api';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import type { PluginApi } from '@coze-arch/bot-api/developer_api';
import type { ShortCutCommand } from '@coze-agent-ide/tool-config';

export enum OpenModeType {
  OnlyOnceAdd = 'only_once_add',
}
// TODO: hzf 两份定义?
export interface SkillsModalProps {
  tabsConfig?: {
    plugin?: {
      list: PluginApi[];
      onChange: (list: PluginApi[]) => void;
    };
    workflow?: {
      list: WorkFlowItemType[];
      onChange: (list: WorkFlowItemType[]) => void;
    };
    datasets?: {
      list: Dataset[];
      onChange: (list: Dataset[]) => void;
    };
    imageFlow?: {
      list: WorkFlowItemType[];
      onChange: (list: WorkFlowItemType[]) => void;
    };
  };
  tabs: ('plugin' | 'workflow' | 'datasets' | 'imageFlow')[];
  /** 打开弹窗模式：
   * 默认不传
   * only_once_add：仅可添加一次后关闭，并返回callback函数
   */
  openMode?: OpenModeType;
  openModeCallback?: (val?: PluginApi | WorkFlowItemType) => void;
  onCancel?: () => void;
}

export interface ToolInfo {
  tool_type: ShortCutCommand['tool_type'] | '';
  tool_params_list: ToolParams[];
  tool_name: string;
  plugin_api_name?: string;
  api_id?: string;
  plugin_id?: string;
  work_flow_id?: string;
}

export type ShortcutEditFormValues = Partial<ShortCutCommand> & {
  use_tool: boolean;
};
