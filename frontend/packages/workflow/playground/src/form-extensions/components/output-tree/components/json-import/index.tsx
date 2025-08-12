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

/* eslint-disable @coze-arch/no-deep-relative-import */
import { useEffect, useState, type FC } from 'react';

import classNames from 'classnames';
import type { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozImport } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';

import { JSONEditor } from '../json-editor';
import type { TreeNodeCustomData } from '../custom-tree-node/type';
import { calcIDESideSheetWidth, formatTreeData } from '../../utils';
import { useFitViewport } from '../../../../hooks';
import { useBizIDEState } from '../../../../../hooks/use-biz-ide-state';
import { SingletonInnerSideSheet } from '../../../../../components/workflow-inner-side-sheet';
import { mergeData } from './utils/merge';
import { cutOffInvalidData } from './utils/cut-off';
import { addBatchData } from './utils/batch';
import { addReadOnlyData } from './utils/add-readonly-data';
import { JSONEditorWithState } from './json-editor-with-state';

import styles from './index.module.less';

interface JSONImportProps {
  startField: string;
  treeData: TreeNodeCustomData[];
  disabledTypes: ViewVariableType[];
  disabledTooltip?: string;
  rules: {
    disabled: boolean;
    withRequired: boolean;
    isBatch: boolean;
    onlyString: boolean;
    jsonImport: boolean;
    readonly: boolean;
    topLevelReadonly: boolean;
  };
  hideAddButton: boolean;
  onChange: (value: Array<TreeNodeCustomData>) => void;
  testId?: string;
}

export const JSONImport: FC<JSONImportProps> = props => {
  const {
    startField,
    treeData,
    rules,
    disabledTooltip,
    disabledTypes,
    testId,
    hideAddButton,
  } = props;
  const {
    disabled,
    withRequired,
    isBatch,
    onlyString,
    jsonImport,
    readonly,
    topLevelReadonly,
  } = rules;
  const node = useCurrentEntity();
  const uniqueId = `${node.id}.json_import`;
  const [jsonString, setJsonString] = useState<string>('');
  const [updateKey, setUpdateKey] = useState<number>(0);

  const {
    forceCloseBizIDE,
    isBizIDEOpen,
    uniqueId: bizIDEUniqueId,
  } = useBizIDEState();

  const { setFullscreenPanel } = useNodeFormPanelState();

  const onChange = (data: TreeNodeCustomData[]) => {
    // Add batch data
    const dataWithBatch = addBatchData({ data, isBatch });
    // Merge old and new data
    const mergedData = mergeData({
      newData: dataWithBatch,
      oldData: treeData,
      withRequired,
    });
    // data formatting
    const formattedTreeData: TreeNodeCustomData[] = formatTreeData(
      mergedData,
      startField,
    ).data;
    const allowDepth = 3; // Maximum depth limit
    const allowNameLength = 20; // Name length limit
    // Crop illegal data
    const dataCutoff = cutOffInvalidData({
      data: formattedTreeData,
      isBatch,
      disabledTypes,
      allowDepth: isBatch ? allowDepth + 1 : allowDepth, // The lower level of the batch is deeper
      allowNameLength,
    });

    // Add readonly data (currently only errorBody)
    const dataWithReadonly = addReadOnlyData({
      isBatch,
      treeData,
      data: dataCutoff,
    });

    // update data
    return props.onChange(dataWithReadonly);
  };

  useFitViewport({
    enable: isBizIDEOpen && uniqueId === bizIDEUniqueId,
    nodeId: node.id,
  });

  useEffect(
    () => () => {
      forceCloseBizIDE();
    },
    [],
  );

  useEffect(() => {
    // The child component onChange implicitly depends on isBatch and must force a re-render
    setUpdateKey(updateKey + 1);
  }, [isBatch]);

  useEffect(() => {
    if (onlyString) {
      forceCloseBizIDE();
    }
  }, [onlyString]);

  if (!jsonImport || readonly || topLevelReadonly || onlyString) {
    return <></>;
  }

  return (
    <>
      <div
        className={styles.buttonContainer}
        style={{
          right: hideAddButton ? 16 : 44,
        }}
        data-testid={testId}
      >
        <Tooltip
          content={disabled ? disabledTooltip : I18n.t('workflow_json_import')}
        >
          <IconButton
            className={classNames('!block', {
              [styles.importButton]: true,
              [styles.importButtonDisabled]: disabled,
            })}
            size="small"
            disabled={disabled}
            icon={<IconCozImport className={styles.buttonIcon} />}
            onClick={() => {
              setFullscreenPanel(
                <JSONEditorWithState
                  updateKey={updateKey}
                  uniqueId={uniqueId}
                  onClose={() => {
                    setFullscreenPanel(null);
                  }}
                  onChange={onChange}
                />,
              );
            }}
          ></IconButton>
        </Tooltip>
      </div>
      <SingletonInnerSideSheet
        sideSheetId={uniqueId}
        sideSheetProps={{
          className: styles.sideSheet,
          width: calcIDESideSheetWidth(node?.getNodeMeta()?.size?.width),
          style: {
            position: 'relative',
            overflow: 'auto',
          },
          bodyStyle: {
            padding: 0,
          },
          headerStyle: {
            display: 'none',
          },
          motion: false,
        }}
        mutexWithLeftSideSheet
        closeConfirm={() => {
          forceCloseBizIDE();
          return true;
        }}
      >
        <JSONEditor
          key={updateKey}
          id={uniqueId}
          value={jsonString}
          setValue={(value: string) => {
            setJsonString(value);
          }}
          onClose={() => {
            forceCloseBizIDE();
          }}
          onChange={onChange}
        />
      </SingletonInnerSideSheet>
    </>
  );
};

export const JSONImportPlaceholder: FC<{
  enable: boolean;
  hideAddButton: boolean;
}> = ({ enable, hideAddButton }) => (
  <div style={{ width: hideAddButton ? 32 : 60 }}></div>
);
