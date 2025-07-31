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

import React, { useState } from 'react';

import classNames from 'classnames';
import { type ExpressionEditorTreeNode } from '@coze-workflow/components';
import {
  useAvailableWorkflowVariables,
  useGetWorkflowVariableByKeyPath,
  isGlobalVariableKey,
} from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { VariableExtension } from '@/node-registries/http/components/variable-support';
import { useNodeServiceAndRefreshForTitleChange } from '@/form-extensions/hooks/use-node-available-variables';
import {
  formatDataWithGlobalVariable,
  processDataSourceLabelRender,
} from '@/form-extensions/components/tree-variable-selector/utils';
import { useFormatVariableDataSource } from '@/form-extensions/components/tree-variable-selector/useFormatVariableDataSource';
import useGlobalVariableCache from '@/form-extensions/components/tree-variable-selector/use-global-variable-cache';
import GlobalVarIcon from '@/form-extensions/components/tree-variable-selector/global-var-icon';
import { WORKFLOW_PLAYGROUND_CONTENT_ID } from '@/constants';
import { NodeIcon } from '@/components/node-icon';

import { useVariableWithNodeInfo } from '../hooks/use-variable-with-node';
import { useVariableTree } from '../hooks/use-variable-tree';
import { BaseJsonEditor } from '../../components/base-editor';

import styles from './index.module.less';

interface InnerEditorProps {
  name: string;
  value: string;
  onChange?: (value: string) => void;
  key?: string;
  placeholder?: string | HTMLElement;
  readonly?: boolean;
  disableSuggestion?: boolean;
  disableCounter?: boolean;
  minRows?: number;
  maxLength?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  isError?: boolean;
  isDarkTheme?: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  editerHeight?: string | number;
  padding?: string | number;
  borderRadius?: string | number;
  editorClassName?: string;
}

/**
 * Global variable hint logic layer
 */
export const InnerEditor = React.forwardRef(
  (props: InnerEditorProps, editorRef) => {
    const {
      value,
      onChange,
      placeholder,
      isDarkTheme,
      readonly = false,
      minHeight,
      maxHeight,
      editerHeight,
      padding,
      borderRadius,
      editorClassName,
    } = props;

    const getVariableByKeyPath = useGetWorkflowVariableByKeyPath();
    const allVariables = useAvailableWorkflowVariables();
    const { getNodeInfoInVariableMeta } =
      useNodeServiceAndRefreshForTitleChange();
    const availableVariables = useVariableWithNodeInfo(
      allVariables,
      getNodeInfoInVariableMeta,
    );
    /** Selectable variable data with default backstop */
    const defaultVariableDataSource = useFormatVariableDataSource({
      disabledTypes: [],
    });

    const dataSourceWithGlobal = useGlobalVariableCache(
      defaultVariableDataSource,
    );

    // Process DataSource data, add partial fields/renders
    const variableDataSource = processDataSourceLabelRender({
      dataSource: dataSourceWithGlobal,
      icon: node =>
        isGlobalVariableKey(node.value) ? (
          <GlobalVarIcon nodeId={node.value} />
        ) : (
          <NodeIcon
            size={16}
            alt="logo"
            nodeId={node.value}
            className="leading-[0px]"
          />
        ),
    });

    const variableDataSourceWithGroup =
      formatDataWithGlobalVariable(variableDataSource);

    const variableTree: ExpressionEditorTreeNode[] = useVariableTree({
      variables: allVariables,
      getNodeInfoInVariableMeta,
    });

    const [isHover, setHover] = useState<boolean>(false);

    return (
      <Tooltip
        content={I18n.t('db_table_0129_003')}
        trigger="custom"
        position="top"
        autoAdjustOverflow={false}
        visible={readonly && isHover}
        getPopupContainer={() =>
          document.getElementById(WORKFLOW_PLAYGROUND_CONTENT_ID) ??
          document.body
        }
      >
        <div
          className="w-full h-full"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <BaseJsonEditor
            ref={editorRef}
            readonly={readonly}
            value={value}
            className={classNames(
              styles['editor-render'],
              styles['editor-render-cm-content'],
              editorClassName,
            )}
            placeholder={placeholder}
            // dataTestID={dataTestID}
            onChange={onChange}
            minHeight={minHeight}
            maxHeight={maxHeight}
            editerHeight={editerHeight}
            padding={padding}
            borderRadius={borderRadius}
            isDarkTheme={isDarkTheme}
          />
          <VariableExtension
            readonly={readonly}
            isDarkTheme={isDarkTheme}
            availableVariables={availableVariables}
            variableDataSource={variableDataSourceWithGroup}
            getVariableByKeyPath={getVariableByKeyPath}
            variableTree={variableTree}
            languageId="json"
          />
        </div>
      </Tooltip>
    );
  },
);
