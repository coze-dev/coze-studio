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
 
import { type FC } from 'react';

import classNames from 'classnames';
import { ToolGroupKey } from '@coze-agent-ide/tool-config';
import { I18n } from '@coze-arch/i18n';
import {
  ModelFuncConfigStatus,
  ModelFuncConfigType,
} from '@coze-arch/bot-api/developer_api';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import {
  mergeModelFuncConfigStatus,
  useModelCapabilityConfig,
} from '@coze-agent-ide/bot-editor-context-store';
import { IconCozWarningCircleFillPalette } from '@coze-arch/coze-design/icons';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import { abilityKey2ModelFunctionConfigType } from '../../utils/model-function-config-type-mapping';
import { useGetToolConfig } from '../../hooks/builtin/use-get-tool-config';
import { useAbilityConfig } from '../../hooks/builtin/use-ability-config';

export const TipsDisplay: FC<{
  status?: ModelFuncConfigStatus;
  modelName: string;
  showTooltip?: boolean;
  toolName?: string;
  className?: string;
}> = ({
  status = ModelFuncConfigStatus.FullSupport,
  modelName,
  toolName,
  showTooltip = true,
  className,
}) => {
  if (status === ModelFuncConfigStatus.NotSupport) {
    const content = (
      <Tag
        size="mini"
        color="primary"
        className={classNames('mx-2', className)}
        prefixIcon={
          <IconCozWarningCircleFillPalette className="coz-fg-hglt-red" />
        }
      >
        {I18n.t('not_supported')}
      </Tag>
    );
    if (!showTooltip) {
      return content;
    }
    return (
      <Tooltip
        content={
          toolName
            ? I18n.t('not_supported_explain_toolName', {
                modelName,
                toolName,
              })
            : I18n.t('not_supported_explain', { modelName })
        }
      >
        {content}
      </Tooltip>
    );
  }
  if (status === ModelFuncConfigStatus.PoorSupport) {
    const content = (
      <Tag
        size="mini"
        color="primary"
        className={classNames('mx-2', className)}
        prefixIcon={
          <IconCozWarningCircleFillPalette className="coz-fg-hglt-yellow" />
        }
      >
        {I18n.t('support_poor')}
      </Tag>
    );
    if (!showTooltip) {
      return content;
    }
    return (
      <Tooltip
        content={
          toolName
            ? I18n.t('poorly_supported_explain_toolName', {
                modelName,
                toolName,
              })
            : I18n.t('support_poor_explain', { modelName })
        }
      >
        {content}
      </Tooltip>
    );
  }
  return null;
};

const TipsImpl: FC<{ configType: ModelFuncConfigType }> = ({ configType }) => {
  const modelCapabilityConfig = useModelCapabilityConfig();
  const [configStatus, modelName] = modelCapabilityConfig[configType];
  return <TipsDisplay status={configStatus} modelName={modelName} />;
};

const TipsImplForKnowledge: FC<{
  configType: ModelFuncConfigType;
  toolName: string;
}> = ({ configType, toolName }) => {
  const modelCapabilityConfig = useModelCapabilityConfig();
  const auto = useBotSkillStore(state => state.knowledge.dataSetInfo.auto);
  const [autoConfigStatus, autoModelName] =
    modelCapabilityConfig[
      auto
        ? ModelFuncConfigType.KnowledgeAutoCall
        : ModelFuncConfigType.KnowledgeOnDemandCall
    ];
  // 根据自动调用还是按需调用，获取另一个 status，取合并
  const [configStatus, modelName] = modelCapabilityConfig[configType];
  const mergedStatus = mergeModelFuncConfigStatus(
    autoConfigStatus,
    configStatus,
  );
  const mergedToolTittle: string[] = [];
  if (mergedStatus === configStatus) {
    mergedToolTittle.push(toolName);
  }
  if (mergedStatus === autoConfigStatus) {
    mergedToolTittle.push(
      auto
        ? I18n.t('dataset_automatic_call')
        : I18n.t('dataset_on_demand_call'),
    );
  }
  return (
    <TipsDisplay
      status={mergedStatus}
      modelName={mergedStatus === autoConfigStatus ? autoModelName : modelName}
      // 因为按需调用的提示合并到了这里，知识库显示 tips 时，需要显示具体不支持的能力（按需调用 / 知识库）
      toolName={mergedToolTittle.join(', ')}
    />
  );
};

const ModelCapabilityTipsImpl = () => {
  const { abilityKey } = useAbilityConfig();
  const getToolConfig = useGetToolConfig();
  const toolConfig = getToolConfig(abilityKey);

  const configType = abilityKey
    ? abilityKey2ModelFunctionConfigType(abilityKey)
    : undefined;

  // 降低 useModelCapabilityConfig 调用频率
  if (toolConfig && configType) {
    // 知识库需要引入一个额外的判断是否是按需调用
    if (toolConfig.toolGroupKey === ToolGroupKey.KNOWLEDGE) {
      return (
        <TipsImplForKnowledge
          configType={configType}
          toolName={toolConfig.toolTitle}
        />
      );
    }
    return <TipsImpl configType={configType} />;
  }
  // 不需要渲染任何内容
  return null;
};

export const ModelCapabilityTips = ModelCapabilityTipsImpl;
