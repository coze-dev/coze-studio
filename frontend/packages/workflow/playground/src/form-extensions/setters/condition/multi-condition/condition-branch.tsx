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

import React, { type ReactNode } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozMinus, IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Tag } from '@coze-arch/coze-design';

import { FormCard } from '../../../components/form-card';
import { type ConditionValidateResult } from './validate/validate';
import { Logic, type ConditionBranchValueWithUid } from './types';
import { useConditionContext } from './context';
import ConditionParamsItem, {
  type ConditionParamsItemProps,
} from './condition-params-item';
import {
  ConditionItemLogic,
  type ConditionItemLogicProps,
} from './condition-item-logic';

import styles from './condition-branch.module.less';

function getDefaultConditionItems() {
  return {
    left: undefined,
    operator: undefined,
    right: undefined,
  };
}

export interface ConditionBranchProps {
  index: number;
  prefixName: string;
  portId?: string;
  titleIcon?: ReactNode;
  branch: ConditionBranchValueWithUid;
  onChange?: (branch: ConditionBranchValueWithUid) => void;
  onDelete?: () => void;
  deletable?: boolean;
  priority?: number;
  isFirstBranch?: boolean;
  branchValidateResult?: ConditionValidateResult[];
}

export const ConditionBranch = (props: ConditionBranchProps) => {
  const { readonly, expanded } = useConditionContext();
  const { concatTestId } = useNodeTestId();
  const { setterPath } = useConditionContext();

  const {
    index: branchIndex,
    branch,
    onChange,
    onDelete,
    deletable = true,
    prefixName,
    priority,
    branchValidateResult,
    titleIcon,
    isFirstBranch,
  } = props;

  const { condition } = branch;

  const handleAdd = () => {
    onChange?.({
      ...branch,
      condition: {
        ...condition,
        logic: condition.logic ?? Logic.AND,
        conditions: (condition.conditions ?? []).concat([
          getDefaultConditionItems(),
        ]),
      },
    });
  };

  const handleLogicChange: ConditionItemLogicProps['onChange'] = logic => {
    onChange?.({
      ...branch,
      condition: {
        ...condition,
        logic,
      },
    });
  };

  const handleConditionItemChange: (
    index: number,
  ) => ConditionParamsItemProps['onDataChange'] = index => conditionItem => {
    const newConditions = condition.conditions.map((item, subIndex) => {
      if (subIndex === index) {
        return {
          ...conditionItem,
        };
      } else {
        return item;
      }
    });
    onChange?.({
      ...branch,
      condition: {
        ...condition,
        conditions: newConditions,
      },
    });
  };

  const handleDeleteBranch = () => {
    // Move the port to be deleted to the end so that the deletion does not affect other connection sequences
    onDelete?.();
  };

  const handleDeleteConditionItem: (
    deleteIndex: number,
  ) => ConditionParamsItemProps['onDelete'] = deleteIndex => () => {
    // removeValidateResult(index);
    const newConditions = condition.conditions.filter(
      (item, subIndex) => subIndex !== deleteIndex,
    );
    if (newConditions.length) {
      onChange?.({
        ...branch,
        condition: {
          ...condition,
          conditions: newConditions,
        },
      });
    } else {
      handleDeleteBranch();
    }
  };

  return (
    <FormCard
      expand={expanded}
      motion={false}
      className="coz-bg-max coz-stroke-plus border border-solid rounded-lg mb-2 !px-2 pb-2"
      header={
        <div className="flex items-center">
          {titleIcon}
          {prefixName}
          {priority ? (
            <Tag className="ml-2" color="primary">
              {I18n.t('worklfow_condition_priority', {}, 'Priority')} {priority}
            </Tag>
          ) : null}
        </div>
      }
      collapsible={false}
      actionButton={
        readonly ? (
          <></>
        ) : (
          <>
            <IconButton
              data-testid={concatTestId(
                setterPath,
                `${branchIndex}`,
                'branch',
                'delete',
              )}
              color="secondary"
              size="small"
              icon={<IconCozMinus className="text-sm" />}
              disabled={!deletable}
              onClick={handleDeleteBranch}
            />
          </>
        )
      }
      portInfo={undefined}
    >
      <div>
        <div
          style={
            readonly
              ? {
                  pointerEvents: 'none',
                }
              : {}
          }
        >
          <div className="flex">
            {condition.conditions.length > 1 && (
              <div className="flex-none w-[50px] mt-4 mb-12">
                <ConditionItemLogic
                  logic={condition.logic}
                  onChange={handleLogicChange}
                  showStroke={condition?.conditions?.length > 1}
                />
              </div>
            )}
            <div className="flex-1">
              {condition.conditions.map((item, index) => (
                <ConditionParamsItem
                  key={index}
                  branchIndex={branchIndex}
                  index={index}
                  readonly={readonly}
                  deletable={!isFirstBranch || index > 0}
                  data={item}
                  onDataChange={handleConditionItemChange(index)}
                  onDelete={handleDeleteConditionItem(index)}
                  className={styles.item}
                  conditionValidateResult={branchValidateResult?.[index]}
                />
              ))}
              <IconButton
                wrapperClass="ml-[48px]"
                size="small"
                color="highlight"
                onClick={handleAdd}
                icon={<IconCozPlus />}
                data-testid={concatTestId(
                  setterPath,
                  `${branchIndex}`,
                  'item',
                  'add',
                )}
              >
                {I18n.t(
                  'worklfow_condition_add_condition',
                  {},
                  'Add condition',
                )}
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
};
