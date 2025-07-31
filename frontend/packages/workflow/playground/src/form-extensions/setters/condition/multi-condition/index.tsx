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

import React, { useEffect, useState, useCallback, type FC } from 'react';

import { isEqual } from 'lodash-es';
import update from 'immutability-helper';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useAutoSyncRenameData } from '@coze-workflow/variable';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {} from '@/hooks/use-update-sorted-port-lines';

import {
  useNodeRenderData,
  useNodeRenderScene,
  useUpdateSortedPortLines,
} from '@/hooks';

import { HiddenCondition } from '../hidden-condition';
import { useConditionValidate } from './validate/use-condition-validate';
import {
  type ConditionValue,
  Logic,
  type ConditionValueWithUid,
  type ConditionBranchValueWithUid,
} from './types';
import { CustomDragLayer } from './draggable/custom-drag-layer';
import { ConditionDraggableContainer } from './draggable/container';
import { DraggableConditionBranchPreview } from './draggable/condition-branch-preview';
import { DraggableConditionBranch } from './draggable/condition-branch';
import { ConditionContextProvider } from './context';
import { ConditionHeader } from './condition-header';

type ConditionProps = SetterComponentProps<ConditionValue>;

const CONDITION_PORT_ID_PREFIX = 'true';

export function ConditionSetter(props: ConditionProps): JSX.Element {
  const { context, value, onChange, readonly } = props;

  const { getNodeTestId, concatTestId } = useNodeTestId();

  const [branches, setBranches] = useState<ConditionValueWithUid>(
    (value ?? []).map((item, index) => ({
      ...item,
      uid: index,
    })),
  );

  const { node } = context;

  const [draggingBranchUid, setDraggingBranchUid] = useState<
    number | undefined
  >();
  const { expanded } = useNodeRenderData();

  const calcPortId = (index: number) => {
    if (index === 0) {
      return CONDITION_PORT_ID_PREFIX;
    } else {
      return `${CONDITION_PORT_ID_PREFIX}_${index}`;
    }
  };

  const updateSortedPortLines = useUpdateSortedPortLines(calcPortId);

  const {
    validateResults,
    initValidateResultsWithBranches,
    validateAllBranches,
  } = useConditionValidate();

  useEffect(() => {
    initValidateResultsWithBranches(value || []);
  }, []);

  useEffect(() => {
    // Monitor the canvas to save the form, and perform an overall verification when submitting
    const disposable = context.onFormValidate(() => {
      validateAllBranches(branches);
    });
    return () => {
      disposable.dispose();
    };
  }, [branches]);

  useEffect(() => {
    if (typeof draggingBranchUid === 'undefined') {
      validateAllBranches(branches);
      onChange?.(
        branches.map(item => ({
          condition: item.condition,
        })),
      );
    } else {
      validateAllBranches(branches);
    }
  }, [branches, draggingBranchUid]);

  useEffect(() => {
    // Here we need to determine whether the external value is consistent with the branches in the state
    // Update branches only when they are inconsistent to avoid endless loops
    if (
      !isEqual(
        value,
        branches.map(item => ({
          condition: item.condition,
        })),
      )
    ) {
      setBranches(
        (value ?? []).map((item, index) => ({
          ...item,
          uid: index,
        })),
      );
    }
  }, [value]);

  useAutoSyncRenameData(branches, {
    onDataRenamed: _branches => {
      setBranches(_branches);
    },
  });

  const handleBranchChange =
    (index: number) => (branch: ConditionBranchValueWithUid) => {
      setBranches(
        branches.map((item, innerIndex) => {
          if (innerIndex === index) {
            return branch;
          } else {
            return item;
          }
        }),
      );
    };

  const calcUid = () => {
    const uidArr = (branches ?? []).reduce<number[]>((buf, branch) => {
      const { uid } = branch;
      if (uid) {
        buf.push(uid);
      }
      return buf;
    }, []);

    return uidArr.length ? Math.max(...uidArr) + 1 : 1;
  };

  const handleAddBranch = () => {
    setBranches(
      branches.concat([
        {
          uid: calcUid(),
          condition: {
            logic: Logic.AND,
            conditions: [
              {
                left: undefined,
                operator: undefined,
                right: undefined,
              },
            ],
          },
        },
      ]),
    );
  };

  const handleDeleteBranch = index => () => {
    // Move the port to be deleted to the end so that the deletion does not affect other connection sequences
    updateSortedPortLines(index, value.length);
    setBranches(branches.filter((item, innerIndex) => innerIndex !== index));
  };

  const handleMoveBranch = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setBranches(prevBranches =>
        update(prevBranches, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevBranches[dragIndex]],
          ],
        }),
      );
    },
    [],
  );

  const handleDragEnd = (startIndex: number, endIndex: number) => {
    setDraggingBranchUid(undefined);
    // When the connection service recalculates the port, the dom may not have been updated yet, so add a delay here to ensure that the dom has been updated when the recalculation is completed
    setTimeout(() => {
      updateSortedPortLines(startIndex, endIndex);
    }, 0);
  };

  const draggingBranch = (branches ?? []).find(
    branch => branch.uid === draggingBranchUid,
  );
  const draggingIndex = (branches ?? []).findIndex(
    branch => branch.uid === draggingBranchUid,
  );

  return (
    <div className="mt-3" style={{ borderBottomWidth: 0, paddingBottom: 0 }}>
      <ConditionContextProvider
        value={{
          flowNodeEntity: node,
          readonly,
          expanded,
          setterPath: concatTestId(getNodeTestId(), context.path),
        }}
      >
        {expanded ? <ConditionHeader onAdd={handleAddBranch} /> : null}
        <ConditionDraggableContainer>
          {branches?.map((branch, index) => (
            <DraggableConditionBranch
              key={branch.uid}
              index={index}
              isFirstBranch={index === 0}
              showDraggable={branches.length > 1}
              priority={branches.length > 1 ? index + 1 : undefined}
              prefixName={
                index === 0
                  ? I18n.t('worklfow_condition_if', {}, 'If')
                  : I18n.t('worklfow_condition_else_if', {}, 'Else if')
              }
              portId={calcPortId(index)}
              branch={branch}
              onChange={handleBranchChange(index)}
              onDelete={handleDeleteBranch(index)}
              deletable={branches.length > 1}
              branchValidateResult={validateResults[index]}
              onDragStart={setDraggingBranchUid}
              onDragEnd={handleDragEnd}
              onMoveBranch={handleMoveBranch}
            />
          ))}
          <CustomDragLayer
            preview={
              typeof draggingBranchUid === 'undefined' ||
              !draggingBranch ? null : (
                <DraggableConditionBranchPreview
                  index={draggingIndex}
                  priority={draggingIndex + 1}
                  prefixName={
                    draggingIndex === 0
                      ? I18n.t('worklfow_condition_if', {}, 'If')
                      : I18n.t('worklfow_condition_else_if', {}, 'Else if')
                  }
                  portId={calcPortId(draggingIndex)}
                  branch={draggingBranch}
                />
              )
            }
          />
        </ConditionDraggableContainer>
      </ConditionContextProvider>
    </div>
  );
}

export const Condition: FC<ConditionProps> = props => {
  const { isNewNodeRender } = useNodeRenderScene();

  if (isNewNodeRender) {
    return <HiddenCondition {...props} />;
  } else {
    return <ConditionSetter {...props} />;
  }
};
