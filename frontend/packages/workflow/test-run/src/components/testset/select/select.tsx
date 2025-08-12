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

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

import { debounce } from 'lodash-es';
import cls from 'classnames';
import { useInViewport } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  Select,
  Modal,
  type SemiSelect,
  type SelectProps,
  Tag,
} from '@coze-arch/coze-design';
import { type CaseDataDetail } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import { useTestsetManageStore } from '../use-testset-manage-store';
import { getTestDataByTestset } from '../../../utils';
import { useTestsetOptions } from './use-testset-options';
import { NormalSelectItem } from './select-item';
import { AutoLoadMore } from './auto-load-more';
import { TestsetAddButton } from './add-button';

import styles from './select.module.less';

export interface TestsetSelectProps {
  disabled?: boolean;
  onSelect?: (
    v: Record<string, unknown>,
    changed?: boolean,
    detail?: CaseDataDetail,
  ) => void;
  className?: string;
  dropdownClassName?: string;
  forbiddenOperation?: boolean;
  placeholder?: string;
  size?: SelectProps['size'];
}

export interface TestsetSelectAPI {
  clear?: () => void;
  openEditPanel?: (data?: CaseDataDetail) => void;
  set?: (data: CaseDataDetail | null) => void;
}

const DEBOUNCE_DELAY = 200;

/** Option key, re-render when updating name, incompatible, input */
function getOptionKey({ caseBase, schemaIncompatible }: CaseDataDetail) {
  return `${caseBase?.caseID}_${caseBase?.name}_${caseBase?.input}_${
    schemaIncompatible ? 0 : 1
  }`;
}

export const TestsetSelect = forwardRef<TestsetSelectAPI, TestsetSelectProps>(
  (
    {
      onSelect,
      disabled,
      className,
      dropdownClassName,
      forbiddenOperation,
      placeholder,
      size,
    },
    ref,
  ) => {
    const { bizCtx, openEditPanel } = useTestsetManageStore(store => ({
      bizCtx: store.bizCtx,
      openEditPanel: store.openEditPanel,
    }));
    const {
      loading,
      loadOptions,
      loadingMore,
      loadMoreOptions,
      optionsData,
      optionsCacheRef,
      optionsDataRef,
    } = useTestsetOptions();
    const selectRef = useRef<SemiSelect>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [loadMoreInView] = useInViewport(loadMoreRef.current);

    const [testset, setTestset] = useState<CaseDataDetail | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => setTestset(null),
      set: setTestset,
      openEditPanel,
    }));

    const handleCloseDropdown = useCallback(() => {
      selectRef.current?.close();
    }, [selectRef]);

    const handleSearch = useCallback(
      debounce((input: string) => {
        loadOptions(input);
      }, DEBOUNCE_DELAY),
      [loadOptions],
    );

    const handleDropdownVisibleChange = useCallback(
      (v: boolean) => {
        if (v) {
          loadOptions();
        }
      },
      [loadOptions],
    );
    const handleSelect = useCallback(
      (val: SelectProps['value']) => {
        if (typeof val !== 'string') {
          return;
        }

        const selectedTestset = optionsCacheRef.current.get(val);
        // Incompatible unselectable
        if (!selectedTestset || selectedTestset.schemaIncompatible) {
          return;
        }
        onSelect?.(
          getTestDataByTestset(selectedTestset),
          selectedTestset?.caseBase?.caseID !== testset?.caseBase?.caseID,
          selectedTestset,
        );
        setTestset(selectedTestset);
      },
      [optionsCacheRef, onSelect, testset],
    );
    const handleEdit = useCallback(
      (v: CaseDataDetail) => {
        openEditPanel(v);
        selectRef.current?.close();
      },
      [openEditPanel, selectRef],
    );
    const handleDelete = useCallback(
      (v: CaseDataDetail) => {
        if (!v.caseBase?.caseID) {
          return;
        }

        selectRef.current?.close();

        const deleteId = v.caseBase?.caseID;
        const deleteTestset = async () => {
          // 1. request to delete
          await debuggerApi.DeleteCaseData({
            bizCtx,
            caseIDs: [deleteId],
          });
          // 2. check if selected
          if (deleteId === testset?.caseBase?.caseID) {
            setTestset(null);
          }
          // 3. reload list
          await loadOptions();
        };

        Modal.error({
          title: I18n.t('workflow_testset_delete_title'),
          content: I18n.t('workflow_testset_delete_tip'),
          cancelText: I18n.t('workflow_testset_delete_cancel'),
          okText: I18n.t('workflow_testset_delete_confirm'),
          onOk: deleteTestset,
        });
      },
      [testset, selectRef, loadOptions],
    );

    useEffect(() => {
      if (
        !optionsDataRef.current.hasNext ||
        !loadMoreInView ||
        loading ||
        loadingMore
      ) {
        return;
      }
      loadMoreOptions();
    }, [loadMoreInView]);

    return (
      <Select
        ref={selectRef}
        value={testset?.caseBase?.caseID}
        placeholder={
          placeholder || I18n.t('workflow_debug_testset_placeholder')
        }
        className={cls(styles['testset-select'], className)}
        dropdownClassName={cls(styles['select-dropdown'], dropdownClassName)}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        filter={true}
        remote={true}
        onSearch={handleSearch}
        emptyContent={I18n.t('workflow_testset_search_empty')}
        renderSelectedItem={() =>
          testset ? testset.caseBase?.name ?? '-' : null
        }
        disabled={disabled}
        outerBottomSlot={
          disabled || forbiddenOperation ? undefined : (
            <TestsetAddButton onOpenEditPanel={handleCloseDropdown} />
          )
        }
        onSelect={handleSelect}
        innerBottomSlot={
          <AutoLoadMore ref={loadMoreRef} noMore={!optionsData.hasNext} />
        }
        size={size}
      >
        {optionsData.list.map(data => {
          const isDefaultCase = data?.caseBase?.isDefault;
          const forbidden =
            forbiddenOperation ||
            (isDefaultCase && data?.creatorID !== bizCtx?.connectorUID);
          return (
            <Select.Option
              key={getOptionKey(data)}
              value={data.caseBase?.caseID}
              disabled={data.schemaIncompatible}
              className={styles['option-option-wrapper']}
            >
              <NormalSelectItem
                forbiddenOperation={forbidden}
                data={data}
                onEdit={handleEdit}
                onDelete={handleDelete}
                disabled={disabled}
                nameExtra={
                  isDefaultCase ? (
                    <Tag
                      className={cls(styles['option-default-tag'], 'ml-8px')}
                      size={'mini'}
                    >
                      默认
                    </Tag>
                  ) : null
                }
              />
            </Select.Option>
          );
        })}
      </Select>
    );
  },
);
