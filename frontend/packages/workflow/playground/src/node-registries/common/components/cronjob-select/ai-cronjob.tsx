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

import { useCallback, useRef, useState } from 'react';

import classNames from 'classnames';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  workflowApi,
  CopilotType,
  ValueExpression,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozStopCircle, IconCozApply } from '@coze-arch/coze-design/icons';
import {
  AIButton,
  Button,
  IconButton,
  Input,
  Popconfirm,
} from '@coze-arch/coze-design';

import { useRefInput } from '@/hooks/use-ref-input';
import { useGlobalState } from '@/hooks';

import style from './index.module.less';

interface AICronjobSelectProps {
  value?: ValueExpression;
  onChange: (v: ValueExpression | undefined) => void;
  readonly?: boolean;
  node: FlowNodeEntity;
  needRefInput?: boolean;
  hasError?: boolean;
}

const Suffix = ({ onChange }: { onChange: (v: string) => void }) => {
  const [visible, setVisible] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [cronjob, setCronjob] = useState('');
  const [aiGenerating, setAIGenerating] = useState(false);
  const cancelRequest = useRef<(reason?: unknown) => void>();

  const { spaceId, projectId, workflowId } = useGlobalState();
  return (
    <>
      <Popconfirm
        className="w-[330px]"
        title={I18n.t('workflow_start_trigger_cron_ai', {}, '使用 AI 生成')}
        trigger="custom"
        stopPropagation
        onClickOutSide={() => {
          setVisible(false);
        }}
        content={
          <div className="mt-[12px] flex flex-col gap-[12px] text-[12px]">
            <div className="flex flex-col gap-[4px] p-[8px] rounded-mini coz-mg-hglt">
              {/* <div className="font-medium coz-fg-plus">Sample i18n</div> */}
              <div className="coz-fg-primary">
                {I18n.t(
                  'workflow_trigger_cron_gen_sample_placeholder',
                  {},
                  '您可以在提示词中用自然语言如“每天18点”，将会生成对应的Cron表达式 0 18 * * * 表示每天 18 点执行。',
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[4px]">
              <div className="flex justify-between">
                <div className="text-[14px] font-medium coz-fg-plus">
                  {I18n.t('Imageflow_prompt', {}, 'Prompt')}
                </div>
                {!aiGenerating ? (
                  <AIButton
                    size="small"
                    disabled={!prompt}
                    onClick={async () => {
                      try {
                        setAIGenerating(true);

                        const rs = await workflowApi.CopilotGenerate({
                          space_id: spaceId,
                          project_id: projectId ?? '',
                          copilot_type: CopilotType.CRONTAB,
                          query: prompt,
                          workflow_id: workflowId,
                        });

                        setCronjob(rs?.data?.content ?? '');
                      } finally {
                        setAIGenerating(false);
                      }
                    }}
                    color="aihglt"
                  >
                    {I18n.t('workflow_start_trigger_cron_gen', {}, '生成')}
                  </AIButton>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => {
                      try {
                        cancelRequest.current?.('cancel');
                      } finally {
                        setAIGenerating(false);
                      }
                    }}
                    icon={<IconCozStopCircle />}
                    color="aihglt"
                  >
                    {I18n.t('workflow_start_trigger_cron_gen_stop', {}, '停止')}
                  </IconButton>
                )}
              </div>
              <Input
                size="small"
                value={prompt}
                placeholder={I18n.t(
                  'workflow_trigger_cron_gen_prompt_placeholder',
                  {},
                  '示例：每天18点',
                )}
                onChange={setPrompt}
              ></Input>
            </div>

            <div className="flex flex-col gap-[4px]">
              <div className="text-[14px] font-medium coz-fg-plus">
                {I18n.t(
                  'workflow_start_trigger_cron_generated',
                  {},
                  '生成的 Cron 表达式',
                )}
              </div>
              <div className="flex flex-row gap-[8px]">
                <Input
                  loading={aiGenerating}
                  size="small"
                  disabled
                  value={cronjob}
                  onChange={setCronjob}
                ></Input>
                <Button
                  size="small"
                  loading={aiGenerating}
                  disabled={!cronjob}
                  onClick={() => {
                    if (cronjob) {
                      onChange(cronjob);
                      setVisible(false);
                    }
                  }}
                >
                  {I18n.t('workflow_start_trigger_cron_fillin', {}, '填入')}
                </Button>
              </div>
            </div>
          </div>
        }
        visible={visible}
        onVisibleChange={v => {
          setVisible(v);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        okText={''}
        cancelText={I18n.t('workflow_start_trigger_cron_cancel', {}, '取消')}
      >
        <div>
          <AIButton
            size="mini"
            onClick={() => setVisible(true)}
            color="aihglt"
            onlyIcon
          />
        </div>
      </Popconfirm>
    </>
  );
};

export const AICronjobSelect = ({
  value,
  onChange: _onChange,
  readonly,
  node,
  needRefInput = false,
  hasError,
}: AICronjobSelectProps) => {
  const onLiteralChange = useCallback(
    (v: string) => {
      _onChange({
        type: ValueExpressionType.LITERAL,
        content: v,
      });
    },
    [_onChange],
  );

  const isRef = value?.type && ValueExpression.isRef(value);

  const { renderVariableSelect, renderVariableDisplay } = useRefInput({
    value,
    onChange: _onChange,
    readonly,
    node,
    style: { width: '100%' },
    disabledTypes: ViewVariableType.getComplement([ViewVariableType.String]),
  });
  return (
    <div className="w-full flex flex-row gap-[4px]">
      {isRef ? (
        renderVariableDisplay({ needWrapper: true })
      ) : (
        <Input
          error={hasError}
          size="small"
          disabled={readonly}
          className={classNames(['w-full flex-1', style.input])}
          value={value?.content as string}
          placeholder={I18n.t(
            'workflow_start_trigger_cron_ai_sample',
            {},
            '示例：您可以填写 cron 表达式。例如：0 18 * * * 表示每天 18 点执行。',
          )}
          onChange={onLiteralChange}
          suffix={
            <div className="flex flex-row gap-[4px]">
              <Suffix onChange={onLiteralChange} />
              {needRefInput ? (
                <div>
                  {renderVariableSelect(
                    <IconButton
                      size="mini"
                      color="secondary"
                      icon={<IconCozApply className="text-[16px]" />}
                    />,
                  )}
                </div>
              ) : undefined}
            </div>
          }
        ></Input>
      )}
    </div>
  );
};
