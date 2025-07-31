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

/* eslint-disable complexity */
import { type CSSProperties, type FC, useMemo } from 'react';

import classnames from 'classnames';
import {
  getGlobalVariableAlias,
  type RefExpression,
  useWorkflowVariableByKeyPath,
} from '@coze-workflow/variable';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import {
  useNodeTestId,
  // FILE_TYPES,
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
  WorkflowNode,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Popover, Tag } from '@coze-arch/coze-design';

import GlobalVarIcon from '@/form-extensions/components/tree-variable-selector/global-var-icon';
import { NodeIconOutlined } from '@/components/node-icon';

import { useValueExpressionInputContext } from './context';

import styles from './index.module.less';
export enum RefTagColor {
  Primary = 'primary',
  Green = 'green',
}

export interface RefValueDisplayProps {
  value: RefExpression;
  closable?: boolean;
  onClose: () => void;
  tagColor?: RefTagColor;
  style?: CSSProperties;
  /* Type restrictions, when the reference type does not meet the restrictions, a warning message is displayed */
  variableTypeConstraints?: {
    /** Main type restrictions, subtype restrictions are optional*/
    mainType: ViewVariableType;
    /** Subtype restrictions, mainly for subtypes of file types */
    subType?: ViewVariableType[];
  };
  readonly?: boolean;
}

const COLORS_MAP: Record<RefTagColor, [string, string]> = {
  [RefTagColor.Primary]: ['coz-fg-dim', 'coz-fg-primary'],
  [RefTagColor.Green]: ['coz-fg-hglt-green-dim', 'coz-fg-hglt-green'],
};

export const RefValueDisplay: FC<RefValueDisplayProps> = props => {
  const {
    onClose,
    value,
    closable = true,
    style,
    tagColor = RefTagColor.Primary,
    variableTypeConstraints,
    readonly,
  } = props;

  const workflowVariable = useWorkflowVariableByKeyPath(value.content?.keyPath);
  const isNodeVariable = workflowVariable?.keyPath?.length === 1;
  const { testId } = useValueExpressionInputContext();
  const { concatTestId } = useNodeTestId();

  const warningMessage = useMemo(() => {
    if (!variableTypeConstraints) {
      return;
    }
    const constraintTypes = [
      variableTypeConstraints.mainType,
      ...(variableTypeConstraints.subType ?? []),
    ].filter(Boolean);
    const refVariableType = workflowVariable?.viewMeta?.type;
    if (!constraintTypes?.length || !refVariableType) {
      return '';
    }
    if (constraintTypes.includes(refVariableType)) {
      return '';
    }
    return I18n.t('workflow_var_type_same', {
      type: VARIABLE_TYPE_ALIAS_MAP[variableTypeConstraints.mainType],
    });
  }, [workflowVariable, variableTypeConstraints]);

  if (!workflowVariable) {
    return (
      <Tag
        className={classnames(
          'w-full max-w-full min-w-[65%] overflow-hidden pointer-events-auto',
          styles['undefined-ref-tag'],
        )}
        color="yellow"
        closable={readonly ? false : closable}
        onClose={onClose}
        visible
        style={{
          height: 20,
          padding: '0 4px 0 2px',
          ...style,
        }}
      >
        <div className="flex min-w-0 grow gap-[2px] items-center text-[12px] font-medium coz-fg-hglt-yellow">
          <IconCozInfoCircle className="text-[14px]" />
          <span>{I18n.t('workflow_variable_undefined')}</span>
        </div>
      </Tag>
    );
  }

  const node = workflowVariable?.node;
  const nodeDataEntity = node?.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity?.getNodeData<keyof NodeData>();
  const [_dimColor, nameColor] = COLORS_MAP[tagColor];
  const workflowNode = node && new WorkflowNode(node);
  const globalVarAlias = getGlobalVariableAlias(
    workflowVariable.globalVariableKey,
  );
  const renderTag = () => (
    <Tag
      size="mini"
      closable={readonly ? false : closable}
      onClose={onClose}
      className="w-full max-w-full min-w-[65%] overflow-hidden pointer-events-auto"
      color={tagColor}
      visible
      style={{
        height: 20,
        padding: '0 4px 0 1px',
        ...style,
        ...(warningMessage
          ? { backgroundColor: 'var(--coz-mg-hglt-secondary-yellow)' }
          : {}),
      }}
    >
      <div className="flex w-0 grow overflow-hidden">
        <div
          className={classnames('flex min-w-0 grow', {
            'items-center': true,
          })}
          data-testid={concatTestId(testId ?? '', 'ref-value-tag')}
        >
          {
            <>
              {workflowVariable.globalVariableKey ? (
                <span className="flex text-[15px]">
                  <GlobalVarIcon nodeId={workflowVariable.globalVariableKey} />
                </span>
              ) : (
                <NodeIconOutlined
                  icon={workflowNode?.icon || (nodeData?.icon as string)}
                />
              )}
              <span className="coz-fg-secondary truncate ml-0.5 text-[12px] font-medium">
                {workflowNode?.title || nodeData?.title || globalVarAlias}
              </span>
              <span
                className={classnames(
                  'coz-fg-secondary mx-0.5 text-[12px] font-medium',
                  {
                    hidden: isNodeVariable,
                  },
                )}
                style={{ transform: 'scaleX(0.6)' }}
              >
                -
              </span>
            </>
          }
          <div
            className={classnames(nameColor, 'flex-1 truncate font-medium', {
              'text-[12px]': true,
              hidden: isNodeVariable,
            })}
          >
            {workflowVariable.viewMeta?.name}
          </div>
        </div>
      </div>
    </Tag>
  );

  return (
    <Popover
      style={{
        maxWidth: 280,
        padding: '7px 8px',
        border: '1px solid var(--coz-stroke-plus)',
        background: 'var(--coz-bg-max)',
        boxShadow:
          '0px 8px 24px 0px rgba(0, 0, 0, 0.04), 0px 4px 12px 0px rgba(0, 0, 0, 0.08)',
        borderRadius: 8,
        pointerEvents: 'none',
      }}
      position="top"
      content={
        <div
          className="flex flex-col gap-[6px]  text-[12px]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-center font-medium leading-4 overflow-hidden text-ellipsis">
            {workflowVariable.globalVariableKey ? (
              <span className="flex text-[13px]">
                <GlobalVarIcon nodeId={workflowVariable.globalVariableKey} />
              </span>
            ) : (
              <NodeIconOutlined
                icon={workflowNode?.icon || (nodeData?.icon as string)}
                size={14}
              />
            )}
            <span className="coz-fg-secondary truncate ml-1">
              {workflowNode?.title || nodeData?.title || globalVarAlias}
            </span>
            <span
              className="coz-fg-secondary mx-0.5"
              style={{ transform: 'scaleX(0.6)' }}
            >
              -
            </span>
            <span className="text-[#000000] truncate">
              {workflowVariable.viewMeta?.name}
            </span>
            {workflowVariable.viewMeta?.required ? (
              <span
                style={{
                  color: 'var(--light-usage-danger-color-danger,#f93920)',
                }}
              >
                *
              </span>
            ) : null}
            {workflowVariable.viewMeta?.type ? (
              <span className="coz-fg-primary coz-mg-primary text-[10px] leading-4 inline-block ml-1 px-[3px] rounded-mini">
                {VARIABLE_TYPE_ALIAS_MAP[workflowVariable.viewMeta.type]}
              </span>
            ) : null}
          </div>
          {workflowVariable.viewMeta?.description ? (
            <div className="coz-fg-secondary font-normal leading-4 line-clamp-5">
              {workflowVariable.viewMeta.description}
            </div>
          ) : null}
          {warningMessage ? (
            <div className="coz-fg-hglt-yellow font-normal leading-4">
              {warningMessage}
            </div>
          ) : null}
        </div>
      }
    >
      {renderTag()}
    </Popover>
  );
};
