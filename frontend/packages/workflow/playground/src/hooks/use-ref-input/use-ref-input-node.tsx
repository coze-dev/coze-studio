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
  useCallback,
  type ReactNode,
  type CSSProperties,
  useState,
} from 'react';

import classNames from 'classnames';
import {
  ValueExpression,
  ValueExpressionType,
  type RefExpression,
  type ViewVariableType,
} from '@coze-workflow/base';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { IconCozApply } from '@coze-arch/coze-design/icons';
import { IconButton, type TreeSelectProps } from '@coze-arch/coze-design';

import {
  RefValueDisplay,
  type RefTagColor,
  type RefValueDisplayProps,
} from '@/form-extensions/components/value-expression-input/ref-value-display';
import {
  type CustomFilterVar,
  type VariableTreeDataNode,
  type RenderDisplayVarName,
} from '@/form-extensions/components/tree-variable-selector/types';
import {
  VariableSelector,
  type VariableSelectorProps,
} from '@/form-extensions/components/tree-variable-selector';
export const useRefInputNode = ({
  value,
  onChange,
  onBlur,
  disabled,
  variablesDataSource,
  validateStatus,
  readonly,
  invalidContent,
  renderDisplayVarName,
  testId,
  disabledTypes,
  showClear = false,
  customFilterVar,
  setFocused,
  style,
  refTagColor,
  hideDeleteIcon,
  variableTagStyle,
  optionFilter,
  renderExtraOption,
  enableSelectNode,
  popoverStyle,
  handleDataSource,
  variableTypeConstraints,
}: {
  value?: ValueExpression;
  onChange: (v: ValueExpression | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  variablesDataSource?: VariableTreeDataNode[];
  validateStatus?: TreeSelectProps['validateStatus'];
  readonly?: boolean;
  testId?: string;
  disabledTypes?: ViewVariableType[];
  showClear?: boolean;
  invalidContent?: string;
  renderDisplayVarName?: RenderDisplayVarName;
  customFilterVar?: CustomFilterVar;
  setFocused?: (focused: boolean) => void;
  style?: CSSProperties;
  refTagColor?: RefTagColor;
  hideDeleteIcon?: boolean;
  variableTagStyle?: CSSProperties;
  optionFilter?: VariableSelectorProps['optionFilter'];
  handleDataSource?: VariableSelectorProps['handleDataSource'];
  renderExtraOption?: (
    data?: TreeNodeData[],
    action?: {
      hiddenPopover: () => void;
    },
  ) => ReactNode;
  enableSelectNode?: boolean;
  popoverStyle?: CSSProperties;
  /* Type restrictions, when the reference type does not meet the restrictions, a warning message is displayed */
  variableTypeConstraints?: RefValueDisplayProps['variableTypeConstraints'];
}) => {
  const onRefChange = useCallback(
    (v: string[] | undefined): void => {
      if (v === undefined) {
        onChange(undefined);
      } else {
        onChange({
          type: ValueExpressionType.REF,
          content: { keyPath: v as string[] },
        });
      }
    },
    [onChange],
  );

  const handleRefRemove = () => {
    onChange?.(undefined);
    onBlur?.();
  };

  const [focused, setStateFocused] = useState(false);
  const _setFocused = useCallback(
    (v: boolean) => {
      setStateFocused(v);
      setFocused?.(v);
    },
    [setFocused],
  );

  const renderVariableSelect = (trigger: ReactNode) =>
    readonly && trigger ? (
      trigger
    ) : (
      <VariableSelector
        testId={testId}
        disabled={disabled}
        disabledTypes={disabledTypes}
        dataSource={variablesDataSource}
        value={
          value && ValueExpression.isRef(value)
            ? (value.content?.keyPath as VariableSelectorProps['value'])
            : undefined
        }
        onChange={onRefChange}
        onBlur={onBlur}
        validateStatus={validateStatus}
        readonly={readonly}
        showClear={showClear}
        customFilterVar={customFilterVar}
        onPopoverVisibleChange={_setFocused}
        trigger={trigger}
        style={style}
        invalidContent={invalidContent}
        renderDisplayVarName={renderDisplayVarName}
        optionFilter={optionFilter}
        renderExtraOption={renderExtraOption}
        enableSelectNode={enableSelectNode}
        popoverStyle={popoverStyle}
        handleDataSource={handleDataSource}
      />
    );

  const renderVariableDisplay = (props?: { needWrapper?: boolean }) =>
    props?.needWrapper ? (
      <div
        className={classNames(
          'w-full max-w-[100%] h-[24px] pr-[4px]',
          'flex flex-row items-center justify-between',
          'bg-transparent hover:bg-background-5 active:bg-background-6',
          'rounded-lg border border-solid coz-stroke-plus hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
          {
            'semi-input-wrapper-error': validateStatus === 'error',
            'coz-stroke-primary': validateStatus !== 'error',
            '!coz-stroke-hglt': focused,
            'pointer-events-none': readonly,
          },
        )}
      >
        {renderVariableDisplay()}
        <div>
          {renderVariableSelect(
            <IconButton
              size="mini"
              color="secondary"
              icon={<IconCozApply className="text-[16px]" />}
            />,
          )}
        </div>
      </div>
    ) : (
      renderVariableSelect(
        <div
          className={classNames(
            'cursor-pointer w-full overflow-hidden flex items-center pl-0.5',
          )}
        >
          <RefValueDisplay
            value={value as RefExpression}
            onClose={handleRefRemove}
            tagColor={refTagColor}
            closable={!hideDeleteIcon}
            style={variableTagStyle}
            variableTypeConstraints={variableTypeConstraints}
            readonly={readonly}
          />
        </div>,
      )
    );
  return {
    renderVariableSelect,
    renderVariableDisplay,
  };
};
