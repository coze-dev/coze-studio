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

/* eslint-disable @coze-arch/max-line-per-function */
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { Space, Tree, UIIconButton } from '@coze-arch/bot-semi';
import { IconEditNew, IconDeleteOutline } from '@coze-arch/bot-icons';
import { type infra, type MockRule } from '@coze-arch/bot-api/debugger_api';
import { ROOT_KEY } from '@coze-studio/mockset-shared';

import { transUpperCase } from '../../util/utils';
import {
  type MockDataInfo,
  MockDataStatus,
  MockDataValueType,
  type MockDataWithStatus,
} from '../../util/typings';
import { useTransSchema } from '../../hook/use-trans-schema';
import { BranchType, useGenTreeBranch } from '../../hook/use-gen-tree-branch';

import s from './index.module.less';

interface MockDataCardProps {
  mock?: MockRule;
  schema?: string;
  readOnly?: boolean;
  className?: string;

  onEdit?: (params: MockDataInfo) => void;
  onRemove?: (params: MockDataInfo) => void;
  bizCtx: infra.BizCtx;
}

/** Mock data display card */
export function MockDataCard({
  mock,
  readOnly,
  schema,
  onEdit,
  onRemove,
}: MockDataCardProps) {
  const { formattedResultExample, incompatible, mergedResult } = useTransSchema(
    schema,
    mock?.responseExpect?.responseExpectRule,
  );

  const { branchInfo, prunedData } = useGenTreeBranch(mergedResult);

  const deleteHandler = () => {
    onRemove?.({
      schema,
      mock,
    });
  };

  const editHandler = () => {
    onEdit?.({
      schema,
      mock,
      mergedResultExample: formattedResultExample,
      incompatible,
    });
  };

  const renderBranches = (item: MockDataWithStatus, isLevel0Item: boolean) => {
    const branchThisRow = item?.key ? branchInfo[item.key] : undefined;

    return (
      <span className={s['card-branches']}>
        {branchThisRow?.v.map((type, index) => (
          <span
            key={index}
            className={classNames(
              s['card-branch-v'],
              type !== BranchType.NONE ? s['card-branch-v_visible'] : '',
              type === BranchType.HALF ? s['card-branch-v_half'] : '',
            )}
          />
        ))}
        {!isLevel0Item ? (
          <span
            className={classNames(
              s['card-branch-h'],
              item?.children ? '' : s['card-branch-h_long'],
            )}
          />
        ) : (
          ''
        )}
      </span>
    );
  };

  const renderFieldContent = (item: MockDataWithStatus) => {
    const isRemoved = item?.status === MockDataStatus.REMOVED;

    if (item?.status === MockDataStatus.ADDED) {
      return (
        <MockDataValueSpan
          val={
            item.isRequired
              ? I18n.t('mockset_field_is_required', { field: item?.label })
              : undefined
          }
          className={classNames(
            'ms-[8px]',
            item.isRequired ? s['card-item-text_highlighted'] : '',
          )}
        />
      );
    }

    return (item?.type === MockDataValueType.ARRAY ||
      item?.type === MockDataValueType.OBJECT) &&
      item?.children ? (
      ''
    ) : (
      <MockDataValueSpan
        val={item?.displayValue}
        className={classNames(
          'ms-[8px]',
          isRemoved ? s['card-item-text_highlighted'] : '',
        )}
      />
    );
  };

  // @ts-expect-error -- linter-disable-autofix
  const renderLabel = (_, node?: TreeNodeData) => {
    const item = node as MockDataWithStatus | undefined;
    const isLevel0Item = `${ROOT_KEY}-${item?.label}` === item?.key;
    const isRemoved = item?.status === MockDataStatus.REMOVED;
    const isAdded = item?.status === MockDataStatus.ADDED && item.isRequired;

    return item ? (
      <>
        {renderBranches(item, isLevel0Item)}

        <span
          className={classNames(
            s['card-item'],
            isRemoved || isAdded ? s['card-item-text_highlighted'] : '',
            isRemoved ? s['card-item_deleted'] : '',
          )}
        >
          <span
            className={classNames(
              s['card-item-text'],
              isLevel0Item ? s['card-item-text_primary'] : '',
              isRemoved || isAdded ? s['card-item-text_highlighted'] : '',
            )}
          >
            {item?.label}
          </span>

          {item?.isRequired ? (
            <span
              className={classNames(
                s['card-item-text'],
                s['card-item-text_required'],
              )}
            >
              *
            </span>
          ) : null}

          {!isRemoved && !isAdded ? (
            <span className={classNames(s['card-item-tag'], 'ms-[8px]')}>
              {transUpperCase(item?.type)}
              {item?.type === MockDataValueType.ARRAY
                ? `<${transUpperCase(item?.childrenType)}>`
                : ''}
            </span>
          ) : null}

          {renderFieldContent(item)}
        </span>
      </>
    ) : (
      ''
    );
  };

  const renderData = () => {
    if (
      prunedData?.type === MockDataValueType.ARRAY ||
      prunedData?.type === MockDataValueType.OBJECT
    ) {
      if (prunedData.children?.length) {
        return (
          <Tree
            defaultExpandAll
            treeData={prunedData.children}
            renderLabel={renderLabel}
          />
        );
      } else {
        return (
          <div className={s['card-non-tree-container']}>
            <span
              className={classNames(
                s['card-item-text'],
                s['card-item-text_invalid'],
              )}
            >
              Empty
            </span>
          </div>
        );
      }
    } else {
      return (
        <div className={s['card-non-tree-container']}>
          <MockDataValueSpan val={prunedData?.displayValue} />
        </div>
      );
    }
  };

  return mock?.responseExpect?.responseExpectRule ? (
    <div className={s['mock-data-card']}>
      <div className={s['mock-data-content']}>{renderData()}</div>
      {!readOnly ? (
        <Space className={s['mock-data-card-operations']} spacing={12}>
          <UIIconButton
            icon={<IconEditNew className={s['mock-data-card-edit']} />}
            size="small"
            theme="borderless"
            onClick={editHandler}
          />
          <UIIconButton
            icon={<IconDeleteOutline className={s['mock-data-card-edit']} />}
            size="small"
            theme="borderless"
            onClick={deleteHandler}
          />
        </Space>
      ) : null}
    </div>
  ) : null;
}

const MockDataValueSpan = (props: { val?: string; className?: string }) =>
  props.val ? (
    <span className={classNames(props.className, s['card-item-text'])}>
      {props.val}
    </span>
  ) : (
    <span
      className={classNames(
        props.className,
        s['card-item-text'],
        s['card-item-text_invalid'],
      )}
    >
      Undefined
    </span>
  );
