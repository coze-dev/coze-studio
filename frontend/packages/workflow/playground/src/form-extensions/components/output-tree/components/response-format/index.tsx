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

import { type FC, Suspense, lazy } from 'react';

import { nanoid } from 'nanoid';
import { WorkflowBatchService } from '@coze-workflow/variable';
import {
  ResponseFormat,
  useNodeTestId,
  ViewVariableType,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconInfo } from '@coze-arch/bot-icons';
import { Select, Tooltip } from '@coze-arch/coze-design';

import { type TreeNodeCustomData } from '../custom-tree-node/type';

// @Coze-arch/bot-md-box-adapter/lazy lazy is md-box's own lazy, mainly lazy to load large packages like mathfull, here our own lazy is for lazy md-box entire package
const LazyMdBox = lazy(async () => {
  const { MdBoxLazy } = await import('@coze-arch/bot-md-box-adapter/lazy');
  return {
    default: MdBoxLazy,
  };
});
interface IResponseFormatSelect {
  readonly?: boolean;
  value?: number;
  outputValue: TreeNodeCustomData[];
  onlyString?: boolean;
  onChange?: (value: TreeNodeCustomData[]) => void;
  onResponseFormatChange?: (value: number) => void;
  isBatch?: boolean;
  testId: string;
}

export const ResponseFormatSelect: FC<IResponseFormatSelect> = props => {
  const {
    readonly,
    value,
    outputValue,
    onlyString,
    onChange,
    onResponseFormatChange,
    isBatch,
    testId,
  } = props;
  const { concatTestId } = useNodeTestId();
  return (
    <Select
      className="overflow-hidden"
      size="small"
      disabled={readonly}
      value={value}
      data-testid={testId}
      // eslint-disable-next-line complexity
      onChange={v => {
        // If you switch to text mode, you need to reset output to only one value of type string
        if (onlyString) {
          let newValue = [
            {
              key: nanoid(),
              name: 'output',
              type: ViewVariableType.String,
            },
          ] as TreeNodeCustomData[];

          if (isBatch) {
            newValue = WorkflowBatchService.singleOutputMetasToList(
              newValue as ViewVariableTreeNode[],
            ) as TreeNodeCustomData[];
            // If there is a value in itself, take the first one, expect: reuse variable name/description
            if (outputValue?.[0]) {
              newValue = [outputValue[0]];
            }
            if (outputValue?.[0].children?.[0]) {
              newValue[0].children = [outputValue?.[0].children?.[0]];
            }
            // Modify type to string only
            if (
              newValue?.[0].children?.[0].type &&
              newValue?.[0].children?.[0].type !== ViewVariableType.String
            ) {
              newValue[0].children[0].type = ViewVariableType.String;
            }
          } else {
            // If there is a value in itself, take the first one, expect: reuse variable name/description
            if (outputValue?.[0]) {
              newValue = [outputValue[0]];
            }
            // Modify type to string only
            if (newValue[0].type !== ViewVariableType.String) {
              newValue[0].type = ViewVariableType.String;
            }
          }
          onChange?.(newValue);
        }
        onResponseFormatChange?.(v as number);
      }}
      prefix={
        <span className="coz-fg-secondary text-base flex items-center ml-1 -mr-1.5">
          <Tooltip
            content={
              <Suspense fallback={null}>
                <LazyMdBox
                  markDown={I18n.t('model_config_response_format_explain')}
                />
              </Suspense>
            }
          >
            <IconInfo className="cursor-pointer coz-fg-dim pl-[2px] pr-[4px]" />
          </Tooltip>
          {I18n.t('devops_publish_multibranch_ModelInfo.ResponseFormat')}
        </span>
      }
    >
      {[
        {
          label: I18n.t(
            'devops_publish_multibranch_ModelInfo.ModelResponseFormat.Text',
          ),
          value: ResponseFormat.Text,
        },
        {
          label: I18n.t(
            'devops_publish_multibranch_ModelInfo.ModelResponseFormat.Markdown',
          ),
          value: ResponseFormat.Markdown,
        },
        {
          label: I18n.t(
            'devops_publish_multibranch_ModelInfo.ModelResponseFormat.JSON',
          ),
          value: ResponseFormat.JSON,
        },
      ].map(option => (
        <Select.Option
          {...option}
          data-testid={concatTestId(testId, `${option.value}`)}
        />
      ))}
    </Select>
  );
};
